# 🛒 E-commerce Application with Terraform Infrastructure

A full-stack e-commerce application with React frontend, Node.js backend, MySQL database, and automated AWS infrastructure deployment.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │ DNS Provider   │ ────── glamprinakis.com → 79.125.4.130
              │ (Your Domain)  │        (Static Elastic IP)
              └────────────────┘
                      │
    ┌─────────────────▼───────────────────────────────────────────┐
    │                    AWS VPC                                  │
    │  ┌─────────────────────────────────────────────────────┐    │
    │  │              EC2 Instance (Ubuntu 22.04)           │    │
    │  │  ┌─────────────────────────────────────────────┐    │    │
    │  │  │              Docker Compose                 │    │    │
    │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐    │    │    │
    │  │  │  │ Nginx   │ │ Node.js │ │   MySQL 8   │    │    │    │
    │  │  │  │ Proxy   │ │ Backend │ │  Database   │    │    │    │
    │  │  │  │ + React │ │   API   │ │             │    │    │    │
    │  │  │  └─────────┘ └─────────┘ └─────────────┘    │    │    │
    │  │  │  ┌─────────────────────────────────────┐    │    │    │
    │  │  │  │         PhpMyAdmin                  │    │    │    │
    │  │  │  │    (SSH Tunnel Access Only)         │    │    │    │
    │  │  │  └─────────────────────────────────────┘    │    │    │
    │  │  └─────────────────────────────────────────────┘    │    │
    │  └─────────────────────────────────────────────────────┐    │
    └─────────────────────────────────────────────────────────────┘
```

## 🐳 Docker Compose Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Docker Host (EC2 Instance)                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Docker Network: appnet                      │    │
│  │                                                                 │    │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │    │
│  │  │   NGINX PROXY   │    │   NODE.JS API   │    │   MYSQL 8   │  │    │
│  │  │   web3-proxy-1  │    │  web3-backend-1 │    │  web3-db-1  │  │    │
│  │  │                 │    │                 │    │             │  │    │
│  │  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────┐ │  │    │
│  │  │ │React Static │ │    │ │ Express.js  │ │    │ │Database │ │  │    │
│  │  │ │    Files    │ │    │ │    Server   │ │    │ │ Tables  │ │  │    │
│  │  │ │/usr/share/  │ │    │ │   Port 3000 │ │    │ │ - users │ │  │    │
│  │  │ │nginx/html   │ │    │ │             │ │    │ │ - products│  │    │
│  │  │ └─────────────┘ │    │ │ ┌─────────┐ │ │    │ │ - orders│ │  │    │
│  │  │                 │    │ │ │JWT Auth │ │ │    │ │ - carts │ │  │    │
│  │  │ ┌─────────────┐ │    │ │ │MySQL    │ │ │    │ └─────────┘ │  │    │
│  │  │ │nginx.conf   │ │    │ │ │Client   │ │ │    │             │  │    │
│  │  │ │- Static /   │ │    │ │ └─────────┘ │ │    │ ┌─────────┐ │  │    │
│  │  │ │- Proxy /api │ │◄───┤ └─────────────┘ │◄───┤ │Persistent││  │    │
│  │  │ │- SSL Cert   │ │    │                 │    │ │ Volume  │ │  │    │
│  │  │ └─────────────┘ │    │ Environment:    │    │ │mysql-data││  │    │
│  │  │                 │    │ - NODE_ENV=prod │    │ └─────────┘ │  │    │
│  │  │ Ports:          │    │ - DB_HOST=db    │    │             │  │    │
│  │  │ - 80:80 ────────┼────┤ - DB_PASSWORD   │    │ Health Check│  │    │
│  │  │ - 443:443       │    │ - JWT_SECRET    │    │ - mysqladmin│  │    │
│  │  └─────────────────┘    │                 │    │ - table test│  │    │
│  │           │             │ Depends on:     │    └─────────────┘  │    │
│  │           │             │ - db (healthy)  │             ▲       │    │
│  │           │             └─────────────────┘             │       │    │
│  │           │                        │                    │       │    │
│  │           │                        └────────────────────┘       │    │
│  │           │                                                     │    │
│  │           ▼                                                     │    │
│  │  ┌─────────────────┐                              ┌─────────────┘    │
│  │  │   PHPMYADMIN    │                              │                  │
│  │  │web3-phpmyadmin-1│                              │                  │
│  │  │                 │                              │                  │
│  │  │ ┌─────────────┐ │                              │                  │
│  │  │ │ Web Interface││                              │                  │
│  │  │ │ for MySQL   │ │──────────────────────────────┘                  │
│  │  │ │ Database    │ │                                                 │
│  │  │ │ Management  │ │ Environment:                                    │
│  │  │ └─────────────┘ │ - PMA_HOST=db                                   │
│  │  │                 │ - PMA_USER=root                                 │
│  │  │ Port:           │ - PMA_PASSWORD=${DB_PASSWORD}                   │
│  │  │ 127.0.0.1:8000  │                                                 │
│  │  │ (localhost only)│ Depends on: db                                  │
│  │  └─────────────────┘                                                 │
│  │                                                                      │
│  └──────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Host Volumes:                                                          │
│  ├── ./nginx.conf → /etc/nginx/conf.d/default.conf                      │
│  ├── ./react-build → /usr/share/nginx/html                              │
│  ├── ./db → /docker-entrypoint-initdb.d                                 │
│  └── ./certbot/conf → /etc/letsencrypt                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Traffic Flow:
1. Internet → EC2:443/80 → Nginx Container
2. Static Files: Nginx serves React build directly
3. API Requests: Nginx → /api → Node.js Container:3000
4. Database: Node.js → MySQL Container:3306 (internal network)
5. Admin: SSH Tunnel → PhpMyAdmin:8000 → MySQL:3306
```

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with credentials
- Domain registered (pointing to static IP)
- SSH key pair for server access

