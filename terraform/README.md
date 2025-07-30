# Infrastructure as Code with Terraform

This directory contains Terraform configuration to provision AWS infrastructure for the e-commerce application.

## 🏗️ What This Creates

- **VPC** with public subnet and internet gateway
- **EC2 instance** (t3.micro) with Ubuntu 22.04
- **Security Group** with HTTP/HTTPS/SSH access
- **Elastic IP** for static IP address
- **Key Pair** for SSH access
- **Automated deployment** via user-data script

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# Install AWS CLI
brew install awscli
aws configure  # Set your AWS credentials
```

### 2. Setup

```bash
cd terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

### 3. Deploy

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

### 4. Access Your Application

After deployment completes:
- Your application will be available at the output IP address
- SSH access: `ssh -i ~/.ssh/your-key ubuntu@<ip-address>`

## 📋 Required Variables

You **must** set these in `terraform.tfvars`:

| Variable | Description | Example |
|----------|-------------|---------|
| `ssh_public_key` | Your SSH public key | `ssh-rsa AAAAB3Nza...` |
| `db_password` | MySQL root password | `SecurePassword123!` |
| `jwt_secret` | JWT signing secret | `your-jwt-secret` |

## 🔧 Configuration Options

### Instance Types
- `t3.micro` - Free tier eligible (default)
- `t3.small` - More memory for higher traffic
- `t3.medium` - Production workloads

### Security
```hcl
# Restrict SSH to your IP only (recommended)
ssh_allowed_ips = ["YOUR.IP.ADDRESS/32"]
```

### Backup Configuration
```hcl
backup_retention_days = 7
```

## 📊 What Gets Deployed

```
┌─────────────────────────────────────┐
│              Internet               │
└─────────────┬───────────────────────┘
              │
    ┌─────────▼─────────┐
    │   Internet Gateway │
    └─────────┬─────────┘
              │
┌─────────────▼───────────────────────┐
│              VPC                    │
│  ┌─────────────────────────────┐    │
│  │       Public Subnet         │    │
│  │  ┌─────────────────────┐    │    │
│  │  │    EC2 Instance     │    │    │
│  │  │  - Ubuntu 22.04     │    │    │
│  │  │  - Docker           │    │    │
│  │  │  - Your App         │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 🔄 Management Commands

```bash
# View current state
terraform show

# Update infrastructure
terraform plan
terraform apply

# Destroy everything (be careful!)
terraform destroy

# Format code
terraform fmt

# Validate configuration
terraform validate
```

## 🔒 Security Features

- **Encrypted EBS volumes**
- **Security groups** with minimal required access
- **Fail2Ban** for SSH protection
- **Automatic security updates**
- **SSH key-based authentication**

## 📈 Automated Setup Features

The user-data script automatically sets up:
- **Daily database backups** (2 AM)
- **Health checks** (every 5 minutes)
- **Log rotation**
- **Basic system monitoring**
- **Fail2Ban security**
- **Automatic security updates**

## 🚨 Production Considerations

For production use:

1. **Enable S3 backend** for Terraform state:
```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "ecommerce/terraform.tfstate"
    region = "eu-west-1"
  }
}
```

2. **Restrict SSH access**:
```hcl
ssh_allowed_ips = ["YOUR.IP.ADDRESS/32"]
```

3. **Use larger instance type**:
```hcl
instance_type = "t3.small"  # or larger
```

4. **Enable Route53 DNS** (uncomment in main.tf)

## 🆘 Troubleshooting

### SSH Connection Issues
```bash
# Check security group allows your IP
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test connectivity
telnet <instance-ip> 22
```

### Application Not Starting
```bash
# SSH to instance and check logs
ssh ubuntu@<instance-ip>
sudo journalctl -u cloud-init -f
tail -f /var/log/user-data.log
```

### Terraform Errors
```bash
# Refresh state
terraform refresh

# Import existing resources
terraform import aws_instance.web i-1234567890abcdef0
```

## 📚 Next Steps

After successful Terraform deployment:
1. **Test your application** - Verify everything works
2. **Set up domain DNS** - Point your domain to the Elastic IP
3. **Enable SSL certificates** - Let's Encrypt will auto-configure
4. **Add monitoring stack** - Prometheus + Grafana (optional)
5. **Implement backup strategy** - Database and application backups
6. **Set up CI/CD integration** - Deploy from GitHub Actions to this infrastructure
