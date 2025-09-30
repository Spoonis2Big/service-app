#!/bin/bash

# Service Management App Deployment Script
# For service.prengerfurniture.com

set -e

echo "🚀 Starting deployment of Service Management App..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "server/index.js" ]; then
    print_error "Please run this script from the root of the service-app directory"
    exit 1
fi

print_status "Validating environment..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm version: $(npm -v) ✓"

# Install dependencies
print_status "Installing server dependencies..."
npm install

print_status "Installing client dependencies..."
cd client
npm install
cd ..

# Build client for production
print_status "Building client for production..."
cd client
npm run build
cd ..

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data uploads logs

# Set up database
print_status "Setting up database..."
node server/setup-database.js

# Copy environment file
if [ ! -f ".env" ]; then
    print_status "Creating production environment file..."
    cp .env.production .env
    print_warning "Please edit .env file with your actual production values"
fi

# Build status
print_status "Build completed successfully!"
echo
echo "Next steps for deployment:"
echo "1. Edit .env file with your production settings"
echo "2. Configure your domain DNS to point to this server"
echo "3. Install and configure SSL certificates"
echo "4. Start the application with: npm run start:prod"
echo
echo "For Docker deployment:"
echo "1. Install Docker and Docker Compose"
echo "2. Run: docker-compose up -d"
echo
print_status "Deployment preparation complete! 🎉"