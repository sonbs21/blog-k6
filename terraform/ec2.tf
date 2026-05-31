resource "aws_instance" "frontend" {
  count                       = 2
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type_frontend
  subnet_id                   = aws_subnet.public[count.index].id
  vpc_security_group_ids      = [aws_security_group.frontend.id]
  associate_public_ip_address = true
  key_name                    = var.key_name != "" ? var.key_name : null
  iam_instance_profile        = aws_iam_instance_profile.frontend.name

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    dnf update -y
    dnf install -y python3.12 python3.12-pip git
    curl -LsSf https://astral.sh/uv/install.sh | sh
    useradd -m -s /bin/bash appuser
  EOF
  )

  tags = { Name = "${local.name_prefix}-frontend-${count.index + 1}" }
}

# IAM for frontend (SSM access)
resource "aws_iam_role" "frontend" {
  name = "${local.name_prefix}-frontend-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "frontend_ssm" {
  role       = aws_iam_role.frontend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "frontend_s3" {
  role       = aws_iam_role.frontend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_instance_profile" "frontend" {
  name = "${local.name_prefix}-frontend-profile"
  role = aws_iam_role.frontend.name
}
