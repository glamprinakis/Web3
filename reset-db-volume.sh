#!/bin/bash
echo "🗑️  Resetting MySQL database volume to fix password mismatch"
echo "============================================================="

# Stop all containers
echo "⏹️  Stopping all containers..."
docker compose -f docker-compose.prod.yml down

# Remove the MySQL volume completely (this will delete all data!)
echo "🗑️  Removing MySQL volume (this will delete all database data)..."
docker volume rm web3_mysql-data 2>/dev/null || echo "Volume doesn't exist or already removed"

# Remove any orphaned volumes
echo "🧹 Cleaning up orphaned volumes..."
docker volume prune -f

# List current volumes
echo "📦 Current volumes:"
docker volume ls

echo ""
echo "✅ Database volume reset complete!"
echo "Now when you restart docker-compose, MySQL will initialize with the new password from .env"
echo ""
echo "To restart:"
echo "docker compose -f docker-compose.prod.yml up -d"
