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

# Start SSH tunnel
echo "🚀 Starting SSH tunnel..."
ssh -i ~/.ssh/deploy_key_ec2 -L 8000:localhost:8000 ubuntu@glamprinakis.com -N &

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
