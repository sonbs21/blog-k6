output "frontend_fqdn" {
  description = "Fully qualified domain name for the frontend"
  value       = aws_route53_record.frontend_a.fqdn
}

output "api_fqdn" {
  description = "Fully qualified domain name for the API"
  value       = aws_route53_record.api_a.fqdn
}
