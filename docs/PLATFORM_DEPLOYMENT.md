# Digital Memoir Platform - Deployment Guide

**Version:** 2.0
**Last Updated:** 2025-12-19
**Status:** Authoritative

## Document Purpose

This document provides comprehensive deployment procedures for the Digital Memoir Platform Progressive Web App (PWA) and Supabase backend across different environments.

> **📱 PWA Deployment:** This platform is a Progressive Web App requiring HTTPS for full functionality. See section 6 for PWA-specific deployment requirements.

---

## 1. Deployment Overview

### 1.1 Architecture Components

**Frontend (Progressive Web App):**
- React + TypeScript + Vite
- Static files (HTML, CSS, JS)
- Service Worker for offline support
- Web App Manifest
- Deployed to CDN/Static hosting

**Backend (Supabase):**
- PostgreSQL database
- PostgREST API
- Edge Functions
- Storage
- Self-hosted or Supabase Cloud

### 1.2 Deployment Environments

**Development:**
- Local development machines
- Local Supabase via Docker
- Vite dev server (http://localhost:5173)
- Feature testing and rapid iteration

**Staging:**
- Pre-production environment
- Staging Supabase instance
- Preview deployment (Vercel/Netlify)
- Integration and UAT testing

**Production:**
- Live user-facing environment
- Production Supabase instance
- CDN-hosted static files with HTTPS
- Full monitoring and backup

### 1.3 Deployment Strategy

**Frontend:** Static hosting with CDN (Vercel, Netlify, Cloudflare Pages)

**Backend:** Supabase Cloud or self-hosted Docker

**Benefits:**
- Zero-downtime deployments
- Automatic HTTPS (required for PWA)
- Global CDN distribution
- Easy rollback capability
- Instant cache invalidation

---

## 2. Pre-Deployment Checklist

### 2.1 Code Readiness

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] No critical or high-severity bugs
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Changelog updated

### 2.2 Infrastructure Readiness

- [ ] Database migrations tested
- [ ] Backup completed and verified
- [ ] Monitoring alerts configured
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured

### 2.3 Configuration Readiness

- [ ] Environment variables set
- [ ] Secrets rotated (if needed)
- [ ] API keys validated
- [ ] SMTP configuration tested
- [ ] Storage buckets configured
- [ ] LLM API quotas checked

### 2.4 Team Readiness

- [ ] Deployment window scheduled
- [ ] Team members notified
- [ ] Rollback plan documented
- [ ] On-call engineer assigned
- [ ] Communication channels ready

---

## 3. Database Deployment

### 3.1 Migration Strategy

**Approach:** Forward-only migrations with backward compatibility

**Process:**
```bash
# 1. Backup database
./scripts/backup-database.sh production

# 2. Test migrations on staging
alembic upgrade head --sql > migration.sql
psql staging_db < migration.sql

# 3. Verify staging
./scripts/verify-database.sh staging

# 4. Apply to production
alembic upgrade head

# 5. Verify production
./scripts/verify-database.sh production
```

### 3.2 Migration Best Practices

**Safe Migrations:**
- Add columns with defaults
- Make columns nullable initially
- Create indexes concurrently
- Avoid table locks
- Test rollback procedures

**Unsafe Migrations (Avoid):**
- Dropping columns immediately
- Renaming columns without transition
- Adding NOT NULL without default
- Large data migrations in transaction

**Example Safe Migration:**
```python
# alembic/versions/001_add_user_role.py
def upgrade():
    # Add column as nullable first
    op.add_column('users', sa.Column('role', sa.String(50), nullable=True))
    
    # Set default value for existing rows
    op.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
    
    # Make column NOT NULL after data migration
    op.alter_column('users', 'role', nullable=False)

def downgrade():
    op.drop_column('users', 'role')
```

### 3.3 Data Migration

**For Large Data Migrations:**
```python
# Use batch processing
def migrate_data():
    batch_size = 1000
    offset = 0
    
    while True:
        rows = db.query(OldTable).limit(batch_size).offset(offset).all()
        if not rows:
            break
        
        for row in rows:
            new_row = NewTable(
                id=row.id,
                data=transform(row.data)
            )
            db.add(new_row)
        
        db.commit()
        offset += batch_size
        print(f"Migrated {offset} rows")
```

---

## 4. Application Deployment

### 4.1 Backend Deployment

