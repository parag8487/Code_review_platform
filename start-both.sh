#!/bin/bash

echo "Starting both applications..."

# Function to clean up background processes on exit
cleanup() {
    echo "Stopping applications..."
    kill $CODE_REVIEW_PID $LIVE_CLASSROOM_PID 2>/dev/null
    exit
}

# Trap exit signals to clean up
trap cleanup EXIT INT TERM

# Start the Code Review application on port 9002
cd "Code review" && npm run dev &
CODE_REVIEW_PID=$!

# Start the Live Classroom application on port 5000
cd "../live classroom" && npm run dev &
LIVE_CLASSROOM_PID=$!

echo "Both applications started."
echo "Code Review is running on http://localhost:9002"
echo "Live Classroom is running on http://localhost:5000"

# Wait for both processes
wait $CODE_REVIEW_PID
wait $LIVE_CLASSROOM_PID