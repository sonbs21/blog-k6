output "alb_dns_name" {
  description = "ALB DNS name — use as CNAME or in Route53 alias"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDS primary endpoint"
  value       = aws_db_instance.primary.endpoint
  sensitive   = true
}

output "rds_replica_endpoint" {
  description = "RDS read replica endpoint"
  value       = aws_db_instance.replica.endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket for static assets"
  value       = aws_s3_bucket.assets.bucket
}

output "frontend_public_ips" {
  description = "Public IPs of frontend EC2 instances"
  value       = aws_instance.frontend[*].public_ip
}

output "db_secret_arn" {
  description = "ARN of the DB password secret in Secrets Manager"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "vpc_id" {
  value = aws_vpc.main.id
}
