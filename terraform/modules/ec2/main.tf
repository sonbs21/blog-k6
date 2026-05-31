locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ── Latest Amazon Linux 2023 AMI ─────────────────────────────────────────────
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Security Group ────────────────────────────────────────────────────────────
resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app-sg"
  description = "Allow port 8000 from ALB only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "FastAPI port from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  egress {
    description = "Allow all outbound (package installs, RDS, S3)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-app-sg"
  })
}

# ── IAM role for EC2 ─────────────────────────────────────────────────────────
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${local.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-ec2-role"
  })
}

# SSM Session Manager — SSH-less access
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# S3 read/write for the images bucket
resource "aws_iam_role_policy" "ec2_s3" {
  name = "${local.name_prefix}-ec2-s3-policy"
  role = aws_iam_role.ec2.id

  policy = data.aws_iam_policy_document.ec2_s3.json
}

data "aws_iam_policy_document" "ec2_s3" {
  statement {
    sid    = "AllowImagesS3ReadWrite"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      var.images_bucket_arn,
      "${var.images_bucket_arn}/*",
    ]
  }
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-ec2-profile"
  })
}

# ── EC2 Instance ─────────────────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.app.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  key_name                    = var.key_name != "" ? var.key_name : null

  user_data = templatefile("${path.module}/userdata.sh.tpl", {
    db_username        = var.db_username
    db_password        = var.db_password
    rds_endpoint       = var.rds_endpoint
    db_name            = var.db_name
    secret_key         = var.secret_key
    aws_region         = var.aws_region
    images_bucket_name = var.images_bucket_name
    cloudfront_domain  = var.cloudfront_domain
  })

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true

    tags = merge(var.common_tags, {
      Name = "${local.name_prefix}-app-root"
    })
  }

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-app"
  })

  lifecycle {
    # Avoid replacing the instance when user_data changes after initial deploy
    ignore_changes = [user_data, ami]
  }
}

# ── Elastic IP ────────────────────────────────────────────────────────────────
resource "aws_eip" "app" {
  domain   = "vpc"
  instance = aws_instance.app.id

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-app-eip"
  })
}

# ── ALB Target Group Attachment ───────────────────────────────────────────────
resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = var.alb_target_group_arn
  target_id        = aws_instance.app.id
  port             = 8000
}
