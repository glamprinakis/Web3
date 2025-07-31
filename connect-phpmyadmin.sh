#!/bin/bash

echo "🔗 Connecting to PhpMyAdmin via SSH tunnel..."
echo "============================================="

# Check if tunnel is already running
if pgrep -f "ssh.*8000:localhost:8000" > /dev/null; then
    echo "✅ SSH tunnel is already running!"
    echo "🌐 Access PhpMyAdmin at: http://localhost:8000"
    echo "👤 Username: root"
    echo "🔑 Password: SecureMySQL2024!#$"
    echo ""
    echo "To stop the tunnel, run: ./disconnect-phpmyadmin.sh"
    exit 0
fi

# Get current server IP from Terraform
echo "🔍 Getting current server IP from Terraform..."
cd terraform 2>/dev/null || { echo "❌ Please run from project root directory"; exit 1; }
SERVER_IP=$(terraform output -raw server_ip 2>/dev/null)
cd .. 2>/dev/null

if [ -z "$SERVER_IP" ]; then
    echo "❌ Could not get server IP from Terraform"
    echo "   Make sure the server is running: ./start-server.sh"
    exit 1
fi

# Start SSH tunnel
echo "🚀 Starting SSH tunnel to $SERVER_IP..."
echo "🔍 Connecting to current server IP: $SERVER_IP"
ssh -i ~/.ssh/deploy_key_ec2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -L 8000:localhost:8000 ubuntu@$SERVER_IP -N &

# Wait a moment for connection
sleep 2

# Check if tunnel started successfully
if pgrep -f "ssh.*8000:localhost:8000" > /dev/null; then
    echo "✅ SSH tunnel connected successfully!"
    echo ""
    echo "🌐 Access PhpMyAdmin at: http://localhost:8000"
    echo "👤 Username: root"
    echo "🔑 Password: SecureMySQL2024!#$"
    echo "📋 Database: lamprinakis_eshop"
    echo ""
    echo "💡 The tunnel is running in the background"
    echo "To stop it, run: ./disconnect-phpmyadmin.sh"
else
    echo "❌ Failed to establish SSH tunnel"
    echo "Please check your SSH key and server connection"
fi
