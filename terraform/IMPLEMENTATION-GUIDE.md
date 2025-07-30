# 🏗️ Terraform Infrastructure Implementation Guide

## 🎯 **What This Achieves**

You currently have your e-commerce application manually deployed on AWS EC2. This Terraform setup will:

✅ **Codify your entire infrastructure** - No more manual AWS console clicking  
✅ **Make deployments reproducible** - Spin up identical environments instantly  
✅ **Version control your infrastructure** - Track infrastructure changes like code  
✅ **Enable disaster recovery** - Rebuild everything with one command  
✅ **Demonstrate enterprise DevOps skills** - Infrastructure as Code is essential  

## 🚀 **Step-by-Step Implementation**

### **Step 1: Install Prerequisites**

```bash
# Install Terraform (macOS)
brew install terraform

# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Enter your region (e.g., eu-west-1)
# Enter output format: json
```

### **Step 2: Prepare Your Configuration**

```bash
cd terraform

# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your actual values
vim terraform.tfvars
```

**Critical: Set these values in `terraform.tfvars`:**

```hcl
# Generate SSH key if you don't have one:
# ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# Then get the public key: cat ~/.ssh/id_rsa.pub
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAA... your-email@example.com"

# Use the same password from your current deployment
db_password = "your-current-mysql-password"

# Use the same JWT secret from your current .env
jwt_secret = "your-current-jwt-secret"

# Your domain (same as current)
domain_name = "glamprinakis.com"

# Restrict SSH to your IP for security
ssh_allowed_ips = ["YOUR.IP.ADDRESS/32"]
```

### **Step 3: Deploy Infrastructure**

```bash
# Initialize Terraform (downloads AWS provider)
terraform init

# See what will be created (always review first!)
terraform plan

# Create the infrastructure
terraform apply
# Type 'yes' when prompted
```

### **Step 4: What Happens During Deployment**

```
🔄 Creating VPC and networking...
🔄 Creating security groups...
🔄 Creating EC2 instance...
🔄 Assigning Elastic IP...
🔄 Running user-data script...
   ├── Installing Docker
   ├── Cloning your repository
   ├── Setting up environment
   ├── Building application
   └── Starting services
✅ Deployment complete!
```

### **Step 5: Verify Your Deployment**

```bash
# Get the outputs
terraform output

# You'll see:
# application_url = "https://glamprinakis.com"
# instance_public_ip = "xx.xx.xx.xx"
# ssh_command = "ssh -i ~/.ssh/id_rsa ubuntu@xx.xx.xx.xx"
```

## 🔍 **Understanding What Gets Created**

### **AWS Resources:**
- **VPC** (10.0.0.0/16) - Your private network
- **Public Subnet** (10.0.1.0/24) - Where your server lives
- **Internet Gateway** - Connects to the internet
- **Security Group** - Firewall rules (HTTP/HTTPS/SSH only)
- **EC2 Instance** (t3.micro) - Your server
- **Elastic IP** - Static IP address
- **Key Pair** - For SSH access

### **Automated Setup (via user-data.sh):**
- Ubuntu 22.04 with latest updates
- Docker and Docker Compose installation
- Your application cloned and deployed
- SSL certificates configured
- Database initialized
- Health checks configured
- Backup scripts installed
- Security hardening (Fail2Ban)

## 🎯 **Current vs Terraform Deployment**

| Aspect | Current Manual | With Terraform |
|--------|----------------|----------------|
| **Setup Time** | Hours of manual work | 5 minutes automated |
| **Reproducibility** | Manual steps, error-prone | Identical every time |
| **Documentation** | In your head | Code is documentation |
| **Disaster Recovery** | Manual rebuild | One command |
| **Team Collaboration** | Hard to share setup | Code can be shared |
| **Version Control** | No infrastructure history | Full git history |

## 🔧 **Management Commands**

```bash
# View current infrastructure
terraform show

# See planned changes before applying
terraform plan

# Apply infrastructure changes
terraform apply

# Format Terraform code
terraform fmt

# Validate configuration
terraform validate

# Destroy everything (BE CAREFUL!)
terraform destroy
```

## 🔒 **Security Features Built-In**

- **Encrypted EBS volumes** - Data at rest encryption
- **Minimal security groups** - Only required ports open
- **SSH key authentication** - No password login
- **Fail2Ban protection** - Automatic IP blocking
- **Automatic security updates** - OS stays patched
- **Non-root application** - Runs as ubuntu user

## 🚨 **Production Best Practices**

### **1. Terraform State Management**
```hcl
# Add this to main.tf for production:
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "ecommerce/terraform.tfstate"
    region = "eu-west-1"
  }
}
```

### **2. Environment Separation**
```bash
# Different tfvars for different environments
terraform apply -var-file="production.tfvars"
terraform apply -var-file="staging.tfvars"
```

### **3. Security Hardening**
```hcl
# In terraform.tfvars - restrict SSH to your IP only
ssh_allowed_ips = ["1.2.3.4/32"]  # Your actual IP
```

## 🆘 **Troubleshooting Guide**

### **Common Issues:**

**1. "Access Denied" errors:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check permissions - you need EC2, VPC, IAM permissions
```

**2. "Key pair already exists":**
```bash
# Either delete existing key in AWS console or change key name
```

**3. "Application not responding":**
```bash
# SSH to instance and check logs
ssh ubuntu@<instance-ip>
tail -f /var/log/user-data.log
docker compose -f docker-compose.prod.yml logs
```

**4. "Can't SSH to instance":**
```bash
# Check security group allows your IP
# Verify you're using correct SSH key
# Wait a few minutes - instance might still be starting
```

## 📈 **Benefits for Your DevOps Career**

### **Demonstrates:**
- **Infrastructure as Code** expertise
- **AWS cloud architecture** understanding
- **Security best practices** implementation
- **Automation mindset** 
- **Disaster recovery** planning
- **Version control** for infrastructure
- **Production-ready** deployments

### **Interview Talking Points:**
- "I automated infrastructure deployment with Terraform"
- "Reduced deployment time from hours to minutes"
- "Eliminated configuration drift with IaC"
- "Implemented security hardening and compliance"
- "Enabled disaster recovery and scaling"

## ✅ **Next Steps After Terraform Success**

1. **Test the deployment** - Verify everything works
2. **Update DNS** - Point domain to new Elastic IP
3. **Backup strategy** - Test database backups
4. **Monitoring** - Add Prometheus/Grafana later
5. **CI/CD integration** - Deploy to this infrastructure from GitHub Actions

---

**Ready to transform your manual infrastructure into code?** Start with Step 1 above! 🚀
