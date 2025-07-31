#!/bin/bash

echo "🚀 Starting E-commerce Server..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "   (where terraform/ folder exists)"
    exit 1
fi

# Run environment validation
echo "🔍 Validating environment before starting server..."
./validate-environment.sh
if [ $? -ne 0 ]; then
    echo "❌ Environment validation failed. Please fix the issues above."
    exit 1
fi

# Navigate to terraform directory
cd terraform

echo "🏗️  Deploying infrastructure with Terraform..."
echo "   This will:"
echo "   • Create/start EC2 instance"
echo "   • Allocate Elastic IP"
echo "   • Set up security groups"
echo "   • Deploy your application"
echo ""

# Apply infrastructure
terraform apply -auto-approve

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Server successfully started!"
    echo ""
    
    # Get the server IP
    SERVER_IP=$(terraform output -raw server_ip 2>/dev/null)
    
    if [ ! -z "$SERVER_IP" ]; then
        echo "🌐 Server Information:"
        echo "   • IP Address: $SERVER_IP"
        echo "   • Website: https://glamprinakis.com"
        echo "   • SSH: ssh -i ~/.ssh/deploy_key_ec2 ubuntu@glamprinakis.com"
        echo ""
        echo "⏰ The application deployment may take 2-3 minutes to complete"
        echo "💡 To access PhpMyAdmin, run: ./connect-phpmyadmin.sh"
    else
        echo "⚠️  Server started but couldn't retrieve IP address"
        echo "   Check terraform output manually with: cd terraform && terraform output"
    fi
    
    echo ""
    echo "💰 Server is now running and will incur charges"
    echo "🛑 To stop and save money, run: ./stop-server.sh"
else
    echo ""
    echo "❌ Failed to start server"
    echo "💡 Check Terraform logs above for details"
    echo "   Common issues:"
    echo "   • AWS credentials not configured"
    echo "   • terraform.tfvars file missing"
    echo "   • Insufficient AWS permissions"
fi

cd ..