### 1. Environment Setup
```bash
git clone <repository>
cd human-computer-interaction-main-3

# Configure environment
cp .env.example .env
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values:
# - DB_PASSWORD
# - JWT_SECRET 
# - SSH public key
```

### 2. Deploy Infrastructure
```bash
./start-server.sh    # Creates AWS resources & deploys app
./server-status.sh   # Check deployment status
```

### 3. Access Services
- **Website**: https://glamprinakis.com
- **API Health**: https://glamprinakis.com/api/health
- **Database Admin**: `./connect-phpmyadmin.sh` → http://localhost:8000

## 💰 Cost Management

```bash
./stop-server.sh     # Stop server to save money (~$33/month → ~$4/month)
./start-server.sh    # Restart with same IP address
```

**Cost Breakdown:**
- **Running**: ~$33/month (EC2 + EBS)
- **Stopped**: ~$4/month (Elastic IP reservation only)
- **Key Feature**: IP address never changes between stops/starts

## 🔧 Management Commands

| Command | Purpose |
|---------|---------|
| `./validate-environment.sh` | Check all configurations |
| `./connect-phpmyadmin.sh` | Access database admin |
| `./disconnect-phpmyadmin.sh` | Close database connection |
| `./test-github-secrets.sh` | Test CI/CD pipeline |

## 📋 Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Local environment variables |
| `terraform/terraform.tfvars` | Infrastructure configuration |
| `docker-compose.prod.yml` | Production container setup |
| `.github/workflows/deploy-terraform.yml` | Auto-deployment |

## 🔐 Security Features

- **Static Elastic IP** (persistent across restarts)
- **Encrypted EBS volumes**
- **SSH key-based authentication**
- **PhpMyAdmin**: SSH tunnel access only
- **HTTPS**: Self-signed certificate (ready for Let's Encrypt)
- **Database**: Private network, password protected

## 🏷️ Key Technologies

- **Frontend**: React, Bootstrap, Vite
- **Backend**: Node.js, Express, JWT authentication
- **Database**: MySQL 8 with health checks
- **Infrastructure**: Terraform, AWS EC2, Docker Compose
- **CI/CD**: GitHub Actions with automated deployment
- **Proxy**: Nginx with SSL termination

## 🆘 Troubleshooting

### Application Not Loading
```bash
./server-status.sh                    # Check status
curl -k https://glamprinakis.com      # Test direct access
```

### Database Issues
```bash
./connect-phpmyadmin.sh               # Access admin panel
# OR SSH to server:
ssh -i ~/.ssh/deploy_key_ec2 ubuntu@79.125.4.130
docker compose -f docker-compose.prod.yml logs db
```

### DNS Issues
```bash
nslookup glamprinakis.com             # Should return: 79.125.4.130
```

### Deployment Failures
Check GitHub Actions logs at: `https://github.com/glamprinakis/Web3/actions`

## 📊 Project Structure

```
├── node/                    # Backend API
├── react/                   # Frontend React app
├── terraform/               # AWS infrastructure
├── .github/workflows/       # CI/CD pipeline
├── docker-compose.prod.yml  # Production containers
├── nginx.conf              # Reverse proxy config
├── db/                     # Database initialization
└── Management scripts:
    ├── start-server.sh
    ├── stop-server.sh
    ├── server-status.sh
    ├── connect-phpmyadmin.sh
    └── validate-environment.sh
```

## 🌟 Production Features

- **Zero-downtime DNS**: Static IP preserved across deployments
- **Health checks**: Database and API monitoring
- **Automated backups**: Database snapshots
- **Container orchestration**: Docker Compose with dependency management
- **Environment validation**: Bulletproof configuration checking
- **Cost optimization**: Easy start/stop with IP persistence


