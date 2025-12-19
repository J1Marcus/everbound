# Supabase Self-Hosted Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with self-hosted Supabase instances.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Service Issues](#service-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Storage Issues](#storage-issues)
- [Network and Connectivity](#network-and-connectivity)
- [Performance Issues](#performance-issues)
- [SSL/TLS Issues](#ssltls-issues)
- [Email Issues](#email-issues)
- [Docker Issues](#docker-issues)
- [Log Analysis](#log-analysis)
- [Recovery Procedures](#recovery-procedures)

## Quick Diagnostics

### First Steps

When encountering issues, run these commands first:

```bash
# 1. Check service health
./scripts/health-check.sh

# 2. Check service status
cd docker
docker compose ps

# 3. Check recent logs
docker compose logs --tail=100

# 4. Check disk space
df -h

# 5. Check memory
free -h

# 6. Validate configuration
cd ..
./scripts/validate-instance.sh
```

### Common Quick Fixes

```bash
# Restart all services
cd docker
docker compose restart

# Restart specific service
docker compose restart [service-name]

# View logs for specific service
docker compose logs -f [service-name]

# Check environment variables
cat .env | grep -v "^#" | grep -v "^$"

# Regenerate secrets (if needed)
cd ..
./scripts/generate-secrets.sh --jwt-only
```

## Service Issues

### Services Won't Start

**Symptoms:**
- `docker compose up -d` fails
- Services show "Exited" status
- Health checks fail immediately

**Diagnosis:**
```bash
# Check which services failed
docker compose ps

# Check logs for errors
docker compose logs [service-name]

# Check for port conflicts
sudo netstat -tulpn | grep -E ':(3000|8000|5432|6379|9000)'

# Check disk space
df -h
```

**Solutions:**

1. **Port Conflicts:**
```bash
# Find what's using the port
sudo lsof -i :8000

# Option 1: Stop conflicting service
sudo systemctl stop [conflicting-service]

# Option 2: Change port offset
nano docker/.env
# Set PORT_OFFSET=100
./scripts/calculate-ports.sh
docker compose up -d
```

2. **Insufficient Disk Space:**
```bash
# Check space
df -h

# Clean Docker resources
docker system prune -a
docker volume prune

# Remove old backups
find backups/ -type d -mtime +30 -exec rm -rf {} +
```

3. **Memory Issues:**
```bash
# Check memory
free -h

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > Increase to 8GB

# Or reduce service memory limits in docker-compose.yml
```

4. **Configuration Errors:**
```bash
# Validate environment
./scripts/validate-instance.sh

# Check for missing variables
grep -E "^[A-Z_]+=\s*$" docker/.env

# Regenerate secrets
./scripts/generate-secrets.sh
```

### Service Keeps Restarting

**Symptoms:**
- Service shows "Restarting" status
- Service starts then immediately exits
- Restart count keeps increasing

**Diagnosis:**
```bash
# Check restart count
docker compose ps

# View logs
docker compose logs --tail=200 [service-name]

# Check service dependencies
docker compose config | grep -A 5 "depends_on"
```

**Solutions:**

1. **Database Not Ready:**
```bash
# Wait for database to be fully ready
docker compose logs db | grep "ready to accept connections"

# Increase health check timeout in docker-compose.yml
# Or wait 30 seconds and restart
sleep 30
docker compose restart [service-name]
```

2. **Configuration Error:**
```bash
# Check service-specific environment variables
docker compose logs [service-name] | grep -i "error\|fatal\|missing"

# Verify required variables are set
source docker/.env
echo $POSTGRES_PASSWORD
echo $JWT_SECRET
```

3. **Resource Limits:**
```bash
# Check if service is being OOM killed
docker compose logs [service-name] | grep -i "killed\|oom"

# Increase memory limit in docker-compose.yml
# Or reduce other services' memory usage
```

### Service Unhealthy

**Symptoms:**
- Service shows "unhealthy" status
- Health check endpoint returns errors
- Service running but not responding

**Diagnosis:**
```bash
# Check health status
docker compose ps

# Test health endpoint manually
docker exec [container-name] curl -f http://localhost:[port]/health

# Check service logs
docker compose logs --tail=100 [service-name]
```

**Solutions:**

1. **Health Check Timeout:**
```bash
# Increase health check interval in docker-compose.yml
# interval: 30s (instead of 10s)
# timeout: 10s (instead of 5s)
# retries: 5 (instead of 3)

# Restart service
docker compose up -d [service-name]
```

2. **Service Overloaded:**
```bash
# Check resource usage
docker stats [container-name]

# Restart service
docker compose restart [service-name]

# Scale service if needed (for supported services)
docker compose up -d --scale [service-name]=2
```

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- "Connection refused" errors
- "Could not connect to server" errors
- Services can't reach database

**Diagnosis:**
```bash
# Check if database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection from host
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c "SELECT 1;"

# Test connection from another service
docker exec -it ${PROJECT_NAME}_kong curl -f http://db:5432
```

**Solutions:**

1. **Database Not Started:**
```bash
# Start database
docker compose up -d db

# Wait for ready
docker compose logs -f db | grep "ready to accept connections"

# Restart dependent services
docker compose restart
```

2. **Wrong Connection String:**
```bash
# Verify database host in .env
grep POSTGRES_HOST docker/.env
# Should be: POSTGRES_HOST=db (not localhost)

# Verify port
grep POSTGRES_PORT docker/.env
# Should be: POSTGRES_PORT=5432

# Restart services
docker compose restart
```

3. **Network Issues:**
```bash
# Check Docker network
docker network ls
docker network inspect ${PROJECT_NAME}_default

# Recreate network
docker compose down
docker compose up -d
```

### Database Initialization Failed

**Symptoms:**
- Database starts but tables missing
- Extensions not installed
- Schemas not created

**Diagnosis:**
```bash
# Check initialization logs
docker compose logs db | grep -i "init\|error"

# Connect and check
docker exec -it ${PROJECT_NAME}_db psql -U postgres

# List extensions
\dx

# List schemas
\dn

# Exit
\q
```

**Solutions:**

1. **Re-run Initialization:**
```bash
# Stop database
docker compose down db

# Remove database volume
docker volume rm ${PROJECT_NAME}_db_data

# Start database (will re-initialize)
docker compose up -d db

# Wait for initialization
docker compose logs -f db
```

2. **Manual Initialization:**
```bash
# Connect to database
docker exec -it ${PROJECT_NAME}_db psql -U postgres

# Run initialization commands
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

# Exit
\q
```

### Database Performance Issues

**Symptoms:**
- Slow query responses
- High CPU usage
- Connection pool exhausted

**Diagnosis:**
```bash
# Check active connections
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c \
  "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check database size
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c \
  "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

**Solutions:**

1. **Add Indexes:**
```sql
-- Connect to database
docker exec -it ${PROJECT_NAME}_db psql -U postgres

-- Find missing indexes
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND n_distinct > 100
  AND correlation < 0.1;

-- Create indexes for frequently queried columns
CREATE INDEX idx_table_column ON table_name(column_name);
```

2. **Vacuum Database:**
```bash
# Run vacuum
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c "VACUUM ANALYZE;"

# Check bloat
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

3. **Increase Connection Pool:**
```bash
# Edit .env
nano docker/.env

# Increase pool size
POOLER_DEFAULT_POOL_SIZE=50  # Increase from 20
POOLER_MAX_CLIENT_CONN=200   # Increase from 100

# Restart services
docker compose restart
```

## Authentication Issues

### Cannot Login to Studio

**Symptoms:**
- Invalid credentials error
- Login page doesn't load
- Redirects to error page

**Diagnosis:**
```bash
# Check Studio is running
docker compose ps studio

# Check Studio logs
docker compose logs studio

# Verify credentials
grep DASHBOARD docker/.env
```

**Solutions:**

1. **Wrong Credentials:**
```bash
# Check credentials in .env
source docker/.env
echo "Username: $DASHBOARD_USERNAME"
echo "Password: $DASHBOARD_PASSWORD"

# Reset password if needed
nano docker/.env
# Update DASHBOARD_PASSWORD

# Restart Studio
docker compose restart studio
```

2. **Studio Not Accessible:**
```bash
# Check if Studio is running
curl http://localhost:3000

# Check port mapping
docker compose ps studio

# Verify PORT_OFFSET
grep PORT_OFFSET docker/.env
```

### JWT Token Errors

**Symptoms:**
- "Invalid JWT" errors
- "JWT expired" errors
- Authentication fails for API calls

**Diagnosis:**
```bash
# Check JWT configuration
grep JWT docker/.env

# Verify tokens are set
source docker/.env
echo $JWT_SECRET | wc -c  # Should be 64+ characters
echo $ANON_KEY | head -c 20
echo $SERVICE_ROLE_KEY | head -c 20
```

**Solutions:**

1. **Regenerate JWT Tokens:**
```bash
# Regenerate all JWT tokens
./scripts/generate-secrets.sh --jwt-only

# Restart auth service
cd docker
docker compose restart gotrue

# Restart API gateway
docker compose restart kong
```

2. **Verify Token Format:**
```bash
# Tokens should be valid JWT format
# Check at https://jwt.io

# Verify token has correct claims
source docker/.env
echo $ANON_KEY | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

### User Signup/Login Fails

**Symptoms:**
- Signup returns error
- Login fails with valid credentials
- Email confirmation not working

**Diagnosis:**
```bash
# Check GoTrue logs
docker compose logs gotrue | grep -i error

# Check email configuration
grep SMTP docker/.env

# Test email server
docker compose logs gotrue | grep -i "mail\|smtp"
```

**Solutions:**

1. **Email Configuration:**
```bash
# For development, enable auto-confirm
nano docker/.env
ENABLE_EMAIL_AUTOCONFIRM=true

# For production, configure SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key
ENABLE_EMAIL_AUTOCONFIRM=false

# Restart auth service
docker compose restart gotrue
```

2. **Signup Disabled:**
```bash
# Check if signup is disabled
grep DISABLE_SIGNUP docker/.env

# Enable signup
nano docker/.env
DISABLE_SIGNUP=false

# Restart auth service
docker compose restart gotrue
```

## Storage Issues

### Cannot Upload Files

**Symptoms:**
- Upload fails with error
- Files not appearing in storage
- "Bucket not found" errors

**Diagnosis:**
```bash
# Check Storage service
docker compose ps storage

# Check Storage logs
docker compose logs storage

# Check MinIO
docker compose ps minio
docker compose logs minio

# Test storage endpoint
source docker/.env
curl -X GET "http://localhost:8000/storage/v1/bucket" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

**Solutions:**

1. **Bucket Not Created:**
```bash
# Access MinIO console
open http://localhost:9001

# Login with credentials from .env
# Create bucket: supabase-storage

# Or create via API
source docker/.env
curl -X POST "http://localhost:8000/storage/v1/bucket" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"supabase-storage","name":"supabase-storage","public":false}'
```

2. **Storage Policy Issues:**
```bash
# Check storage policies in Studio
# Navigate to Storage > Policies

# Create policy for authenticated users
# Allow INSERT for authenticated users
```

3. **File Size Limit:**
```bash
# Check file size limit
grep FILE_SIZE docker/.env

# Increase limit
nano docker/.env
FILE_SIZE_LIMIT=52428800  # 50MB

# Restart storage service
docker compose restart storage
```

### Cannot Download Files

**Symptoms:**
- Download returns 404
- Access denied errors
- Files exist but not accessible

**Diagnosis:**
```bash
# Check if file exists in MinIO
docker exec -it ${PROJECT_NAME}_minio mc ls local/supabase-storage/

# Check storage policies
# Via Studio > Storage > Policies

# Check storage logs
docker compose logs storage | grep -i "download\|get"
```

**Solutions:**

1. **Access Policy:**
```bash
# Create download policy in Studio
# Storage > Policies > New Policy
# Allow SELECT for authenticated users

# Or make bucket public (if appropriate)
# Storage > Buckets > Settings > Public bucket
```

2. **Signed URL:**
```bash
# Generate signed URL for private files
source docker/.env
curl -X POST "http://localhost:8000/storage/v1/object/sign/supabase-storage/file.jpg" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"expiresIn":3600}'
```

## Network and Connectivity

### Cannot Access Services from Host

**Symptoms:**
- `curl localhost:8000` fails
- Cannot access Studio
- Connection refused errors

**Diagnosis:**
```bash
# Check if services are running
docker compose ps

# Check port mappings
docker compose ps | grep -E "0.0.0.0|127.0.0.1"

# Check if ports are listening
sudo netstat -tulpn | grep -E ':(3000|8000|5432)'

# Test from inside container
docker exec -it ${PROJECT_NAME}_kong curl -f http://localhost:8000
```

**Solutions:**

1. **Port Not Mapped:**
```bash
# Check docker-compose.yml port mappings
# Should be: "127.0.0.1:${PORT}:${PORT}"

# Restart services
docker compose down
docker compose up -d
```

2. **Firewall Blocking:**
```bash
# Check firewall
sudo ufw status

# Allow ports (if needed)
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp

# Or disable firewall temporarily (testing only)
sudo ufw disable
```

3. **Wrong Host:**
```bash
# Use 127.0.0.1 instead of localhost
curl http://127.0.0.1:8000

# Or use actual IP
curl http://$(hostname -I | awk '{print $1}'):8000
```

### Services Cannot Communicate

**Symptoms:**
- Services can't reach each other
- "Connection refused" between services
- Network errors in logs

**Diagnosis:**
```bash
# Check Docker network
docker network ls
docker network inspect ${PROJECT_NAME}_default

# Test connectivity between services
docker exec -it ${PROJECT_NAME}_kong ping db
docker exec -it ${PROJECT_NAME}_kong curl -f http://db:5432
```

**Solutions:**

1. **Recreate Network:**
```bash
# Stop services
docker compose down

# Remove network
docker network rm ${PROJECT_NAME}_default

# Start services (recreates network)
docker compose up -d
```

2. **Use Service Names:**
```bash
# In configuration, use service names not localhost
# Correct: POSTGRES_HOST=db
# Wrong: POSTGRES_HOST=localhost

# Update .env
nano docker/.env
POSTGRES_HOST=db

# Restart services
docker compose restart
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- API calls take > 1 second
- Timeouts
- High latency

**Diagnosis:**
```bash
# Test API response time
time curl http://localhost:8000/rest/v1/

# Check service resource usage
docker stats

# Check database performance
docker exec -it ${PROJECT_NAME}_db psql -U postgres -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**Solutions:**

1. **Add Database Indexes:**
```sql
-- Connect to database
docker exec -it ${PROJECT_NAME}_db psql -U postgres

-- Create indexes on frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

2. **Increase Resources:**
```bash
# Increase Docker resources
# Docker Desktop: Settings > Resources
# Memory: 8GB
# CPUs: 4

# Or edit docker-compose.yml to add resource limits
```

3. **Enable Caching:**
```bash
# Redis is already configured
# Implement caching in your application code

# Check Redis is working
docker exec -it ${PROJECT_NAME}_redis redis-cli ping
# Should return: PONG
```

### High Memory Usage

**Symptoms:**
- Services using excessive memory
- System becomes slow
- OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Check memory usage
docker stats

# Check system memory
free -h

# Check which service uses most memory
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | sort -k2 -h
```

**Solutions:**

1. **Add Memory Limits:**
```yaml
# Edit docker-compose.yml
services:
  db:
    mem_limit: 2g
  kong:
    mem_limit: 512m
  # Add limits for other services
```

2. **Reduce Connection Pools:**
```bash
# Edit .env
nano docker/.env

# Reduce pool sizes
POOLER_DEFAULT_POOL_SIZE=10
POOLER_MAX_CLIENT_CONN=50

# Restart services
docker compose restart
```

3. **Clean Up:**
```bash
# Clean Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Restart services
docker compose restart
```

## SSL/TLS Issues

### SSL Certificate Not Working

**Symptoms:**
- HTTPS not working
- Certificate errors in browser
- "Certificate not found" errors

**Diagnosis:**
```bash
# Check Caddy logs
docker compose logs caddy

# Test SSL
curl -vI https://api.yourdomain.com 2>&1 | grep -i "SSL\|certificate"

# Check DNS
dig api.yourdomain.com +short
```

**Solutions:**

1. **DNS Not Configured:**
```bash
# Verify DNS points to server
dig api.yourdomain.com +short
# Should return your server IP

# Wait for DNS propagation (up to 48 hours)
# Or use DNS propagation checker online
```

2. **Caddy Configuration:**
```bash
# Check Caddyfile
cat caddy/Caddyfile.prod

# Verify domain is correct
# Verify email is set for Let's Encrypt

# Restart Caddy
docker compose restart caddy

# Check Caddy logs
docker compose logs -f caddy
```

3. **Firewall Blocking:**
```bash
# Ensure ports 80 and 443 are open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

### Certificate Renewal Failed

**Symptoms:**
- Certificate expired
- Renewal errors in logs
- HTTPS stops working

**Diagnosis:**
```bash
# Check certificate expiry
echo | openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Check Caddy logs for renewal errors
docker compose logs caddy | grep -i "renew\|acme\|certificate"
```

**Solutions:**

1. **Force Renewal:**
```bash
# Restart Caddy (triggers renewal check)
docker compose restart caddy

# Or remove certificate and restart
docker volume rm ${PROJECT_NAME}_caddy_data
docker compose restart caddy
```

2. **Check Rate Limits:**
```bash
# Let's Encrypt has rate limits
# 50 certificates per domain per week
# Wait if rate limit hit

# Use staging environment for testing
# Edit Caddyfile to use staging ACME server
```

## Email Issues

### Emails Not Sending

**Symptoms:**
- Confirmation emails not received
- Password reset emails not sent
- SMTP errors in logs

**Diagnosis:**
```bash
# Check GoTrue logs
docker compose logs gotrue | grep -i "mail\|smtp\|email"

# Check SMTP configuration
grep SMTP docker/.env

# Test SMTP connection
telnet smtp.sendgrid.net 587
```

**Solutions:**

1. **SMTP Configuration:**
```bash
# Verify SMTP settings
nano docker/.env

# For SendGrid:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_ADMIN_EMAIL=noreply@yourdomain.com

# Restart GoTrue
docker compose restart gotrue
```

2. **Use Development Mail Server:**
```bash
# For development only
nano docker/.env

SMTP_HOST=supabase-mail
SMTP_PORT=2500
ENABLE_EMAIL_AUTOCONFIRM=true

# Restart GoTrue
docker compose restart gotrue
```

3. **Check Email Templates:**
```bash
# Verify email templates in GoTrue configuration
# Check MAILER_URLPATHS_* variables in .env

# Ensure URLs are correct
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
SITE_URL=https://yourdomain.com
```

## Docker Issues

### Docker Daemon Not Running

**Symptoms:**
- "Cannot connect to Docker daemon" error
- Docker commands fail
- Services won't start

**Solutions:**

```bash
# Start Docker daemon (Linux)
sudo systemctl start docker
sudo systemctl enable docker

# Start Docker Desktop (macOS/Windows)
# Open Docker Desktop application

# Verify Docker is running
docker ps
```

### Docker Compose Not Found

**Symptoms:**
- "docker-compose: command not found"
- "docker compose: command not found"

**Solutions:**

```bash
# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Or use docker-compose (older version)
sudo apt install docker-compose

# Verify installation
docker compose version
```

### Permission Denied

**Symptoms:**
- "Permission denied" when running Docker commands
- Need sudo for Docker commands

**Solutions:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in for changes to take effect
# Or run:
newgrp docker

# Verify
docker ps
```

## Log Analysis

### Finding Errors in Logs

```bash
# All errors across all services
docker compose logs | grep -i error

# Errors in last hour
docker compose logs --since 1h | grep -i error

# Errors for specific service
docker compose logs [service-name] | grep -i error

# Follow logs in real-time
docker compose logs -f | grep -i "error\|fatal\|warning"
```

### Common Error Patterns

**"Connection refused":**
```bash
# Service not started or wrong host
docker compose ps
# Check service is running and use service name (not localhost)
```

**"No such file or directory":**
```bash
# Volume mount issue or missing file
docker compose config | grep volumes
# Verify paths exist
```

**"Port already in use":**
```bash
# Port conflict
sudo lsof -i :[port]
# Change PORT_OFFSET or stop conflicting service
```

**"Out of memory":**
```bash
# Insufficient memory
docker stats
# Increase Docker memory or add limits
```

## Recovery Procedures

### Complete System Recovery

```bash
# 1. Stop all services
cd docker
docker compose down

# 2. Backup current state (if possible)
cd ..
./scripts/backup.sh

# 3. Remove all containers and volumes
cd docker
docker compose down -v --remove-orphans

# 4. Clean Docker system
docker system prune -a
docker volume prune

# 5. Restore from backup
cd ..
./scripts/restore.sh --backup backups/[latest-backup]

# 6. Start services
cd docker
docker compose up -d

# 7. Verify
cd ..
./scripts/health-check.sh
```

### Database Recovery

```bash
# 1. Stop services
cd docker
docker compose down

# 2. Backup current database (if accessible)
docker compose up -d db
docker exec ${PROJECT_NAME}_db pg_dump -U postgres > emergency_backup.sql
docker compose down

# 3. Remove database volume
docker volume rm ${PROJECT_NAME}_db_data

# 4. Start database
docker compose up -d db

# 5. Wait for initialization
docker compose logs -f db

# 6. Restore data
docker exec -i ${PROJECT_NAME}_db psql -U postgres < emergency_backup.sql

# 7. Start all services
docker compose up -d

# 8. Verify
cd ..
./scripts/health-check.sh
```

## Getting Help

### Information to Gather

When seeking help, provide:

1. **System Information:**
```bash
uname -a
docker --version
docker compose version
```

2. **Service Status:**
```bash
docker compose ps
./scripts/health-check.sh
```

3. **Recent Logs:**
```bash
docker compose logs --tail=200 > logs.txt
```

4. **Configuration (sanitized):**
```bash
cat docker/.env | grep -v "PASSWORD\|SECRET\|KEY" > config.txt
```

5. **Error Messages:**
```bash
docker compose logs | grep -i error > errors.txt
```

### Support Resources

- **Documentation**: See [`docs/`](.) directory
- **Health Check**: `./scripts/health-check.sh`
- **Validation**: `./scripts/validate-instance.sh`
- **Logs**: `docker compose logs -f [service]`
- **Community**: [Supabase Discord](https://discord.supabase.com)
- **GitHub Issues**: Report bugs and issues

## Additional Resources

- [Setup Guide](SETUP.md) - Initial setup and configuration
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [Architecture](ARCHITECTURE.md) - System architecture
- [API Reference](API_REFERENCE.md) - API documentation
- [Backup & Recovery](BACKUP_RECOVERY.md) - Backup procedures
- [Environment Variables](ENVIRONMENT_VARIABLES.md) - Configuration reference
