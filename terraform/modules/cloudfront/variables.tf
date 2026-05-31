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

variable "frontend_bucket_id" {
  description = "S3 bucket ID (name) of the frontend bucket"
  type        = string
}

variable "frontend_bucket_arn" {
  description = "ARN of the frontend S3 bucket"
  type        = string
}

variable "frontend_bucket_domain" {
  description = "Regional domain name of the frontend S3 bucket"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the ALB (used as the API origin)"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
