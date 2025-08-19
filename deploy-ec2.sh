#!/bin/bash

# EC2 Docker Deployment Script for Genie Next.js App
set -e

# Configuration - Update these values
EC2_HOST="your-ec2-public-ip"
EC2_USER="ubuntu"  # or "ec2-user" for Amazon Linux
EC2_KEY_PATH="~/.ssh/your-key.pem"
APP_NAME="genie"

echo "🚀 Starting EC2 deployment for $APP_NAME..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required variables are set
if [ "$EC2_HOST" = "your-ec2-public-ip" ]; then
    print_error "Please update EC2_HOST with your actual EC2 public IP"
    exit 1
fi

# Step 1: Test SSH connection
print_status "Testing SSH connection to EC2..."
ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" || {
    print_error "Failed to connect to EC2. Check your IP, key path, and security groups."
    exit 1
}

# Step 2: Create deployment directory on EC2
print_status "Creating deployment directory on EC2..."
ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" "mkdir -p ~/$APP_NAME"

# Step 3: Copy files to EC2
print_status "Copying files to EC2..."
scp -i "$EC2_KEY_PATH" -r ./* "$EC2_USER@$EC2_HOST:~/$APP_NAME/"

# Step 4: Setup environment file
print_status "Setting up environment variables..."
cat > .env.prod << EOF
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=http://$EC2_HOST
NEXT_PUBLIC_APP_URL=http://$EC2_HOST
NEXT_PUBLIC_SERVER_URL=http://$EC2_HOST
NEXT_PUBLIC_CLIENT_URL=http://$EC2_HOST
# Add your actual values here:
# NEXT_DATABASE_URL=your_database_url
# NEXT_OPENAI_API_KEY=your_openai_key
# NEXT_GENIE_MAIL_PASSWORD=your_email_password
EOF

scp -i "$EC2_KEY_PATH" .env.prod "$EC2_USER@$EC2_HOST:~/$APP_NAME/.env"
rm .env.prod

# Step 5: Install Docker and Docker Compose on EC2 (if not already installed)
print_status "Installing Docker and Docker Compose on EC2..."
ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
# Update package manager
sudo apt-get update -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "Docker installation completed"
ENDSSH

# Step 6: Deploy the application
print_status "Deploying the application on EC2..."
ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << ENDSSH
cd ~/$APP_NAME

# Stop existing containers
echo "Stopping existing containers..."
sudo docker-compose -f docker-compose.prod.yml down || true

# Build and start new containers
echo "Building and starting new containers..."
sudo docker-compose -f docker-compose.prod.yml up --build -d

# Show container status
echo "Container status:"
sudo docker-compose -f docker-compose.prod.yml ps

# Wait for health check
echo "Waiting for application to be healthy..."
sleep 30

# Test the application
if curl -f http://localhost:4000/api/health; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application health check failed"
    sudo docker-compose -f docker-compose.prod.yml logs
fi
ENDSSH

# Step 7: Final status
print_status "Deployment completed!"
print_status "Your application should be accessible at: http://$EC2_HOST"
print_status "Health check endpoint: http://$EC2_HOST/api/health"

print_warning "Don't forget to:"
print_warning "1. Update your .env file with actual values"
print_warning "2. Configure your security groups to allow HTTP traffic (port 80)"
print_warning "3. Set up SSL certificate for HTTPS in production"

echo ""
echo "🎉 Deployment script completed successfully!"
