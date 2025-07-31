# ═══════════════════════════════════════════════════════════════
# Outputs for E-commerce Infrastructure
# ═══════════════════════════════════════════════════════════════

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.web.public_ip
}

output "server_ip" {
  description = "Server IP address (alias for instance_public_ip)"
  value       = aws_eip.web.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.web.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "key_pair_name" {
  description = "Name of the key pair"
  value       = aws_key_pair.main.key_name
}

output "application_url" {
  description = "URL to access the application"
  value       = "https://${var.domain_name}"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${aws_key_pair.main.key_name} ubuntu@${aws_eip.web.public_ip}"
}

output "deployment_info" {
  description = "Important deployment information"
  value = {
    instance_type    = var.instance_type
    aws_region      = var.aws_region
    environment     = var.environment
    domain_name     = var.domain_name
    public_ip       = aws_eip.web.public_ip
    instance_id     = aws_instance.web.id
  }
}
