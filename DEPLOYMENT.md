# Trivia Master Deployment Guide

This guide provides instructions for deploying the Trivia Master application to your server. The application uses Next.js for the frontend and backend, with a SQL database for data storage.

## Prerequisites

Before deploying, ensure your server has the following:

- Node.js 16.x or higher
- npm 8.x or higher (or pnpm 7.x or higher)
- SQLite (for development) or PostgreSQL/MySQL (for production)
- A web server like Nginx or Apache (optional, for reverse proxy)
- SSL certificate for HTTPS (recommended for production)

## Deployment Options

There are several ways to deploy the Trivia Master application:

1. **Standard Node.js Deployment**: Deploy as a Node.js application with a process manager
2. **Docker Deployment**: Deploy using Docker containers
3. **Cloudflare Pages Deployment**: Deploy using Cloudflare Pages with Cloudflare D1 database
4. **Vercel Deployment**: Deploy using Vercel platform

This guide will focus on the standard Node.js deployment, which is the most straightforward for self-hosting.

## Standard Node.js Deployment

### 1. Prepare Your Server

Update your server and install required dependencies:

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials
sudo apt install -y build-essential

# Install SQLite (for development)
sudo apt install -y sqlite3

# Verify installations
node -v
npm -v
sqlite3 --version
```

### 2. Set Up the Application

Clone or upload the application to your server:

```bash
# Create a directory for the application
mkdir -p /var/www/trivia-master
cd /var/www/trivia-master

# Copy the application files to this directory
# (You can use scp, rsync, git clone, or any other method)
```

Install dependencies:

```bash
cd /var/www/trivia-master
npm install
# or if using pnpm
# pnpm install
```

### 3. Configure the Database

For production, you should use a more robust database like PostgreSQL or MySQL. However, SQLite can be used for smaller deployments:

```bash
# Create the database directory
mkdir -p .wrangler/state/v3/d1

# Initialize the database with the schema
npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

### 4. Build the Application

Build the Next.js application for production:

```bash
npm run build
# or if using pnpm
# pnpm build
```

### 5. Set Up a Process Manager (PM2)

Install PM2 to keep your application running:

```bash
sudo npm install -g pm2

# Start the application
pm2 start npm --name "trivia-master" -- start

# Set PM2 to start on system boot
pm2 startup
pm2 save
```

### 6. Set Up a Reverse Proxy (Optional but Recommended)

For better performance and security, set up Nginx as a reverse proxy:

```bash
# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/trivia-master
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/trivia-master /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up SSL with Let's Encrypt (Recommended)

Secure your application with HTTPS:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Docker Deployment (Alternative)

If you prefer using Docker, follow these steps:

### 1. Create a Dockerfile

Create a `Dockerfile` in the root of your project:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/wrangler.toml ./wrangler.toml

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Initialize the database and start the application
CMD ["node", "server.js"]
```

### 2. Create a Docker Compose File

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  trivia-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - .wrangler:/app/.wrangler
    restart: unless-stopped
```

### 3. Deploy with Docker Compose

```bash
# Build and start the containers
docker-compose up -d

# Initialize the database
docker-compose exec trivia-app npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

## Cloudflare Pages Deployment (Alternative)

For a fully managed deployment, you can use Cloudflare Pages with Cloudflare D1 database:

1. Create a Cloudflare account if you don't have one
2. Install Wrangler CLI: `npm install -g wrangler`
3. Login to Cloudflare: `wrangler login`
4. Create a D1 database: `wrangler d1 create trivia-db`
5. Update the `wrangler.toml` file with your database ID
6. Deploy to Cloudflare Pages: `wrangler pages deploy .`

## Updating the Application

To update the application:

```bash
# Pull the latest changes or upload new files
cd /var/www/trivia-master

# Install dependencies if needed
npm install

# Rebuild the application
npm run build

# Restart the application
pm2 restart trivia-master
```

## Backup and Restore

Regularly back up your database:

```bash
# For SQLite
cp .wrangler/state/v3/d1/DB.sqlite /backup/trivia-db-$(date +%Y%m%d).sqlite
```

To restore from a backup:

```bash
# Stop the application
pm2 stop trivia-master

# Restore the database
cp /backup/trivia-db-YYYYMMDD.sqlite .wrangler/state/v3/d1/DB.sqlite

# Restart the application
pm2 start trivia-master
```

## Troubleshooting

If you encounter issues:

1. Check the application logs: `pm2 logs trivia-master`
2. Verify the database connection
3. Check server resources (CPU, memory, disk space)
4. Ensure all required ports are open in your firewall

## Performance Optimization

For better performance:

1. Use a CDN for static assets
2. Implement caching strategies
3. Consider scaling horizontally for high traffic
4. Monitor and optimize database queries

## Security Considerations

To enhance security:

1. Keep your server and dependencies updated
2. Use HTTPS for all connections
3. Implement rate limiting
4. Set up proper firewall rules
5. Regularly back up your data
