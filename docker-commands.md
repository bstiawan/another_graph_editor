# Docker Build and Push Commands

## Quick Commands

Replace `your-dockerhub-username` with your actual Docker Hub username.

### 1. Build the Image
```bash
docker build -t your-dockerhub-username/another-graph-editor:latest .
```

### 2. Test Locally
```bash
docker run -p 8080:80 your-dockerhub-username/another-graph-editor:latest
```

### 3. Login to Docker Hub
```bash
docker login
```

### 4. Push to Docker Hub
```bash
docker push your-dockerhub-username/another-graph-editor:latest
```

## Advanced Usage

### Create Version Tags
```bash
# Build with version tag
docker build -t your-dockerhub-username/another-graph-editor:v1.0.0 .

# Or tag existing image
docker tag your-dockerhub-username/another-graph-editor:latest your-dockerhub-username/another-graph-editor:v1.0.0

# Push version tag
docker push your-dockerhub-username/another-graph-editor:v1.0.0
```

### Pull and Run from Docker Hub
```bash
# Pull the image
docker pull your-dockerhub-username/another-graph-editor:latest

# Run the image
docker run -p 8080:80 your-dockerhub-username/another-graph-editor:latest
```

## Automated Script

Use the provided `build-and-push.sh` script:

1. Edit the script to set your Docker Hub username
2. Run: `./build-and-push.sh`

## Docker Hub Repository

After pushing, your image will be available at:
`https://hub.docker.com/r/your-dockerhub-username/another-graph-editor` 