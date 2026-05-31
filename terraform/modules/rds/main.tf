locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ── DB Subnet Group ───────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name        = "${local.name_prefix}-db-subnet-group"
  description = "Subnet group for ${local.name_prefix} RDS"
  subnet_ids  = var.private_subnet_ids

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-db-subnet-group"
  })
}

# ── RDS PostgreSQL Instance ───────────────────────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier = "${local.name_prefix}-postgres"

  # Engine
  engine                = "postgres"
  engine_version        = "16"
  instance_class        = var.instance_class
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_sg_id]
  publicly_accessible    = false

  # Availability
  multi_az = var.multi_az

  # Backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Lifecycle
  deletion_protection      = var.deletion_protection
  skip_final_snapshot      = true
  delete_automated_backups = true

  # Monitoring
  performance_insights_enabled = true

  tags = merge(var.common_tags, {
    Name = "${local.name_prefix}-postgres"
  })
}
