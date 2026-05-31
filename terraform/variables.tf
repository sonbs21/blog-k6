variable "project_name" {
  default = "blog"
}

variable "environment" {
  default = "prod"
}

variable "region" {
  default = "ap-southeast-1"
}

variable "domain_name" {
  description = "Your domain name, e.g. myblog.com"
}

variable "db_name" {
  default = "blogdb"
}

variable "db_username" {
  default = "blogadmin"
}

variable "db_password" {
  sensitive   = true
  description = "Set via TF_VAR_db_password env var"
}

variable "instance_type_frontend" {
  default = "t3.small"
}

variable "instance_type_backend" {
  default = "t3.small"
}

variable "db_instance_class" {
  default = "db.t3.medium"
}

variable "key_name" {
  default     = ""
  description = "EC2 key pair name (optional)"
}

# CIDRs
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_backend_cidrs" {
  default = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "private_rds_cidrs" {
  default = ["10.0.21.0/24", "10.0.22.0/24"]
}

# ASG
variable "asg_min" {
  default = 2
}

variable "asg_max" {
  default = 6
}

variable "asg_desired" {
  default = 2
}
