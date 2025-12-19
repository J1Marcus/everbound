# Supabase Self-Hosted Setup Guide

Complete guide for setting up a self-hosted Supabase instance for local development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Setup](#production-setup)
- [Configuration](#configuration)
- [Multi-Instance Setup](#multi-instance-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk Space**: 20GB
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2

**Recommended for Production:**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Disk Space**: 50GB+ (SSD recommended)
- **Operating System**: Ubuntu 22.04 LTS or Debian 11+

### Software Dependencies

**Required:**
- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- OpenSSL (for secret generation)
- Git

**Optional:**
- curl (for API testing)
- jq (for JSON parsing)
- PostgreSQL client tools (for database management)

### Verify Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.0.0 or higher

# Check OpenSSL
openssl version
# Expected: OpenSSL 1.1.1 or higher

# Verify Docker is running
docker ps
# Should show running containers or empty list (no errors)
```

### Production Additional Requirements

- **Domain Name**: Registered domain with DNS access
- **SSL Certificate**: Let's Encrypt (automatic via Caddy) or custom certificate
- **SMTP Server**: For email authentication (SendGrid, AWS SES, Mailgun, etc.)
- **Firewall Access**: Ability to configure firewall rules
- **SSH Access**: For remote server management

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd supabase-template

# Verify directory structure
ls -la
# Expected: docker/, scripts/, docs/, caddy/, README.md
```

### Step 2: Copy Environment Template

```bash
# Copy the environment template
cp docker/.env.example docker/.env

# Verify the file was created
ls -la docker/.env
```

### Step 3: Generate Secure Secrets

**CRITICAL**: Never use default secrets in any environment.

```bash
# Generate all secrets automatically
./scripts/generate-secrets.sh

# Verify secrets were generated
grep "JWT_SECRET" docker/.env
# Should show a long random string, not the default value
```

**What gets generated:**
- `POSTGRES_PASSWORD`: Database password (32 characters)
- `JWT_SECRET`: JWT signing secret (64 characters)
- `ANON_KEY`: Anonymous access JWT token
- `SERVICE_ROLE_KEY`: Service role JWT token
- `DASHBOARD_PASSWORD`: Studio dashboard password
- `SECRET_KEY_BASE`: Rails secret key base
- `VAULT_ENC_KEY`: Vault encryption key
- `PG_META_CRYPTO_KEY`: Meta API encryption key

### Step 4: Configure Environment (Optional)

For local development, the defaults usually work. Edit [`docker/.env`](../docker/.env) if needed:

```bash
# Edit environment file
nano docker/.env

# Or use your preferred editor
code docker/.env
```

**Key variables for local development:**

```bash
# Project identification (for multi-instance support)
PROJECT_NAME=supabase_local
PORT_OFFSET=0

# URLs (localhost for development)
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000

# Email (use built-in mail server for development)
SMTP_HOST=supabase-mail
SMTP_PORT=2500
ENABLE_EMAIL_AUTOCONFIRM=true  # Auto-confirm emails in dev

# Signup (allow public signups in development)
DISABLE_SIGNUP=false
```

### Step 5: Start Services

```bash
# Navigate to docker directory
cd docker

# Start all services
docker compose up -d

# View startup logs
docker compose logs -f

# Press Ctrl+C to stop viewing logs (services keep running)
```

**Expected output:**
```
✓ Network supabase_local_default    Created
✓ Volume supabase_local_db_data     Created
✓ Volume supabase_local_storage_data Created
✓ Container supabase_local_db       Started
✓ Container supabase_local_redis    Started
✓ Container supabase_local_minio    Started
...
```

### Step 6: Verify Installation

```bash
# Return to project root
cd ..

# Run health check
./scripts/health-check.sh

# Check service status
cd docker
docker compose ps
```

**All services should show "healthy" status:**
- db (PostgreSQL)
- redis
- minio (Storage)
- kong (API Gateway)
- gotrue (Auth)
- postgrest (REST API)
- realtime (WebSocket)
- storage (Storage API)
- functions (Edge Functions)
- meta (Meta API)
- studio (Dashboard)

### Step 7: Access Services

**Supabase Studio (Dashboard):**
```bash
# Open in browser
open http://localhost:3000

# Or manually navigate to:
# http://localhost:3000
```

**Default Credentials:**
- Username: `supabase`
- Password: Check `DASHBOARD_PASSWORD` in [`docker/.env`](../docker/.env)

**API Gateway:**
```bash
# Test API endpoint
curl http://localhost:8000/rest/v1/

# Should return: {"message":"Welcome to PostgREST"}
```

### Step 8: Initial Configuration

1. **Login to Studio**: Use credentials from Step 7
2. **Create Your First Table**:
   - Navigate to "Table Editor"
   - Click "New Table"
   - Create a simple table (e.g., "todos")
3. **Test API Access**:
   ```bash
   # Get your ANON_KEY from .env
   source docker/.env
   
   # Query your table
   curl -X GET "http://localhost:8000/rest/v1/todos?select=*" \
     -H "apikey: $ANON_KEY" \
     -H "Authorization: Bearer $ANON_KEY"
   ```

### Development Workflow

```bash
# Start services
cd docker && docker compose up -d

# View logs for specific service
docker compose logs -f [service-name]
# Example: docker compose logs -f db

# Restart a service
docker compose restart [service-name]

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

## Production Setup

### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes to take effect
```

### Step 2: Configure Firewall

```bash
# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify firewall status
sudo ufw status verbose
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### Step 3: Clone and Configure

```bash
# Clone repository
cd /opt
sudo git clone <repository-url> supabase
sudo chown -R $USER:$USER supabase
cd supabase

# Copy environment template
cp docker/.env.example docker/.env

# Generate production secrets
./scripts/generate-secrets.sh --production
```

### Step 4: Configure Production Environment

Edit [`docker/.env`](../docker/.env) with production values:

```bash
nano docker/.env
```

**Critical Production Settings:**

```bash
############
# Project Configuration
############
PROJECT_NAME=production_supabase
PORT_OFFSET=0

############
# Database
############
POSTGRES_PASSWORD=<generated-secure-password>
# DO NOT use default password!

############
# JWT Authentication
############
JWT_SECRET=<generated-secret>
ANON_KEY=<generated-token>
SERVICE_ROLE_KEY=<generated-token>
# These are auto-generated by generate-secrets.sh

############
# Production URLs
############
SITE_URL=https://yourdomain.com
API_EXTERNAL_URL=https://api.yourdomain.com
SUPABASE_PUBLIC_URL=https://api.yourdomain.com

############
# Email Configuration (REQUIRED for production)
############
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
SMTP_ADMIN_EMAIL=admin@yourdomain.com
SMTP_SENDER_NAME=Your App Name
ENABLE_EMAIL_AUTOCONFIRM=false  # Require email confirmation

############
# Security
############
DISABLE_SIGNUP=false  # Set to true to disable public signups
ENABLE_ANONYMOUS_USERS=false  # Disable anonymous auth in production

############
# Dashboard
############
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=<strong-password>
# Change from default!
```

### Step 5: Configure DNS

Point your domains to the server IP address:

**DNS Records:**
```
Type    Name                    Value               TTL
A       api.yourdomain.com      YOUR_SERVER_IP      300
A       studio.yourdomain.com   YOUR_SERVER_IP      300
```

**Verify DNS propagation:**
```bash
# Check DNS resolution
dig api.yourdomain.com +short
dig studio.yourdomain.com +short

# Should return your server IP
```

### Step 6: Configure Reverse Proxy

Edit [`caddy/Caddyfile.prod`](../caddy/Caddyfile.prod):

```bash
nano caddy/Caddyfile.prod
```

**Update domains:**
```caddyfile
# API Gateway
api.yourdomain.com {
    reverse_proxy kong:8000
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}

# Studio Dashboard
studio.yourdomain.com {
    reverse_proxy studio:3000
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}
```

### Step 7: Deploy to Production

```bash
# Run production deployment
./scripts/deploy.sh --production

# Or with full rebuild and cleanup
./scripts/deploy.sh --production --build --prune
```

**Deployment process:**
1. Pre-deployment validation
2. Automatic backup creation
3. Pull latest Docker images
4. Stop current services
5. Start services with production config
6. Post-deployment health check

### Step 8: Verify Production Deployment

```bash
# Check service health
./scripts/health-check.sh

# View logs
cd docker
docker compose logs -f

# Test API endpoint
curl https://api.yourdomain.com/rest/v1/

# Test SSL certificate
curl -vI https://api.yourdomain.com 2>&1 | grep -i "SSL certificate"
```

**Access Studio:**
```bash
# Open in browser
open https://studio.yourdomain.com

# Login with credentials from docker/.env
```

### Step 9: Configure Automated Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1

# Add weekly cleanup (keep last 30 days)
0 3 * * 0 find /opt/supabase/backups -type d -mtime +30 -exec rm -rf {} +

# Test backup manually
./scripts/backup.sh
```

### Step 10: Configure Monitoring (Optional)

```bash
# Install monitoring tools
sudo apt install -y prometheus grafana

# Configure health check monitoring
# Add to crontab for alerts
*/5 * * * * /opt/supabase/scripts/health-check.sh || echo "Supabase health check failed" | mail -s "Alert: Supabase Down" admin@yourdomain.com
```

## Configuration

### Environment Variables

See [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) for complete reference.

**Most Important Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PROJECT_NAME` | Unique instance identifier | `production_supabase` |
| `PORT_OFFSET` | Port offset for multi-instance | `0`, `100`, `200` |
| `POSTGRES_PASSWORD` | Database password | Auto-generated |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `ANON_KEY` | Anonymous access token | Auto-generated |
| `SERVICE_ROLE_KEY` | Service role token | Auto-generated |
| `SITE_URL` | Frontend application URL | `https://app.com` |
| `API_EXTERNAL_URL` | External API URL | `https://api.app.com` |
| `SMTP_HOST` | Email server host | `smtp.sendgrid.net` |
| `SMTP_PORT` | Email server port | `587` |

### Port Configuration

**Default Ports (PORT_OFFSET=0):**

| Service | Port | Description |
|---------|------|-------------|
| Studio | 3000 | Web dashboard |
| Kong HTTP | 8000 | API Gateway |
| Kong HTTPS | 8443 | API Gateway (SSL) |
| PostgreSQL | 5432 | Database |
| PostgREST | 3000 | REST API |
| GoTrue | 9999 | Auth service |
| Realtime | 4000 | WebSocket server |
| Storage | 5000 | Storage API |
| Functions | 9000 | Edge Functions |
| Meta | 8080 | Meta API |
| MinIO | 9000 | Object storage |
| MinIO Console | 9001 | MinIO dashboard |
| Redis | 6379 | Cache |

**Custom Ports:**
```bash
# Set PORT_OFFSET in .env
PORT_OFFSET=100

# Recalculate ports
./scripts/calculate-ports.sh

# Ports will be: 3100, 8100, 5532, etc.
```

### Service Configuration

**PostgreSQL:**
```bash
# Connection string
postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/postgres

# Connect via Docker
docker exec -it ${PROJECT_NAME}_db psql -U postgres
```

**Storage (MinIO):**
```bash
# Access MinIO console
http://localhost:9001

# Credentials from .env
# Access Key: MINIO_ROOT_USER
# Secret Key: MINIO_ROOT_PASSWORD
```

**Email:**
```bash
# Development (built-in mail server)
SMTP_HOST=supabase-mail
SMTP_PORT=2500
ENABLE_EMAIL_AUTOCONFIRM=true

# Production (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-api-key>
ENABLE_EMAIL_AUTOCONFIRM=false
```

## Multi-Instance Setup

Run multiple isolated Supabase instances on the same server.

### Use Cases

- **Multiple Environments**: Production, staging, development
- **Multi-Tenancy**: Separate instances per customer
- **Testing**: Isolated test environments

### Configuration

Each instance needs unique values:

**Instance 1 (Production):**
```bash
PROJECT_NAME=prod_supabase
PORT_OFFSET=0
STUDIO_PORT=3000
KONG_HTTP_PORT=8000
POSTGRES_PORT=5432
```

**Instance 2 (Staging):**
```bash
PROJECT_NAME=staging_supabase
PORT_OFFSET=100
STUDIO_PORT=3100
KONG_HTTP_PORT=8100
POSTGRES_PORT=5532
```

**Instance 3 (Development):**
```bash
PROJECT_NAME=dev_supabase
PORT_OFFSET=200
STUDIO_PORT=3200
KONG_HTTP_PORT=8200
POSTGRES_PORT=5632
```

### Setup Process

```bash
# Create separate directories
mkdir -p ~/supabase-instances/{prod,staging,dev}

# Clone to each directory
cd ~/supabase-instances/prod
git clone <repo-url> .

cd ~/supabase-instances/staging
git clone <repo-url> .

cd ~/supabase-instances/dev
git clone <repo-url> .

# Configure each instance
cd ~/supabase-instances/prod
cp docker/.env.example docker/.env
# Edit .env with prod settings (PORT_OFFSET=0)

cd ~/supabase-instances/staging
cp docker/.env.example docker/.env
# Edit .env with staging settings (PORT_OFFSET=100)

cd ~/supabase-instances/dev
cp docker/.env.example docker/.env
# Edit .env with dev settings (PORT_OFFSET=200)

# Start each instance
cd ~/supabase-instances/prod/docker && docker compose up -d
cd ~/supabase-instances/staging/docker && docker compose up -d
cd ~/supabase-instances/dev/docker && docker compose up -d
```

### Managing Multiple Instances

```bash
# List all instances
docker ps --filter "name=supabase"

# View specific instance logs
docker compose -p prod_supabase logs -f

# Stop specific instance
cd ~/supabase-instances/prod/docker
docker compose down

# Health check specific instance
cd ~/supabase-instances/prod
./scripts/health-check.sh
```

## Verification

### Service Health Check

```bash
# Run comprehensive health check
./scripts/health-check.sh

# Check specific service
docker compose ps [service-name]

# View service logs
docker compose logs -f [service-name]
```

### API Testing

```bash
# Source environment variables
source docker/.env

# Test REST API
curl -X GET "http://localhost:8000/rest/v1/" \
  -H "apikey: $ANON_KEY"

# Test Auth API
curl -X GET "http://localhost:8000/auth/v1/health" \
  -H "apikey: $ANON_KEY"

# Test Storage API
curl -X GET "http://localhost:8000/storage/v1/bucket" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

### Database Connection

```bash
# Connect to database
docker exec -it ${PROJECT_NAME}_db psql -U postgres

# Run test query
SELECT version();

# List databases
\l

# List tables
\dt

# Exit
\q
```

### Studio Access

1. Open browser to Studio URL
2. Login with dashboard credentials
3. Navigate to "Table Editor"
4. Create a test table
5. Insert test data
6. Query via API to verify

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs -f

# Check disk space
df -h

# Check memory
free -h

# Verify ports are available
sudo netstat -tulpn | grep -E ':(3000|8000|5432)'
```

### Port Conflicts

```bash
# Find what's using the port
sudo lsof -i :8000

# Change port offset
nano docker/.env
# Set PORT_OFFSET=100

# Recalculate ports
./scripts/calculate-ports.sh

# Restart services
cd docker
docker compose down && docker compose up -d
```

### Database Connection Errors

```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c "SELECT 1;"
```

### Authentication Issues

```bash
# Verify JWT secret is set
grep JWT_SECRET docker/.env

# Regenerate tokens
./scripts/generate-secrets.sh --jwt-only

# Restart auth service
docker compose restart gotrue
```

### SSL/TLS Issues (Production)

```bash
# Check Caddy logs
docker compose logs caddy

# Verify DNS is correct
dig api.yourdomain.com +short

# Test SSL certificate
curl -vI https://api.yourdomain.com 2>&1 | grep -i "SSL"

# Force certificate renewal
docker compose restart caddy
```

### Email Not Sending

```bash
# Check SMTP settings
grep SMTP docker/.env

# Test SMTP connection
telnet smtp.sendgrid.net 587

# Check GoTrue logs
docker compose logs gotrue | grep -i mail
```

## Next Steps

After successful setup:

1. **Configure Authentication**
   - Set up OAuth providers (Google, GitHub, etc.)
   - Configure email templates
   - Set up password policies

2. **Create Database Schema**
   - Design your tables
   - Set up Row Level Security (RLS)
   - Create indexes for performance

3. **Configure Storage**
   - Create storage buckets
   - Set up access policies
   - Configure image transformations

4. **Deploy Edge Functions**
   - Create serverless functions
   - Set up function triggers
   - Configure function secrets

5. **Set Up Monitoring**
   - Configure health check alerts
   - Set up log aggregation
   - Monitor resource usage

6. **Review Security**
   - Enable RLS on all tables
   - Review API keys and permissions
   - Configure rate limiting
   - Set up backup automation

## Additional Resources

- [Deployment Guide](DEPLOYMENT.md) - Production deployment procedures
- [API Reference](API_REFERENCE.md) - API endpoints and usage
- [Architecture](ARCHITECTURE.md) - System architecture overview
- [Backup & Recovery](BACKUP_RECOVERY.md) - Backup and disaster recovery
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Environment Variables](ENVIRONMENT_VARIABLES.md) - Configuration reference

## Support

- **Documentation**: See [`docs/`](.) directory
- **Health Check**: `./scripts/health-check.sh`
- **Logs**: `docker compose logs -f [service]`
- **Community**: [Supabase Discord](https://discord.supabase.com)
