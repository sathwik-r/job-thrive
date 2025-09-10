# EC2 Deployment Guide for Job Thrive

## 1. EC2 Instance Setup

1. Launch an EC2 instance:
   - Choose Ubuntu Server 22.04 LTS
   - Select t2.micro (free tier) or larger based on your needs
   - Configure Security Group:
     ```
     Type        Port    Source
     SSH         22      Your IP
     HTTP        80      0.0.0.0/0
     HTTPS       443     0.0.0.0/0
     Custom TCP  5000    0.0.0.0/0
     ```
   - Create and download your key pair (.pem file)

2. Connect to your instance:
   ```bash
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@your-ec2-public-dns
   ```

## 2. Install Dependencies

Run these commands on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

## 3. Clone and Setup Application

```bash
# Clone your repository
git clone https://github.com/your-username/job-thrive.git
cd job-thrive

# Install dependencies and build
npm install
npm run build
```

## 4. Configure Nginx

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/job-thrive
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name _;  # Catches all domain names

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/job-thrive /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## 5. Start Application

```bash
# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration to start on system reboot
pm2 save
sudo pm2 startup
```

## 6. Access Your Application

Your application will be accessible through:
- EC2 Public IP: http://your-ec2-public-ip
- Your domain (if configured): http://your-domain.com

## 7. SSL Setup (Optional but Recommended)

Install Certbot for HTTPS:
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

## Maintenance Commands

```bash
# View application logs
pm2 logs job-thrive

# Monitor application
pm2 monit

# Restart application
pm2 restart job-thrive

# Update application
git pull
npm install
npm run build
pm2 reload job-thrive
```

## Environment Variables

Make sure to set up your environment variables on the EC2 instance:
1. Create a .env file in your project root
2. Add all required environment variables
3. Restart the application with PM2

## Troubleshooting

1. If the application isn't accessible:
   - Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Check PM2 logs: `pm2 logs`
   - Verify security group settings in EC2 dashboard
   - Ensure nginx is running: `sudo systemctl status nginx`

2. If PM2 isn't starting on reboot:
   - Run `sudo pm2 startup` again
   - Run `pm2 save` after any PM2 configuration changes

3. If you get a 502 Bad Gateway:
   - Check if your application is running: `pm2 status`
   - Verify port 5000 is not blocked: `sudo netstat -tulpn | grep 5000`
   - Check application logs for errors: `pm2 logs`
