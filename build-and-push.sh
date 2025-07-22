#!/bin/bash

# Configuration
DOCKER_USERNAME="bstiawan"  # Replace with your Docker Hub username
IMAGE_NAME="another-graph-editor"
TAG="latest"
VERSION="v1.0.0"

echo "🚀 Building Docker image..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo "✅ Image built successfully!"
    
    echo "🧪 Testing image locally..."
    # Start container in background
    docker run -d --name test-container -p 8080:80 $DOCKER_USERNAME/$IMAGE_NAME:$TAG
    
    # Wait a moment for container to start
    sleep 3
    
    # Check if container is running
    if docker ps | grep -q test-container; then
        echo "✅ Container is running! You can test at http://localhost:8080"
        echo "Press Enter to continue with push..."
        read
        
        # Stop and remove test container
        docker stop test-container
        docker rm test-container
        
        echo "🔐 Logging into Docker Hub..."
        docker login
        
        if [ $? -eq 0 ]; then
            echo "📤 Pushing image to Docker Hub..."
            docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG
            
            if [ $? -eq 0 ]; then
                echo "✅ Image pushed successfully!"
                echo "🌐 Your image is now available at: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
                
                # Optional: Create version tag
                echo "🏷️  Creating version tag..."
                docker tag $DOCKER_USERNAME/$IMAGE_NAME:$TAG $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
                docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
                echo "✅ Version tag created and pushed!"
            else
                echo "❌ Failed to push image"
            fi
        else
            echo "❌ Failed to login to Docker Hub"
        fi
    else
        echo "❌ Container failed to start"
    fi
else
    echo "❌ Failed to build image"
fi 