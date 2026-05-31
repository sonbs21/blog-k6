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

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution — used to restrict bucket access via OAC"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name — used as an allowed origin for CORS on the images bucket"
  type        = string
}