#### 4.1.1 Build Process

```bash
# 1. Build Docker image
docker build -t memoir-backend:${VERSION} ./backend

# 2. Tag image
docker tag memoir-backend:${VERSION} memoir-backend:latest

# 3. Push to registry
docker push memoir-backend:${VERSION}
docker push memoir-backend:latest

# 4. Verify image
docker pull memoir-backend:${VERSION}
docker run --rm memoir-backend:${VERSION} python --version
```

#### 4.1.2 Deployment Process

**Using Docker Compose:**
```bash
# 1. Pull latest images
docker-compose pull

# 2. Stop old containers
docker-compose stop backend

# 3. Start new containers
docker-compose up -d backend

# 4. Verify health
curl https://api.yourdomain.com/health

# 5. Monitor logs
docker-compose logs -f backend
```

**Using Kubernetes:**
```bash
# 1. Apply new deployment
kubectl apply -f k8s/backend-deployment.yaml

# 2. Wait for rollout
kubectl rollout status deployment/memoir-backend

# 3. Verify pods
kubectl get pods -l app=memoir-backend

# 4. Check logs
kubectl logs -f deployment/memoir-backend
```

#### 4.1.3 Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "llm_api": "healthy",
    "storage": "healthy"
  }
}
```

### 4.2 Frontend (PWA) Deployment

#### 4.2.1 Build Process

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm ci

# 3. Set environment variables
cp .env.example .env
# Edit .env with production Supabase URL and keys

# 4. Build production bundle
npm run build

# 5. Verify build output
ls -lh dist/
# Should include:
# - index.html
# - assets/ (CSS, JS bundles)
# - manifest.json
# - service-worker.js
# - icons/ (8 PWA icon sizes)

# 6. Test build locally (requires HTTPS for full PWA features)
npm run preview
```

#### 4.2.2 PWA Pre-Deployment Checklist

- [ ] All 8 icon sizes generated (72px - 512px)
- [ ] manifest.json configured with production URLs
- [ ] Service worker registered in index.html
- [ ] HTTPS enabled (required for PWA)
- [ ] Environment variables set for production
- [ ] Lighthouse PWA audit score 100/100

#### 4.2.3 Deployment to Vercel (Recommended)

**Why Vercel:**
- ✅ Automatic HTTPS (required for PWA)
- ✅ Global CDN
- ✅ Zero-config deployment
- ✅ Preview deployments for PRs
- ✅ Automatic cache invalidation

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Configure project (first time only)
vercel

# 4. Deploy to production
vercel --prod

# 5. Verify PWA features
# Visit https://your-app.vercel.app
# Check: Install prompt, offline mode, service worker
```

**Vercel Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

#### 4.2.4 Deployment to Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialize site
netlify init

# 4. Deploy
netlify deploy --prod

# 5. Verify deployment
curl https://your-app.netlify.app
```

**Netlify Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 4.2.5 Deployment to Cloudflare Pages

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login
wrangler login

# 3. Deploy
wrangler pages publish dist/ --project-name everbound

# 4. Verify deployment
curl https://everbound.pages.dev
```

#### 4.2.6 Custom Domain Setup

**Vercel:**
```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME record: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.21.21
```

**Netlify:**
```bash
# Add custom domain
netlify domains:add yourdomain.com

# Netlify provides DNS instructions
```

### 4.3 Worker Deployment

```bash
# 1. Stop old workers
docker-compose stop worker

# 2. Start new workers
docker-compose up -d worker

# 3. Verify workers
celery -A app.celery inspect active

# 4. Monitor queue
celery -A app.celery inspect stats
```

---

## 5. PWA-Specific Deployment

### 5.1 HTTPS Requirement

**Critical:** PWAs require HTTPS (except localhost)

**Automatic HTTPS Providers:**
- ✅ Vercel
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ GitHub Pages (with custom domain)

**Custom Server:**
```bash
# Use Let's Encrypt for free SSL
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot renew --dry-run  # Test auto-renewal
```

### 5.2 Service Worker Deployment

**Important Considerations:**

1. **Cache Versioning:**
   ```javascript
   // Update version on each deployment
   const CACHE_NAME = 'everbound-v2';  // Increment version
   ```

2. **Cache Headers:**
   ```nginx
   # Service worker should not be cached
   location /service-worker.js {
     add_header Cache-Control "public, max-age=0, must-revalidate";
   }
   ```

3. **Update Strategy:**
   - Service worker updates automatically
   - Users get new version on next visit
   - Old cache cleared automatically

### 5.3 PWA Testing Post-Deployment

```bash
# 1. Run Lighthouse audit
lighthouse https://yourdomain.com \
  --only-categories=pwa \
  --view

