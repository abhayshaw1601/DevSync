# DevSync Deployment Guide

This guide covers various deployment options for DevSync.

## Quick Start

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Deployment Options

### 1. Vercel (Recommended - Easiest)

Vercel is the easiest way to deploy Next.js applications.

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variables:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
5. Click "Deploy"

**Environment Variables Required:**
- `MONGODB_URL`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `JWT_SECRET`
- `GITHUB_ID` (optional)
- `GITHUB_SECRET` (optional)

**GitHub OAuth Callback URL:**
```
https://your-domain.vercel.app/api/auth/github/callback
```

### 2. Docker Deployment

#### Using Docker Compose (Includes MongoDB)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devsync.git
cd devsync
```

2. Create `.env` file with your credentials

3. Build and run:
```bash
docker-compose up -d
```

4. Access at `http://localhost:3000`

5. Stop containers:
```bash
docker-compose down
```

#### Using Docker Only

1. Build the image:
```bash
docker build -t devsync .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -e MONGODB_URL="your_mongodb_url" \
  -e PUSHER_APP_ID="your_pusher_app_id" \
  -e PUSHER_KEY="your_pusher_key" \
  -e PUSHER_SECRET="your_pusher_secret" \
  -e PUSHER_CLUSTER="your_cluster" \
  -e NEXT_PUBLIC_PUSHER_KEY="your_pusher_key" \
  -e NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster" \
  -e JWT_SECRET="your_jwt_secret" \
  devsync
```

### 3. Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in the Variables tab
5. Railway will automatically detect Next.js and deploy

### 4. Render

1. Go to [render.com](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables
6. Click "Create Web Service"

### 5. DigitalOcean App Platform

1. Go to [DigitalOcean](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
5. Add environment variables
6. Click "Next" and deploy

### 6. AWS (EC2)

1. Launch an EC2 instance (Ubuntu 22.04 recommended)
2. SSH into your instance
3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Install PM2:
```bash
sudo npm install -g pm2
```

5. Clone and setup:
```bash
git clone https://github.com/yourusername/devsync.git
cd devsync
npm install
npm run build
```

6. Create `.env` file with your credentials

7. Start with PM2:
```bash
pm2 start npm --name "devsync" -- start
pm2 save
pm2 startup
```

8. Setup Nginx as reverse proxy:
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/devsync
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/devsync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Google Cloud Run

1. Install Google Cloud SDK
2. Build and push Docker image:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/devsync
```

3. Deploy:
```bash
gcloud run deploy devsync \
  --image gcr.io/PROJECT_ID/devsync \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URL=your_url,PUSHER_KEY=your_key,..."
```

## Environment Setup

### MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for all IPs)
5. Get connection string from "Connect" > "Connect your application"

### Pusher Setup

1. Go to [pusher.com](https://pusher.com)
2. Sign up for free account
3. Create a new Channels app
4. Copy credentials from "App Keys" tab

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** DevSync
   - **Homepage URL:** `https://your-domain.com`
   - **Authorization callback URL:** `https://your-domain.com/api/auth/github/callback`
4. Copy Client ID and generate Client Secret

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (most platforms do this automatically)
- [ ] Restrict MongoDB access to your server IPs
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Review and update CORS settings if needed
- [ ] Enable rate limiting for API routes
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB

## Monitoring

### Vercel
- Built-in analytics and logs in dashboard
- Real-time function logs

### Docker
```bash
# View logs
docker-compose logs -f app

# Monitor resources
docker stats
```

### PM2 (for VPS)
```bash
# View logs
pm2 logs devsync

# Monitor
pm2 monit
```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20+)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run build`

### Connection Issues
- Verify MongoDB connection string
- Check Pusher credentials
- Ensure environment variables are set correctly

### GitHub OAuth Not Working
- Verify callback URL matches exactly
- Check Client ID and Secret
- Ensure app is not in development mode on GitHub

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB, etc.)
- Deploy multiple instances
- Use Redis for session storage (optional)

### Database Scaling
- MongoDB Atlas auto-scales
- Consider read replicas for high traffic
- Implement caching with Redis

## Backup Strategy

### MongoDB
```bash
# Backup
mongodump --uri="your_mongodb_url" --out=/backup

# Restore
mongorestore --uri="your_mongodb_url" /backup
```

### Automated Backups
- MongoDB Atlas provides automated backups
- Set up cron jobs for custom backup scripts

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Consult platform-specific documentation
- Open an issue on GitHub
