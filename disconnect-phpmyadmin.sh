#!/bin/bash

echo "🔌 Disconnecting PhpMyAdmin SSH tunnel..."
echo "========================================"

# Kill SSH tunnel processes
if pgrep -f "ssh.*8000:localhost:8000" > /dev/null; then
    pkill -f "ssh.*8000:localhost:8000"
    echo "✅ SSH tunnel disconnected successfully!"
    echo "🚫 PhpMyAdmin is no longer accessible at localhost:8000"
else
    echo "ℹ️  No SSH tunnel found running"
fi