# 2. Check PWA score (target: 100/100)

# 3. Test on real devices
# - iOS Safari: Manual "Add to Home Screen"
# - Android Chrome: Automatic install prompt
# - Desktop Chrome: Install icon in address bar

# 4. Verify offline functionality
# - Open app
# - Go offline (airplane mode)
# - Navigate between cached pages
# - Verify offline fallback works
```

### 5.4 PWA Deployment Checklist

- [ ] HTTPS enabled and working
- [ ] All icon sizes present and loading
- [ ] manifest.json accessible at /manifest.json
- [ ] Service worker registers successfully
- [ ] Offline page works
- [ ] Install prompt appears (Chrome/Edge)
- [ ] App installs successfully
- [ ] Standalone mode works (no browser UI)
- [ ] Theme color applies correctly
- [ ] Lighthouse PWA score: 100/100

---

## 6. Environment-Specific Deployments

### 6.1 Development Deployment

**Purpose:** Local development and testing

**Process:**
```bash
# 1. Start services
docker-compose -f docker-compose.dev.yml up -d

# 2. Run migrations
alembic upgrade head

# 3. Seed test data
python manage.py seed --env development

# 4. Start development servers
npm run dev  # Frontend
uvicorn main:app --reload  # Backend
```

**Configuration:**
```bash
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 6.2 Staging Deployment

**Purpose:** Pre-production testing and validation

**Process:**
```bash
# 1. Deploy to staging server
./scripts/deploy.sh staging

# 2. Run smoke tests
./scripts/smoke-tests.sh staging

# 3. Run integration tests
pytest tests/integration/ --env staging

# 4. Notify team
./scripts/notify-deployment.sh staging
```

**Configuration:**
```bash
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO
API_URL=https://staging-api.yourdomain.com
FRONTEND_URL=https://staging.yourdomain.com
```

**Staging Checklist:**
- [ ] Deployment successful
- [ ] All services healthy
- [ ] Smoke tests passing
- [ ] Integration tests passing
- [ ] Performance acceptable
- [ ] No errors in logs

### 6.3 Production Deployment

**Purpose:** Live user-facing environment

**Process:**
```bash
# 1. Final pre-deployment checks
./scripts/pre-deployment-check.sh production

# 2. Create deployment tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. Backup database
./scripts/backup-database.sh production

# 4. Deploy application
./scripts/deploy.sh production

# 5. Run health checks
./scripts/health-check.sh production

# 6. Monitor for issues
./scripts/monitor-deployment.sh production

# 7. Notify team
./scripts/notify-deployment.sh production success
```

**Configuration:**
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 6. Deployment Scripts

### 6.1 Main Deployment Script

**scripts/deploy.sh:**
```bash
#!/bin/bash
set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh <environment> [version]"
    exit 1
fi

echo "Deploying to $ENVIRONMENT..."

# 1. Pre-deployment backup
echo "Creating backup..."
./scripts/backup-database.sh $ENVIRONMENT

# 2. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 3. Build images
echo "Building images..."
docker-compose build

# 4. Run database migrations
echo "Running migrations..."
docker-compose run --rm backend alembic upgrade head

# 5. Deploy application
echo "Deploying application..."
docker-compose up -d

# 6. Wait for services to be ready
echo "Waiting for services..."
sleep 10

# 7. Run health checks
echo "Running health checks..."
./scripts/health-check.sh $ENVIRONMENT

# 8. Verify deployment
echo "Verifying deployment..."
./scripts/verify-deployment.sh $ENVIRONMENT

echo "Deployment complete!"
```

### 6.2 Health Check Script

**scripts/health-check.sh:**
```bash
#!/bin/bash
set -e

ENVIRONMENT=$1
API_URL=$(get_api_url $ENVIRONMENT)

echo "Running health checks for $ENVIRONMENT..."

# Backend health
echo "Checking backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -ne 200 ]; then
    echo "Backend health check failed: $response"
    exit 1
fi

# Database health
echo "Checking database..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health/db)
if [ $response -ne 200 ]; then
    echo "Database health check failed: $response"
    exit 1
fi

# Redis health
echo "Checking Redis..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health/redis)
if [ $response -ne 200 ]; then
    echo "Redis health check failed: $response"
    exit 1
fi

echo "All health checks passed!"
```

