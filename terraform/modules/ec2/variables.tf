variable "project_name" {
  description = "Project name prefix for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "common_tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_id" {
  description = "ID of a public subnet where the EC2 instance will be placed"
  type        = string
}

variable "alb_sg_id" {
  description = "Security group ID of the ALB (EC2 only accepts traffic from here)"
  type        = string
}

variable "images_bucket_arn" {
  description = "ARN of the images S3 bucket"
  type        = string
}

variable "images_bucket_name" {
  description = "Name of the images S3 bucket"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the backend server"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "EC2 key pair name for SSH access (leave empty to use SSM only)"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS instance endpoint (host:port) used to build DATABASE_URL"
  type        = string
}

variable "secret_key" {
  description = "FastAPI JWT signing secret key (minimum 32 characters)"
  type        = string
  sensitive   = true
}

variable "cloudfront_domain" {
  description = "CloudFront distribution domain name (for ALLOWED_ORIGINS)"
  type        = string
  default     = ""
}

variable "alb_target_group_arn" {
  description = "ARN of the ALB target group to register the instance with"
  type        = string
}
