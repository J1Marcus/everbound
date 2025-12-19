# Supabase Self-Hosted Deployment Guide

Comprehensive guide for deploying Supabase instances to local, staging, and production environments with safety checks and rollback procedures.

## Table of Contents

- [Overview](#overview)
- [Deployment Strategies](#deployment-strategies)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Local Development Deployment](#local-development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Deployment Scripts](#deployment-scripts)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Multi-Instance Deployment](#multi-instance-deployment)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This guide covers deployment procedures for Supabase self-hosted instances across different environments. All deployments follow a consistent process with environment-specific configurations.

### Deployment Philosophy

- **Safety First**: Automatic backups before every deployment
- **Validation**: Pre-deployment checks prevent common issues
- **Rollback Ready**: Quick rollback procedures if issues arise
- **Zero Downtime**: Minimize service interruption during updates
- **Automated**: Scripts handle complex deployment steps

### Deployment Types

| Type | Use Case | Downtime | Backup | Validation |
|------|----------|----------|--------|------------|
| **Quick Restart** | Config changes | ~30s | Optional | Basic |
| **Standard** | Regular updates | ~2min | Yes | Full |
| **Full Rebuild** | Major changes | ~5min | Yes | Full |
| **Blue-Green** | Zero downtime | None | Yes | Full |

## Deployment Strategies

### 1. Quick Restart Deployment

**When to use:**
- Configuration changes only
- No database migrations
- No image updates

**Command:**
```bash
./scripts/deploy.sh --restart
```

**Process:**
1. Restart services with new configuration
2. Quick health check
3. ~30 seconds downtime

### 2. Standard Deployment

**When to use:**
- Regular updates
- Minor version upgrades
- Database migrations

**Command:**
```bash
./scripts/deploy.sh --production
```

**Process:**
1. Pre-deployment validation
2. Automatic backup
3. Pull latest images
4. Stop services
5. Start services
6. Health check
7. ~2 minutes downtime

### 3. Full Rebuild Deployment

**When to use:**
- Major version upgrades
- Custom image builds
- Significant changes

**Command:**
```bash
./scripts/deploy.sh --production --build --prune
```

**Process:**
1. Pre-deployment validation
2. Automatic backup
3. Build custom images
4. Clean old resources
5. Stop services
6. Start services
7. Health check
8. ~5 minutes downtime

### 4. Blue-Green Deployment

**When to use:**
- Zero downtime requirement
- Production critical systems
- Large user base

**Process:**
1. Deploy to "green" environment
2. Validate green environment
3. Switch traffic to green
4. Keep blue as backup
5. No downtime

**Implementation:**
```bash
# Deploy to green instance (PORT_OFFSET=100)
cd ~/supabase-green
./scripts/deploy.sh --production

# Verify green instance
./scripts/health-check.sh

# Update load balancer to point to green
# (Manual step or automation)

# Keep blue instance running for 24h as backup
```

## Pre-Deployment Checklist

### All Environments

- [ ] Review changes since last deployment
- [ ] Verify environment configuration
- [ ] Check disk space availability (20GB+ free)
- [ ] Verify Docker and Docker Compose versions
- [ ] Review recent logs for issues
- [ ] Notify team of deployment window

### Production Only

- [ ] Schedule maintenance window
- [ ] Notify users of potential downtime
- [ ] Verify backup system is working
- [ ] Test rollback procedure
- [ ] Prepare rollback plan
- [ ] Have monitoring dashboard open
- [ ] Ensure on-call engineer available
- [ ] Verify DNS and SSL certificates
- [ ] Check external dependencies (SMTP, etc.)
- [ ] Review security updates

### Validation Commands

```bash
# Check disk space
df -h
# Need: 20GB+ free

# Check Docker
docker --version
docker compose version

# Verify environment file
test -f docker/.env && echo "✓ .env exists" || echo "✗ .env missing"

# Check for port conflicts
./scripts/validate-instance.sh

# Verify backup system
./scripts/backup.sh --test

# Check current service health
./scripts/health-check.sh
```

## Local Development Deployment

### Initial Deployment

```bash
# 1. Clone and setup
git clone <repository-url>
cd supabase-template

# 2. Configure environment
cp docker/.env.example docker/.env
./scripts/generate-secrets.sh

# 3. Deploy
cd docker
docker compose up -d

# 4. Verify
cd ..
./scripts/health-check.sh
```

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Quick restart (config changes only)
./scripts/deploy.sh --local --restart

# Or full deployment
./scripts/deploy.sh --local
```

### Development Workflow

```bash
# Start services
cd docker && docker compose up -d

# Make changes to code/config

# Restart specific service
docker compose restart [service-name]

# View logs
docker compose logs -f [service-name]

# Full restart
docker compose restart

# Stop services
docker compose down
```

## Staging Deployment

### Purpose

- Test changes before production
- Validate migrations
- Performance testing
- User acceptance testing

### Setup Staging Environment

```bash
# 1. Create staging directory
mkdir -p ~/supabase-staging
cd ~/supabase-staging

# 2. Clone repository
git clone <repository-url> .

# 3. Configure for staging
cp docker/.env.example docker/.env
nano docker/.env
```

**Staging Configuration:**
```bash
PROJECT_NAME=staging_supabase
PORT_OFFSET=100
SITE_URL=https://staging.yourdomain.com
API_EXTERNAL_URL=https://api-staging.yourdomain.com
DISABLE_SIGNUP=true  # Limit to test users
```

### Deploy to Staging

```bash
# Deploy with validation
./scripts/deploy.sh --production

# Verify deployment
./scripts/health-check.sh

# Run integration tests
./scripts/run-tests.sh  # If you have tests
```

### Staging Validation

```bash
# 1. Check all services
./scripts/health-check.sh

# 2. Test API endpoints
curl https://api-staging.yourdomain.com/rest/v1/

# 3. Test authentication
# Login to Studio and create test user

# 4. Test storage
# Upload and download test file

# 5. Test edge functions
# Invoke test function

# 6. Monitor logs
cd docker
docker compose logs -f | grep -i error
```

## Production Deployment

### Pre-Production Steps

```bash
# 1. Test in staging first
cd ~/supabase-staging
./scripts/health-check.sh

# 2. Review changes
cd ~/supabase-production
git fetch origin
git log HEAD..origin/main --oneline

# 3. Create pre-deployment backup
./scripts/backup.sh

# 4. Verify backup
ls -lh backups/ | tail -n 1
```

### Production Deployment Process

#### Step 1: Prepare

```bash
# Navigate to production directory
cd /opt/supabase

# Pull latest changes
git pull origin main

# Review changes
git log -5 --oneline

# Verify environment
./scripts/validate-instance.sh
```

#### Step 2: Notify

```bash
# Send notification to users (example)
echo "Maintenance starting in 5 minutes" | \
  mail -s "Scheduled Maintenance" users@yourdomain.com

# Or use your notification system
# curl -X POST https://api.slack.com/... (Slack notification)
```

#### Step 3: Deploy

```bash
# Standard deployment
./scripts/deploy.sh --production

# Or with rebuild
./scripts/deploy.sh --production --build

# Or with cleanup
./scripts/deploy.sh --production --build --prune
```

**Deployment Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supabase Deployment - production_supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment: production
Instance: production_supabase

ℹ Step 1/7: Running pre-deployment validation...
✓ Validation passed

ℹ Step 2/7: Creating pre-deployment backup...
✓ Backup created: /opt/supabase/backups/20231125_140530

ℹ Step 3/7: Pulling latest Docker images...
✓ Images pulled

ℹ Step 4/7: Skipping image build

ℹ Step 5/7: Stopping current services...
✓ Services stopped

ℹ Step 6/7: Skipping cleanup

ℹ Step 7/7: Starting services...
✓ Services started

ℹ Running post-deployment health check...
✓ Health check passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Deployment completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Step 4: Verify

```bash
# Run health check
./scripts/health-check.sh

# Test API
curl https://api.yourdomain.com/rest/v1/

# Check logs for errors
cd docker
docker compose logs --tail=100 | grep -i error

# Monitor for 5-10 minutes
docker compose logs -f
```

#### Step 5: Notify Completion

```bash
# Send completion notification
echo "Maintenance completed successfully" | \
  mail -s "Maintenance Complete" users@yourdomain.com
```

### Production Deployment Checklist

After deployment, verify:

- [ ] All services show "healthy" status
- [ ] API endpoints respond correctly
- [ ] Authentication works (login/signup)
- [ ] Storage upload/download works
- [ ] Edge functions execute
- [ ] Database queries work
- [ ] SSL certificates valid
- [ ] No errors in logs
- [ ] Response times normal
- [ ] Monitoring shows green
- [ ] Backup completed successfully

## Deployment Scripts

### deploy.sh

Main deployment script with safety checks.

**Usage:**
```bash
./scripts/deploy.sh [options]
```

**Options:**
- `--local, -l`: Deploy for local development
- `--production, --prod`: Deploy for production
- `--build`: Rebuild images before deploying
- `--prune`: Clean up old images and volumes
- `--restart`: Restart services (no rebuild)
- `--no-backup`: Skip pre-deployment backup
- `--help`: Show help message

**Examples:**
```bash
# Local deployment
./scripts/deploy.sh --local

# Production deployment
./scripts/deploy.sh --production

# Full rebuild with cleanup
./scripts/deploy.sh --production --build --prune

# Quick restart
./scripts/deploy.sh --restart

# Skip backup (not recommended)
./scripts/deploy.sh --production --no-backup
```

### Deployment Script Features

1. **Pre-deployment Validation**
   - Checks environment configuration
   - Validates port availability
   - Verifies disk space
   - Checks Docker installation

2. **Automatic Backup**
   - Creates backup before deployment
   - Stores backup location for rollback
   - Skippable with `--no-backup` flag

3. **Image Management**
   - Pulls latest images
   - Optional rebuild with `--build`
   - Optional cleanup with `--prune`

4. **Service Management**
   - Graceful service shutdown
   - Ordered service startup
   - Health check verification

5. **Post-deployment Verification**
   - Automatic health checks
   - Service status verification
   - Rollback instructions if failed

## Post-Deployment Verification

### Automated Verification

```bash
# Run comprehensive health check
./scripts/health-check.sh

# Expected output:
# ✓ db: healthy
# ✓ redis: healthy
# ✓ minio: healthy
# ✓ kong: healthy
# ✓ gotrue: healthy
# ✓ postgrest: healthy
# ✓ realtime: healthy
# ✓ storage: healthy
# ✓ functions: healthy
# ✓ meta: healthy
# ✓ studio: healthy
```

### Manual Verification

#### 1. Service Status

```bash
cd docker
docker compose ps

# All services should show "Up" and "healthy"
```

#### 2. API Endpoints

```bash
# Source environment
source docker/.env

# Test REST API
curl -X GET "https://api.yourdomain.com/rest/v1/" \
  -H "apikey: $ANON_KEY"

# Test Auth API
curl -X GET "https://api.yourdomain.com/auth/v1/health" \
  -H "apikey: $ANON_KEY"

# Test Storage API
curl -X GET "https://api.yourdomain.com/storage/v1/bucket" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

#### 3. Database Connection

```bash
# Connect to database
docker exec -it production_supabase_db psql -U postgres

# Run test query
SELECT version();
SELECT COUNT(*) FROM pg_stat_activity;

# Exit
\q
```

#### 4. Studio Access

```bash
# Open Studio
open https://studio.yourdomain.com

# Verify:
# - Can login
# - Can view tables
# - Can run SQL queries
# - Can view API docs
```

#### 5. Log Review

```bash
# Check for errors in last 100 lines
cd docker
docker compose logs --tail=100 | grep -i error

# Monitor real-time logs
docker compose logs -f

# Check specific service
docker compose logs -f kong
```

#### 6. Performance Check

```bash
# Check response times
time curl https://api.yourdomain.com/rest/v1/

# Should be < 500ms

# Check database performance
docker exec -it production_supabase_db psql -U postgres -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### Monitoring Dashboard

Set up monitoring to track:
- Service uptime
- Response times
- Error rates
- Database connections
- Disk usage
- Memory usage
- CPU usage

## Rollback Procedures

### When to Rollback

Rollback if you observe:
- Services failing health checks
- High error rates in logs
- Database connection failures
- API endpoints not responding
- Authentication failures
- Critical functionality broken

### Quick Rollback

```bash
# 1. Stop current deployment
cd docker
docker compose down

# 2. Restore from backup
cd ..
./scripts/restore.sh --backup /path/to/backup

# 3. Verify restoration
./scripts/health-check.sh
```

### Detailed Rollback Process

#### Step 1: Identify Backup

```bash
# List recent backups
ls -lht backups/ | head -n 5

# Deployment script shows backup location:
# "Backup created: /opt/supabase/backups/20231125_140530"
```

#### Step 2: Stop Services

```bash
cd docker
docker compose down

# Verify all stopped
docker compose ps
```

#### Step 3: Restore Backup

```bash
cd ..

# Restore everything
./scripts/restore.sh --backup backups/20231125_140530

# Or restore specific components
./scripts/restore.sh --backup backups/20231125_140530 --database-only
./scripts/restore.sh --backup backups/20231125_140530 --storage-only
./scripts/restore.sh --backup backups/20231125_140530 --config-only
```

#### Step 4: Verify Rollback

```bash
# Check service health
./scripts/health-check.sh

# Test API
curl https://api.yourdomain.com/rest/v1/

# Check logs
cd docker
docker compose logs --tail=50
```

#### Step 5: Notify

```bash
# Notify team and users
echo "System rolled back to previous version" | \
  mail -s "Rollback Completed" team@yourdomain.com
```

### Rollback Checklist

- [ ] Services stopped cleanly
- [ ] Backup restored successfully
- [ ] Services started successfully
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database accessible
- [ ] No errors in logs
- [ ] Users notified
- [ ] Incident documented

## Multi-Instance Deployment

### Deploying Multiple Instances

```bash
# Instance 1: Production
cd ~/supabase-prod
./scripts/deploy.sh --production

# Instance 2: Staging
cd ~/supabase-staging
./scripts/deploy.sh --production

# Instance 3: Development
cd ~/supabase-dev
./scripts/deploy.sh --local
```

### Blue-Green Deployment

```bash
# 1. Deploy to green instance
cd ~/supabase-green
./scripts/deploy.sh --production

# 2. Verify green instance
./scripts/health-check.sh
# Run smoke tests

# 3. Switch traffic (update load balancer/DNS)
# This is environment-specific

# 4. Monitor green instance
cd docker
docker compose logs -f

# 5. Keep blue instance running for 24h
# In case rollback needed

# 6. After 24h, stop blue instance
cd ~/supabase-blue/docker
docker compose down
```

### Canary Deployment

```bash
# 1. Deploy new version to canary instance
cd ~/supabase-canary
./scripts/deploy.sh --production

# 2. Route 10% of traffic to canary
# (Configure in load balancer)

# 3. Monitor metrics for 1 hour
# - Error rates
# - Response times
# - User feedback

# 4. If successful, increase to 50%
# Monitor for another hour

# 5. If still successful, route 100%
# Deploy to main instance

# 6. If issues, route back to 0%
# Investigate and fix
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Supabase

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Deploy to Production
        run: |
          ssh user@server.com << 'EOF'
            cd /opt/supabase
            git pull origin main
            ./scripts/deploy.sh --production
          EOF
      
      - name: Verify Deployment
        run: |
          ssh user@server.com << 'EOF'
            cd /opt/supabase
            ./scripts/health-check.sh
          EOF
      
      - name: Notify on Failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"Deployment failed!"}'
```

### GitLab CI Example

```yaml
deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan server.com >> ~/.ssh/known_hosts
    - ssh user@server.com "cd /opt/supabase && git pull && ./scripts/deploy.sh --production"
    - ssh user@server.com "cd /opt/supabase && ./scripts/health-check.sh"
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    stages {
        stage('Deploy') {
            steps {
                sshagent(['production-ssh']) {
                    sh '''
                        ssh user@server.com "cd /opt/supabase && \
                            git pull origin main && \
                            ./scripts/deploy.sh --production"
                    '''
                }
            }
        }
        
        stage('Verify') {
            steps {
                sshagent(['production-ssh']) {
                    sh '''
                        ssh user@server.com "cd /opt/supabase && \
                            ./scripts/health-check.sh"
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            mail to: 'team@yourdomain.com',
                 subject: "Deployment Failed: ${env.JOB_NAME}",
                 body: "Deployment failed. Check Jenkins for details."
        }
    }
}
```

## Troubleshooting

### Deployment Fails at Validation

```bash
# Check validation errors
./scripts/validate-instance.sh

# Common issues:
# - Port conflicts: Change PORT_OFFSET
# - Missing .env: Copy from .env.example
# - Disk space: Free up space
```

### Services Won't Start

```bash
# Check logs
cd docker
docker compose logs -f

# Check specific service
docker compose logs [service-name]

# Common issues:
# - Database initialization: Wait longer
# - Port conflicts: Check PORT_OFFSET
# - Memory: Increase Docker memory limit
```

### Health Check Fails

```bash
# Check which service failed
./scripts/health-check.sh

# Check service logs
cd docker
docker compose logs [failed-service]

# Restart specific service
docker compose restart [failed-service]

# Wait and retry
sleep 30
./scripts/health-check.sh
```

### Backup Fails

```bash
# Check backup script
./scripts/backup.sh

# Check disk space
df -h

# Check database connection
docker exec -it production_supabase_db psql -U postgres -c "SELECT 1;"

# Manual backup
docker exec production_supabase_db pg_dump -U postgres > manual_backup.sql
```

### Rollback Fails

```bash
# Check backup integrity
ls -lh backups/[backup-name]

# Try manual restoration
cd docker
docker compose down -v  # WARNING: Deletes data
docker compose up -d

# Restore database manually
docker exec -i production_supabase_db psql -U postgres < backup.sql
```

## Best Practices

### Before Deployment

1. **Test in Staging**: Always test changes in staging first
2. **Review Changes**: Review all code changes before deploying
3. **Backup**: Ensure backup system is working
4. **Schedule**: Deploy during low-traffic periods
5. **Notify**: Inform users of maintenance window

### During Deployment

1. **Monitor**: Watch logs during deployment
2. **Verify**: Run health checks after each step
3. **Document**: Note any issues or deviations
4. **Communicate**: Keep team informed of progress
5. **Be Ready**: Have rollback plan ready

### After Deployment

1. **Verify**: Run comprehensive verification
2. **Monitor**: Watch metrics for 30+ minutes
3. **Document**: Document any issues encountered
4. **Review**: Conduct post-deployment review
5. **Improve**: Update procedures based on learnings

## Additional Resources

- [Setup Guide](SETUP.md) - Initial setup and configuration
- [Backup & Recovery](BACKUP_RECOVERY.md) - Backup procedures
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [Architecture](ARCHITECTURE.md) - System architecture
- [API Reference](API_REFERENCE.md) - API documentation

## Support

- **Health Check**: `./scripts/health-check.sh`
- **Logs**: `docker compose logs -f [service]`
- **Backup**: `./scripts/backup.sh`
- **Restore**: `./scripts/restore.sh`
- **Validation**: `./scripts/validate-instance.sh`