### 6.3 Rollback Script

**scripts/rollback.sh:**
```bash
#!/bin/bash
set -e

ENVIRONMENT=$1
VERSION=$2

echo "Rolling back $ENVIRONMENT to version $VERSION..."

# 1. Stop current deployment
docker-compose stop

# 2. Checkout previous version
git checkout $VERSION

# 3. Restore database backup (if needed)
read -p "Restore database backup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/restore-database.sh $ENVIRONMENT $VERSION
fi

# 4. Deploy previous version
docker-compose up -d

# 5. Verify rollback
./scripts/health-check.sh $ENVIRONMENT

echo "Rollback complete!"
```

---

## 7. Blue-Green Deployment

### 7.1 Setup

**Infrastructure:**
```
Load Balancer
├── Blue Environment (Current Production)
│   ├── Backend Instances
│   ├── Database (Shared)
│   └── Redis (Shared)
└── Green Environment (New Version)
    ├── Backend Instances
    ├── Database (Shared)
    └── Redis (Shared)
```

### 7.2 Deployment Process

```bash
# 1. Deploy to Green environment
./scripts/deploy-green.sh

# 2. Run smoke tests on Green
./scripts/smoke-tests.sh green

# 3. Gradually shift traffic (10%, 25%, 50%, 100%)
./scripts/shift-traffic.sh green 10
sleep 300  # Monitor for 5 minutes

./scripts/shift-traffic.sh green 25
sleep 300

./scripts/shift-traffic.sh green 50
sleep 600  # Monitor for 10 minutes

./scripts/shift-traffic.sh green 100

# 4. Monitor for issues
./scripts/monitor-deployment.sh green

# 5. If successful, mark Green as Blue
./scripts/promote-green-to-blue.sh

# 6. If issues, rollback
# ./scripts/shift-traffic.sh blue 100
```

### 7.3 Traffic Shifting

**Using Nginx:**
```nginx
upstream backend {
    server blue-backend:8000 weight=90;
    server green-backend:8000 weight=10;
}
```

**Using AWS ALB:**
```bash
# Shift 10% traffic to Green
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions \
    Type=forward,ForwardConfig='{
      "TargetGroups":[
        {"TargetGroupArn":"$BLUE_TG","Weight":90},
        {"TargetGroupArn":"$GREEN_TG","Weight":10}
      ]
    }'
```

---

## 8. Monitoring & Verification

### 8.1 Post-Deployment Monitoring

**Metrics to Monitor:**
- Response times (p50, p95, p99)
- Error rates
- Request throughput
- Database query performance
- Memory usage
- CPU usage
- Disk I/O

**Monitoring Tools:**
- Prometheus + Grafana
- Datadog
- New Relic
- CloudWatch (AWS)

### 8.2 Log Monitoring

```bash
# Backend logs
docker-compose logs -f --tail=100 backend

# Worker logs
docker-compose logs -f --tail=100 worker

# Database logs
docker-compose logs -f --tail=100 postgres

# Search for errors
docker-compose logs backend | grep ERROR

# Monitor specific endpoint
docker-compose logs backend | grep "/api/projects"
```

### 8.3 Alert Configuration

**Critical Alerts:**
- API error rate > 1%
- Response time p95 > 2s
- Database connection failures
- Disk space < 10%
- Memory usage > 90%

**Warning Alerts:**
- API error rate > 0.5%
- Response time p95 > 1s
- Queue depth > 1000
- Memory usage > 80%

---

## 9. Rollback Procedures

### 9.1 When to Rollback

**Immediate Rollback:**
- Critical bugs affecting all users
- Data corruption
- Security vulnerabilities
- Complete service outage

**Planned Rollback:**
- High error rates (> 5%)
- Significant performance degradation
- Failed health checks
- User-reported critical issues

### 9.2 Rollback Process

```bash
# 1. Identify issue
./scripts/diagnose-issue.sh

# 2. Decide to rollback
# Notify team

# 3. Execute rollback
./scripts/rollback.sh production v1.0.0

# 4. Verify rollback
./scripts/health-check.sh production

# 5. Monitor stability
./scripts/monitor-deployment.sh production

# 6. Post-mortem
# Document what went wrong
# Create action items
```

