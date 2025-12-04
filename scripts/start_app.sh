#!/bin/bash

# Function to kill process on a port
kill_port() {
  PORT=$1
  PID=$(lsof -ti:$PORT)
  if [ -n "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)..."
    kill -9 $PID
  else
    echo "Port $PORT is free."
  fi
}

echo "Checking ports..."
kill_port 3000
kill_port 5433

echo "Starting Database..."
docker-compose up -d db

echo "Waiting for Database to be ready..."
sleep 5

echo "Starting Frontend..."
npm run dev
