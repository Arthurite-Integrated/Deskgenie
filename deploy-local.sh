#!/bin/bash

# Local Docker deployment script for testing
set -e

APP_NAME="genie"

echo "🚀 Building and running $APP_NAME locally with Docker..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t $APP_NAME:latest .

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop $APP_NAME 2>/dev/null || true
docker rm $APP_NAME 2>/dev/null || true

# Run the container
echo "🏃 Starting container..."
docker run -d \
  --name $APP_NAME \
  -p 4000:4000 \
  --env-file .env \
  --restart unless-stopped \
  $APP_NAME:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q $APP_NAME; then
    echo "✅ Container is running!"
    echo "🌐 Application is available at: http://localhost:4000"
    echo "🔍 Health check: http://localhost:4000/api/health"
    
    # Test health endpoint
    echo "🧪 Testing health endpoint..."
    curl -f http://localhost:4000/api/health || echo "❌ Health check failed"
else
    echo "❌ Container failed to start. Checking logs..."
    docker logs $APP_NAME
fi

echo ""
echo "📊 Container status:"
docker ps | grep $APP_NAME || echo "Container not running"

echo ""
echo "💡 Useful commands:"
echo "  View logs: docker logs $APP_NAME"
echo "  Stop: docker stop $APP_NAME"
echo "  Start: docker start $APP_NAME"
echo "  Remove: docker rm -f $APP_NAME"
