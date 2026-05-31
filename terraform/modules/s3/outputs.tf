output "frontend_bucket_id" {
  description = "Name/ID of the frontend S3 bucket"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "ARN of the frontend S3 bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "frontend_bucket_regional_domain_name" {
  description = "Regional domain name of the frontend S3 bucket (used by CloudFront OAC)"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "images_bucket_name" {
  description = "Name/ID of the images S3 bucket"
  value       = aws_s3_bucket.images.id
}

output "images_bucket_arn" {
  description = "ARN of the images S3 bucket"
  value       = aws_s3_bucket.images.arn
}
