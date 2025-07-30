# ═══════════════════════════════════════════════════════════════
# Variables for E-commerce Infrastructure
# ═══════════════════════════════════════════════════════════════

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Name of the project (used for tagging and naming resources)"
  type        = string
  default     = "ecommerce-app"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "glamprinakis.com"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium" 
  
  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium",
      "t3a.micro", "t3a.small", "t3a.medium"
    ], var.instance_type)
    error_message = "Instance type must be a valid t3 or t3a instance type."
  }
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GB"
  type        = number
  default     = 20
  
  validation {
    condition     = var.root_volume_size >= 8 && var.root_volume_size <= 100
    error_message = "Root volume size must be between 8 and 100 GB."
  }
}

variable "ssh_allowed_ips" {
  description = "List of IP addresses allowed to SSH to the instance"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # WARNING: This allows SSH from anywhere. Restrict in production!
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  # No default - must be provided
}

variable "db_password" {
  description = "MySQL database password"
  type        = string
  sensitive   = true
  # No default - must be provided
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  # No default - must be provided
}

# ─── Optional Variables ─────────────────────────────────────────────

variable "backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
