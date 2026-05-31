resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-rds-subnet-group"
  subnet_ids = aws_subnet.private_rds[*].id
  tags       = { Name = "${local.name_prefix}-rds-subnet-group" }
}

resource "aws_db_parameter_group" "postgres16" {
  name   = "${local.name_prefix}-postgres16"
  family = "postgres16"
  tags   = { Name = "${local.name_prefix}-postgres16-params" }
}

resource "aws_db_instance" "primary" {
  identifier             = "${local.name_prefix}-rds-primary"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = data.aws_secretsmanager_secret_version.db_password.secret_string
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres16.name
  port                   = 5432

  # Storage
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # HA + Backup
  multi_az                = true
  backup_retention_period = 7
  backup_window           = "02:00-03:00"
  maintenance_window      = "Mon:03:00-Mon:04:00"

  # Safety
  deletion_protection = false
  skip_final_snapshot = true
  apply_immediately   = false

  tags = { Name = "${local.name_prefix}-rds-primary" }
}

resource "aws_db_instance" "replica" {
  identifier             = "${local.name_prefix}-rds-replica"
  replicate_source_db    = aws_db_instance.primary.identifier
  instance_class         = var.db_instance_class
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres16.name
  port                   = 5432
  storage_encrypted      = true
  skip_final_snapshot    = true
  apply_immediately      = false
  tags                   = { Name = "${local.name_prefix}-rds-replica" }
}
