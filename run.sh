#!/bin/bash

echo "Starting LevelUp Club Application"
echo "================================"

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "Error: Please run this script from the root level-up-club directory"
    exit 1
fi

echo "Starting backend server..."
cd server
npm start &
cd ..

sleep 5

echo "Starting frontend development server..."
cd client
npm run dev &
cd ..

echo ""
echo "Servers started successfully!"
echo "Frontend URL: http://localhost:3000 (or next available port)"
echo "Backend URL: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop the servers"
wait