### 9.3 Database Rollback

**If migrations need rollback:**
```bash
# 1. Identify migration to rollback to
alembic history

# 2. Downgrade database
alembic downgrade <revision>

# 3. Verify database state
./scripts/verify-database.sh production

# 4. Restart application
docker-compose restart backend
```

---

## 10. Continuous Deployment

### 10.1 CI/CD Pipeline

**GitHub Actions Example:**
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          pytest
          npm test
      
      - name: Build images
        run: docker-compose build
      
      - name: Push images
        run: |
          docker push memoir-backend:${{ github.ref_name }}
          docker push memoir-frontend:${{ github.ref_name }}
      
      - name: Deploy to production
        run: |
          ssh production-server "./deploy.sh production ${{ github.ref_name }}"
      
      - name: Verify deployment
        run: |
          ./scripts/health-check.sh production
      
      - name: Notify team
        run: |
          ./scripts/notify-deployment.sh production success
```

### 10.2 Automated Testing

**Pre-Deployment Tests:**
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security scans

**Post-Deployment Tests:**
- Smoke tests
- Health checks
- API contract tests
- User journey tests

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

**Automated Backups:**
```bash
# Daily database backups
0 2 * * * /scripts/backup-database.sh production

# Weekly full backups
0 3 * * 0 /scripts/backup-full.sh production

# Backup retention: 30 days
```

**Backup Verification:**
```bash
# Test restore monthly
./scripts/test-restore.sh production
```

### 11.2 Recovery Procedures

**Database Recovery:**
```bash
# 1. Stop application
docker-compose stop backend worker

# 2. Restore database
./scripts/restore-database.sh production <backup-file>

# 3. Verify restoration
./scripts/verify-database.sh production

# 4. Restart application
docker-compose up -d
```

**Full System Recovery:**
```bash
# 1. Provision new infrastructure
./scripts/provision-infrastructure.sh

# 2. Restore database
./scripts/restore-database.sh production <backup-file>

# 3. Restore media files
./scripts/restore-storage.sh production <backup-file>

# 4. Deploy application
./scripts/deploy.sh production

# 5. Verify recovery
./scripts/verify-deployment.sh production
```

---

## 12. Security Considerations

### 12.1 Deployment Security

**Best Practices:**
- Use HTTPS for all external communication
- Rotate secrets regularly
- Use least-privilege access
- Enable audit logging
- Implement rate limiting
- Use Web Application Firewall (WAF)

**Secret Management:**
```bash
# Use environment variables
export DATABASE_PASSWORD=$(aws secretsmanager get-secret-value --secret-id db-password --query SecretString --output text)

# OR use secret management service
# AWS Secrets Manager
# HashiCorp Vault
# Google Secret Manager
```

### 12.2 SSL/TLS Configuration

**Using Let's Encrypt:**
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 13. Performance Optimization

### 13.1 Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_memory_fragments_project_narrator 
ON memory_fragments(project_id, narrator_id);

-- Analyze tables
ANALYZE memory_fragments;
ANALYZE chapters;

-- Vacuum tables
VACUUM ANALYZE;
```

### 13.2 Caching Strategy

```python
# Redis caching
from redis import Redis

cache = Redis(host='redis', port=6379)

def get_project(project_id):
    # Check cache first
    cached = cache.get(f"project:{project_id}")
    if cached:
        return json.loads(cached)
    
    # Query database
    project = db.query(Project).get(project_id)
    
    # Cache result
    cache.setex(
        f"project:{project_id}",
        3600,  # 1 hour TTL
        json.dumps(project.dict())
    )
    
    return project
```

### 13.3 CDN Configuration

**Cloudflare Settings:**
- Enable caching for static assets
- Set cache TTL: 1 month for assets
- Enable Brotli compression
- Enable HTTP/2 and HTTP/3
- Configure cache rules

---

## Document Authority

This deployment guide is derived from and subordinate to:
1. [`Digital_Memoir_Platform_Concept_and_Scope.pdf`](Digital_Memoir_Platform_Concept_and_Scope.pdf)
2. [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md)
3. [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
4. [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md)

All deployment procedures must maintain the platform's print-first, quality-enforced, voice-preserved principles.
