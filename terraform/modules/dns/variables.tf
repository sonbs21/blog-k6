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

variable "domain_name" {
  description = "Root domain name (e.g. yourdomain.com) — must exist as a Route53 hosted zone"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (for frontend alias)"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID (always Z2FDTNDATAQYW2 for CloudFront)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name (for api subdomain alias)"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB Route53 hosted zone ID (for alias record)"
  type        = string
}
