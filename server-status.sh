#!/bin/bash

echo "📊 Server Status Check..."
echo "========================"

# Check if we're in the right directory
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

cd terraform

echo "🔍 Checking Terraform state..."

# Check if terraform state exists
if [ ! -f "terraform.tfstate" ]; then
    echo "❌ No Terraform state found"
    echo "   Server appears to be stopped or never deployed"
    echo "🚀 To start server: ./start-server.sh"
    cd ..
    exit 0
fi

# Get terraform outputs
echo "📋 Terraform Resources:"
terraform show -json | jq -r '.values.root_module.resources[]?.values.tags.Name // empty' 2>/dev/null | sort -u | sed 's/^/   • /'

echo ""
echo "🌐 Server Information:"

# Try multiple ways to get server IP
SERVER_IP=$(terraform output -raw server_ip 2>/dev/null)
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(terraform output server_ip 2>/dev/null | tr -d '"')
fi
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(terraform show -json 2>/dev/null | jq -r '.values.outputs.server_ip.value // empty' 2>/dev/null)
fi

# Check if server is actually reachable
echo "🔍 Testing server connectivity..."
if curl -s --connect-timeout 5 -k https://glamprinakis.com > /dev/null 2>&1; then
    echo "   • Website: https://glamprinakis.com ✅ REACHABLE"
    echo "   • Status: 🟢 RUNNING"
    if [ ! -z "$SERVER_IP" ]; then
        echo "   • IP Address: $SERVER_IP"
    else
        echo "   • IP Address: Unable to retrieve from Terraform"
    fi
    echo ""
    echo "💰 Server is currently incurring charges"
    echo "🛑 To stop and save money: ./stop-server.sh"
    echo "🔗 To access PhpMyAdmin: ./connect-phpmyadmin.sh"
elif [ ! -z "$SERVER_IP" ]; then
    echo "   • IP Address: $SERVER_IP"
    echo "   • Website: https://glamprinakis.com ⚠️ NOT REACHABLE"
    echo "   • Status: � RESOURCES EXIST BUT SERVICE DOWN"
    echo ""
    echo "💰 Server resources exist (may incur charges)"
    echo "🔧 Check server logs or restart services"
    echo "🛑 To stop and save money: ./stop-server.sh"
else
    echo "   • Status: �🔴 STOPPED"
    echo "   • Website: https://glamprinakis.com ❌ NOT REACHABLE"
    echo ""
    echo "💰 No charges (server stopped)"
    echo "🚀 To start server: ./start-server.sh"
fi

cd ..
