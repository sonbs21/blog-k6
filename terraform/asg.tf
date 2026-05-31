resource "aws_launch_template" "backend" {
  name_prefix   = "${local.name_prefix}-backend-"
  image_id      = data.aws_ami.al2023.id
  instance_type = var.instance_type_backend
  key_name      = var.key_name != "" ? var.key_name : null

  iam_instance_profile {
    name = aws_iam_instance_profile.backend.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.backend.id]
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    dnf update -y
    dnf install -y python3.12 python3.12-pip git
    curl -LsSf https://astral.sh/uv/install.sh | sh
    useradd -m -s /bin/bash appuser
    cat > /etc/systemd/system/travel-blog-api.service << 'UNIT'
    [Unit]
    Description=Travel Blog FastAPI Backend
    After=network.target
    [Service]
    User=appuser
    WorkingDirectory=/home/appuser/app/backend
    ExecStart=/home/appuser/.local/bin/uv run fastapi run app/main.py --host 0.0.0.0 --port 3000
    Restart=always
    EnvironmentFile=/home/appuser/app/backend/.env
    [Install]
    WantedBy=multi-user.target
    UNIT
    systemctl daemon-reload
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${local.name_prefix}-backend"
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "backend" {
  name                      = "${local.name_prefix}-backend-asg"
  min_size                  = var.asg_min
  max_size                  = var.asg_max
  desired_capacity          = var.asg_desired
  vpc_zone_identifier       = aws_subnet.private_backend[*].id
  target_group_arns         = [aws_lb_target_group.backend.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 120

  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${local.name_prefix}-backend-asg"
    propagate_at_launch = false
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Scale up when CPU > 70%
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${local.name_prefix}-scale-up"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Scale down when CPU < 30% (step scaling)
resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${local.name_prefix}-scale-down"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "StepScaling"
  adjustment_type        = "ChangeInCapacity"

  step_adjustment {
    metric_interval_upper_bound = 0
    scaling_adjustment          = -1
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${local.name_prefix}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 30

  dimensions = { AutoScalingGroupName = aws_autoscaling_group.backend.name }

  alarm_actions = [aws_autoscaling_policy.scale_down.arn]
}

# IAM for backend
resource "aws_iam_role" "backend" {
  name = "${local.name_prefix}-backend-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_ssm" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "backend_secrets" {
  name = "${local.name_prefix}-backend-secrets"
  role = aws_iam_role.backend.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [aws_secretsmanager_secret.db_password.arn]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "backend" {
  name = "${local.name_prefix}-backend-profile"
  role = aws_iam_role.backend.name
}
