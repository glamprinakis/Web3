#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# User Data Script for E-commerce Application EC2 Instance
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user-data script at $(date)"

# ─── Update System ─────────────────────────────────────────────
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ─── Install Required Packages ─────────────────────────────────────────────
echo "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    unzip \
    git \
    htop \
    vim \
    fail2ban

# ─── Install Docker ─────────────────────────────────────────────
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# ─── Install Docker Compose (standalone) ─────────────────────────────────────────────
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="2.24.1"
curl -SL "https://github.com/docker/compose/releases/download/v$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# ─── Setup Application Directory ─────────────────────────────────────────────
echo "Setting up application directory..."
PROJECT_DIR="/home/ubuntu/Web3"

# Create ubuntu user if it doesn't exist (it should exist on Ubuntu AMI)
if ! id "ubuntu" &>/dev/null; then
    useradd -m -s /bin/bash ubuntu
fi

# Clone the repository
sudo -u ubuntu git clone https://github.com/glamprinakis/Web3.git "$PROJECT_DIR"
cd "$PROJECT_DIR"

# ─── Create Environment File ─────────────────────────────────────────────
echo "Creating environment file..."
sudo -u ubuntu tee "$PROJECT_DIR/.env" > /dev/null <<EOF
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
ENVIRONMENT=${environment}
DOMAIN_NAME=${domain_name}
EOF

# ─── Set Proper Permissions ─────────────────────────────────────────────
chown -R ubuntu:ubuntu "$PROJECT_DIR"
chmod 600 "$PROJECT_DIR/.env"

# ─── Configure Fail2Ban ─────────────────────────────────────────────
echo "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

# ─── Setup Automatic Updates ─────────────────────────────────────────────
echo "Configuring automatic security updates..."
apt-get install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# ─── Deploy Application ─────────────────────────────────────────────
echo "Building and starting the application..."
cd "$PROJECT_DIR"

# Build frontend
sudo -u ubuntu docker compose -f docker-compose.prod.yml run --rm frontend-builder

# Start all services
sudo -u ubuntu docker compose -f docker-compose.prod.yml up -d --build

# ─── Setup Log Rotation ─────────────────────────────────────────────
echo "Setting up log rotation..."
cat > /etc/logrotate.d/docker-containers <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# ─── Setup Backup Script ─────────────────────────────────────────────
echo "Setting up backup script..."
sudo -u ubuntu mkdir -p "$PROJECT_DIR/backups"

cat > /home/ubuntu/backup-db.sh <<'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/home/ubuntu/Web3/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mysql_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
cd /home/ubuntu/Web3
docker compose -f docker-compose.prod.yml exec -T db mysqldump -u root -p$DB_PASSWORD --all-databases > "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "mysql_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
EOF

chmod +x /home/ubuntu/backup-db.sh
chown ubuntu:ubuntu /home/ubuntu/backup-db.sh

# Add to crontab for daily backups at 2 AM
sudo -u ubuntu crontab -l 2>/dev/null | { cat; echo "0 2 * * * /home/ubuntu/backup-db.sh >> /var/log/backup.log 2>&1"; } | sudo -u ubuntu crontab -

# ─── Setup Monitoring ─────────────────────────────────────────────
echo "Setting up basic monitoring..."

# Create health check script
cat > /home/ubuntu/health-check.sh <<'EOF'
#!/bin/bash
set -euo pipefail

# Check if all containers are running
cd /home/ubuntu/Web3
if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "ERROR: Some containers are not running"
    exit 1
fi

# Check HTTP health
if ! curl -sf http://localhost/api/health > /dev/null; then
    echo "ERROR: Health check endpoint failed"
    exit 1
fi

echo "All checks passed at $(date)"
EOF

chmod +x /home/ubuntu/health-check.sh
chown ubuntu:ubuntu /home/ubuntu/health-check.sh

# Run health check every 5 minutes
sudo -u ubuntu crontab -l 2>/dev/null | { cat; echo "*/5 * * * * /home/ubuntu/health-check.sh >> /var/log/health-check.log 2>&1"; } | sudo -u ubuntu crontab -

# ─── Final Steps ─────────────────────────────────────────────
echo "Waiting for application to start..."
sleep 30

# Test the application
if curl -sf http://localhost/ > /dev/null; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application health check failed"
fi

echo "User-data script completed at $(date)"
echo "Application should be available at: http://${domain_name}"
