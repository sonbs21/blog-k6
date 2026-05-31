output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Elastic IP address of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "instance_sg_id" {
  description = "Security group ID attached to the EC2 instance"
  value       = aws_security_group.app.id
}
