#!/bin/bash

echo "🛑 Stopping E-commerce Server to Save Money..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "   (where terraform/ folder exists)"
    exit 1
fi

# Run basic validation (lighter check for stopping)
echo "🔍 Quick validation before stopping server..."
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ Terraform configuration not found"
    exit 1
fi

if [ ! -d "terraform/.terraform" ]; then
    echo "⚠️  Terraform not initialized, but proceeding with stop operation..."
fi

# Disconnect PhpMyAdmin tunnel first
echo "🔌 Disconnecting PhpMyAdmin tunnel..."
pkill -f "ssh.*8000:localhost:8000" 2>/dev/null || echo "   No tunnel to disconnect"

# Navigate to terraform directory
cd terraform

echo "🏗️  Destroying infrastructure with Terraform..."
echo "   This will:"
echo "   • Stop the EC2 instance"
echo "   • Release the Elastic IP"
echo "   • Remove all AWS resources"
echo "   • Save you money! 💰"
echo ""

# Destroy infrastructure (but keep Elastic IP)
terraform destroy -auto-approve -target=aws_instance.web -target=aws_eip_association.web

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Server successfully stopped!"
    echo "💰 You're no longer being charged for:"
    echo "   • EC2 instance ✅"
    echo "   • EBS volume ✅"
    echo ""
    echo "💡 IMPORTANT: Elastic IP is preserved!"
    echo "   • Your IP address ($(terraform output -raw server_ip 2>/dev/null || echo 'unknown')) stays the same"
    echo "   • No DNS changes needed when restarting"
    echo "   • Small charge (~$0.005/hour) for unattached EIP"
    echo ""
    echo "🚀 To start the server again, run: ./start-server.sh"
else
    echo ""
    echo "❌ Failed to stop server"
    echo "💡 Check Terraform logs above for details"
    echo "   You may need to manually check AWS console"
fi

cd ..
