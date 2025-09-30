# Service Management App Deployment Guide

This guide will help you deploy the Service Management App to `service.prengerfurniture.com`.

## Prerequisites

- Ubuntu/Debian server with root access
- Domain name `service.prengerfurniture.com` pointing to your server's IP
- Node.js 18+ installed
- Git installed

## Step 1: Production Build

### Frontend Production Build
```bash
cd client
npm run build
```
This creates a `build/` directory with optimized static files.

### Backend Production Configuration
Update server configuration for production environment.

## Step 2: Server Configuration

### Option A: Using a VPS/Dedicated Server
1. Set up reverse proxy (Nginx recommended)
2. Configure SSL certificate
3. Set up PM2 for Node.js process management
4. Configure environment variables

### Option B: Using a Hosting Service
1. Deploy to services like Heroku, DigitalOcean App Platform, or Vercel
2. Configure domain DNS settings
3. Set up environment variables

## Step 3: Domain Configuration
1. Point service.prengerfurniture.com to your server IP
2. Configure DNS A record
3. Set up SSL certificate (Let's Encrypt recommended)

## Step 4: Environment Variables
Create production environment variables for:
- Database path
- Upload directory
- CORS origins
- Port configuration

## Files Created
- `ecosystem.config.js` - PM2 configuration
- `nginx.conf` - Nginx configuration
- `Dockerfile` - Docker configuration (optional)
- `docker-compose.yml` - Docker Compose setup (optional)
- Updated `package.json` scripts
- Production environment configuration