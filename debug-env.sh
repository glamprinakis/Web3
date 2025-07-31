#!/bin/bash
echo "🔍 Environment Debug Script"
echo "=========================="
echo "Current directory: $(pwd)"
echo "Contents of .env file:"
if [ -f ".env" ]; then
    echo "--- .env exists ---"
    cat .env
    echo "--- end .env ---"
else
    echo "❌ .env file not found!"
fi
echo ""
echo "Docker compose environment variables:"
docker compose config | grep -A 20 "environment:"
echo ""
echo "Current environment variables in shell:"
env | grep -E "(DB_|JWT_)" | sort
echo "=========================="
