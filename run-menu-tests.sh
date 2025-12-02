#!/bin/bash

echo "Starting dev server..."
npm run dev > /tmp/vite-server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 15

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "Server is running on port 3000"
    echo "Running menu tests..."
    node test-all-menu-options.js
    TEST_EXIT_CODE=$?
    
    # Kill server
    kill $SERVER_PID 2>/dev/null
    
    exit $TEST_EXIT_CODE
else
    echo "Server failed to start. Check /tmp/vite-server.log"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

