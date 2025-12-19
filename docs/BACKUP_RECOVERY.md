# Supabase Self-Hosted Backup & Recovery

Comprehensive guide for backing up and recovering self-hosted Supabase instances.

## Table of Contents

- [Overview](#overview)
- [Backup Strategy](#backup-strategy)
- [Backup Procedures](#backup-procedures)
- [Restore Procedures](#restore-procedures)
- [Automated Backups](#automated-backups)
- [Disaster Recovery](#disaster-recovery)
- [Testing Backups](#testing-backups)
- [Backup Storage](#backup-storage)
- [Best Practices](#best-practices)

## Overview

### What Gets Backed Up

1. **Database (PostgreSQL)**
   - All tables and data
   - Schemas and extensions
   - Functions and triggers
   - Row Level Security policies

2. **Storage (MinIO)**
   - All uploaded files
   - Bucket configurations
   - Access policies

3. **Configuration**
   - Environment variables (.env)
   - Docker Compose files
   - Caddy configuration
   - Custom scripts

### Backup Types

| Type | Frequency | Retention | Use Case |
|------|-----------|-----------|----------|
| **Full** | Daily | 7 days | Complete system backup |
| **Incremental** | Hourly | 24 hours | Recent changes only |
| **Weekly** | Sunday | 4 weeks | Long-term retention |
| **Monthly** | 1st of month | 12 months | Compliance/audit |
| **Pre-deployment** | Before deploy | Until verified | Rollback safety |

### Recovery Time Objectives

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Single table corruption | 15 min | 1 hour | High |
| Database failure | 30 min | 1 hour | Critical |
| Complete system failure | 2 hours | 24 hours | Critical |
| Accidental deletion | 1 hour | 1 hour | High |
| Disaster recovery | 4 hours | 24 hours | Medium |

## Backup Strategy

### 3-2-1 Backup Rule

- **3** copies of data
- **2** different storage types
- **1** offsite copy

```
Primary Data (Production)
    ↓
Local Backup (Same server)
    ↓
Remote Backup (Different server)
    ↓
Cloud Backup (S3/Cloud Storage)
```

### Backup Schedule

```
Daily:
├── 02:00 - Full database backup
├── 02:30 - Storage backup
└── 03:00 - Configuration backup

Hourly:
└── :00 - Incremental database backup

Weekly (Sunday):
└── 01:00 - Full system backup + verification

Monthly (1st):
└── 00:00 - Archive backup to cold storage
```

## Backup Procedures

### Manual Backup

#### Complete Backup

```bash
# Run backup script
./scripts/backup.sh

# Output:
# ✓ Database backup created
# ✓ Storage backup created
# ✓ Configuration backup created
# Backup location: /path/to/backups/20231125_140530
```

#### Database Only

```bash
# Backup database only
./scripts/backup.sh --database-only

# Or manually
docker exec ${PROJECT_NAME}_db pg_dump -U postgres -Fc > backup.dump
```

#### Storage Only

```bash
# Backup storage only
./scripts/backup.sh --storage-only

# Or manually
docker exec ${PROJECT_NAME}_minio mc mirror local/supabase-storage /backup/storage
```

#### Configuration Only

```bash
# Backup configuration only
./scripts/backup.sh --config-only

# Or manually
tar -czf config-backup.tar.gz docker/.env docker/docker-compose.yml caddy/
```

### Backup Script Usage

```bash
# Full backup
./scripts/backup.sh

# Compressed backup
./scripts/backup.sh --compress

# Database only
./scripts/backup.sh --database-only

# Storage only
./scripts/backup.sh --storage-only

# Configuration only
./scripts/backup.sh --config-only

# Custom backup location
./scripts/backup.sh --output /custom/path

# Quiet mode (no output)
./scripts/backup.sh --quiet
```

### Backup Contents

**Backup Directory Structure:**
```
backups/
└── 20231125_140530/
    ├── manifest.txt              # Backup metadata
    ├── database/
    │   ├── postgres.dump         # Database dump
    │   └── postgres.sql          # SQL format (optional)
    ├── storage/
    │   └── supabase-storage/     # All files
    │       ├── public/
    │       ├── private/
    │       └── authenticated/
    └── config/
        ├── .env                  # Environment variables
        ├── docker-compose.yml    # Docker configuration
        └── Caddyfile.prod        # Caddy configuration
```

### Backup Verification

```bash
# Check backup integrity
./scripts/backup.sh --verify /path/to/backup

# Manual verification
# 1. Check backup size
du -sh backups/20231125_140530

# 2. Verify database dump
pg_restore --list backups/20231125_140530/database/postgres.dump

# 3. Check file count
find backups/20231125_140530/storage -type f | wc -l

# 4. Verify manifest
cat backups/20231125_140530/manifest.txt
```

## Restore Procedures

### Complete System Restore

```bash
# 1. Stop services
cd docker
docker compose down

# 2. Run restore script
cd ..
./scripts/restore.sh --backup backups/20231125_140530

# 3. Verify restoration
./scripts/health-check.sh
```

### Database Restore

```bash
# Stop services
cd docker
docker compose down

# Restore database only
cd ..
./scripts/restore.sh --backup backups/20231125_140530 --database-only

# Start services
cd docker
docker compose up -d

# Verify
cd ..
./scripts/health-check.sh
```

### Storage Restore

```bash
# Restore storage only
./scripts/restore.sh --backup backups/20231125_140530 --storage-only

# Restart storage service
cd docker
docker compose restart storage minio
```

### Configuration Restore

```bash
# Restore configuration only
./scripts/restore.sh --backup backups/20231125_140530 --config-only

# Review changes
diff docker/.env docker/.env.backup

# Restart services if needed
cd docker
docker compose restart
```

### Selective Table Restore

```bash
# Extract specific table from backup
docker exec -i ${PROJECT_NAME}_db pg_restore \
  --table=users \
  --data-only \
  backups/20231125_140530/database/postgres.dump

# Or using SQL
docker exec -i ${PROJECT_NAME}_db psql -U postgres << EOF
BEGIN;
DELETE FROM users WHERE created_at > '2023-11-25';
\copy users FROM 'backup_users.csv' CSV HEADER
COMMIT;
EOF
```

### Point-in-Time Recovery

```bash
# Restore to specific timestamp
# Requires WAL archiving enabled

# 1. Stop database
docker compose down db

# 2. Restore base backup
docker volume rm ${PROJECT_NAME}_db_data
docker volume create ${PROJECT_NAME}_db_data
tar -xzf base_backup.tar.gz -C /var/lib/docker/volumes/${PROJECT_NAME}_db_data/_data

# 3. Configure recovery
cat > recovery.conf << EOF
restore_command = 'cp /wal_archive/%f %p'
recovery_target_time = '2023-11-25 14:30:00'
EOF

# 4. Start database
docker compose up -d db

# 5. Wait for recovery
docker compose logs -f db | grep "recovery complete"
```

### Restore Script Usage

```bash
# Interactive restore (lists available backups)
./scripts/restore.sh

# Restore specific backup
./scripts/restore.sh --backup backups/20231125_140530

# Database only
./scripts/restore.sh --backup backups/20231125_140530 --database-only

# Storage only
./scripts/restore.sh --backup backups/20231125_140530 --storage-only

# Configuration only
./scripts/restore.sh --backup backups/20231125_140530 --config-only

# Force restore (skip confirmations)
./scripts/restore.sh --backup backups/20231125_140530 --force

# Dry run (show what would be restored)
./scripts/restore.sh --backup backups/20231125_140530 --dry-run
```

## Automated Backups

### Cron Setup

```bash
# Edit crontab
crontab -e

# Add backup jobs
# Daily full backup at 2 AM
0 2 * * * /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1

# Hourly incremental backup
0 * * * * /opt/supabase/scripts/backup.sh --incremental >> /var/log/supabase-backup.log 2>&1

# Weekly backup with verification (Sunday 1 AM)
0 1 * * 0 /opt/supabase/scripts/backup.sh --verify >> /var/log/supabase-backup.log 2>&1

# Monthly cleanup (keep last 30 days)
0 3 1 * * find /opt/supabase/backups -type d -mtime +30 -exec rm -rf {} +

# Backup to remote server (daily at 3 AM)
0 3 * * * rsync -avz /opt/supabase/backups/ backup-server:/backups/supabase/
```

### Systemd Timer (Alternative to Cron)

**Create timer unit:**
```bash
# /etc/systemd/system/supabase-backup.timer
[Unit]
Description=Supabase Backup Timer
Requires=supabase-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Create service unit:**
```bash
# /etc/systemd/system/supabase-backup.service
[Unit]
Description=Supabase Backup Service
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/supabase/scripts/backup.sh
User=supabase
StandardOutput=journal
StandardError=journal
```

**Enable and start:**
```bash
sudo systemctl enable supabase-backup.timer
sudo systemctl start supabase-backup.timer
sudo systemctl status supabase-backup.timer
```

### Backup Monitoring

```bash
# Check last backup
ls -lht backups/ | head -n 5

# Check backup size
du -sh backups/*

# Verify backup completed successfully
tail -n 50 /var/log/supabase-backup.log

# Check backup age
find backups/ -type d -name "202*" -mtime +1 | wc -l
# Should be 0 (no backups older than 1 day)
```

### Backup Alerts

```bash
# Add to cron for email alerts
0 2 * * * /opt/supabase/scripts/backup.sh || echo "Backup failed!" | mail -s "Supabase Backup Failed" admin@example.com

# Slack notification
0 2 * * * /opt/supabase/scripts/backup.sh && curl -X POST -H 'Content-type: application/json' --data '{"text":"Supabase backup completed"}' YOUR_SLACK_WEBHOOK_URL

# Custom monitoring script
#!/bin/bash
BACKUP_AGE=$(find backups/ -type d -name "202*" -mtime -1 | wc -l)
if [ $BACKUP_AGE -eq 0 ]; then
    echo "No recent backups found!" | mail -s "Backup Alert" admin@example.com
fi
```

## Disaster Recovery

### Complete System Failure

**Scenario**: Server crashed, all data lost.

**Recovery Steps:**

```bash
# 1. Provision new server
# Follow setup guide: docs/SETUP.md

# 2. Install dependencies
sudo apt update && sudo apt install -y docker.io docker-compose-plugin

# 3. Clone repository
git clone <repository-url> /opt/supabase
cd /opt/supabase

# 4. Copy backup from remote location
rsync -avz backup-server:/backups/supabase/latest/ ./backups/latest/

# 5. Restore configuration
cp backups/latest/config/.env docker/.env
cp backups/latest/config/docker-compose.yml docker/

# 6. Create volumes
docker volume create ${PROJECT_NAME}_db_data
docker volume create ${PROJECT_NAME}_minio_data
docker volume create ${PROJECT_NAME}_redis_data

# 7. Restore database
docker compose up -d db
sleep 30
docker exec -i ${PROJECT_NAME}_db pg_restore -U postgres -d postgres < backups/latest/database/postgres.dump

# 8. Restore storage
docker compose up -d minio
docker exec ${PROJECT_NAME}_minio mc mirror backups/latest/storage/supabase-storage local/supabase-storage

# 9. Start all services
docker compose up -d

# 10. Verify
./scripts/health-check.sh

# 11. Test functionality
curl https://api.yourdomain.com/rest/v1/
```

### Data Corruption

**Scenario**: Database table corrupted or data accidentally deleted.

**Recovery Steps:**

```bash
# 1. Identify affected table
# Check logs or user reports

# 2. Stop writes to affected table
# Via application or database trigger

# 3. Export current state (for comparison)
docker exec ${PROJECT_NAME}_db pg_dump -U postgres -t users > users_corrupted.sql

# 4. Restore from backup
docker exec -i ${PROJECT_NAME}_db pg_restore \
  --table=users \
  --clean \
  --if-exists \
  backups/latest/database/postgres.dump

# 5. Verify restoration
docker exec ${PROJECT_NAME}_db psql -U postgres -c "SELECT COUNT(*) FROM users;"

# 6. Resume normal operations
```

### Ransomware Attack

**Scenario**: System compromised, data encrypted.

**Recovery Steps:**

```bash
# 1. Isolate system
# Disconnect from network immediately

# 2. Do NOT pay ransom
# Contact security team and law enforcement

# 3. Provision clean server
# New server, fresh OS installation

# 4. Restore from offsite backup
# Use backup from before attack (check timestamps)

# 5. Scan restored data
# Run antivirus/malware scans

# 6. Change all credentials
./scripts/generate-secrets.sh --production

# 7. Review security
# Patch vulnerabilities, update firewall rules

# 8. Monitor closely
# Watch for suspicious activity
```

## Testing Backups

### Regular Testing Schedule

- **Weekly**: Verify backup files exist and are not corrupted
- **Monthly**: Restore to test environment
- **Quarterly**: Full disaster recovery drill
- **Annually**: Restore to production-like environment

### Test Restore Procedure

```bash
# 1. Create test environment
mkdir -p ~/supabase-test
cd ~/supabase-test

# 2. Copy backup
cp -r /opt/supabase/backups/latest ./

# 3. Setup test instance
git clone <repository-url> .
cp latest/config/.env docker/.env

# Edit .env for test instance
nano docker/.env
# Change PROJECT_NAME=test_supabase
# Change PORT_OFFSET=100

# 4. Restore backup
./scripts/restore.sh --backup latest

# 5. Start services
cd docker
docker compose up -d

# 6. Verify
cd ..
./scripts/health-check.sh

# 7. Test functionality
# - Login to Studio
# - Query database
# - Upload/download file
# - Test API endpoints

# 8. Document results
echo "Test restore completed: $(date)" >> test-restore-log.txt

# 9. Cleanup
cd docker
docker compose down -v
cd ../..
rm -rf ~/supabase-test
```

### Backup Integrity Checks

```bash
# Check database dump integrity
pg_restore --list backups/latest/database/postgres.dump > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Database backup is valid"
else
    echo "✗ Database backup is corrupted"
fi

# Check storage backup
EXPECTED_FILES=1000  # Adjust based on your data
ACTUAL_FILES=$(find backups/latest/storage -type f | wc -l)
if [ $ACTUAL_FILES -ge $EXPECTED_FILES ]; then
    echo "✓ Storage backup is complete"
else
    echo "✗ Storage backup may be incomplete"
fi

# Check configuration files
for file in .env docker-compose.yml Caddyfile.prod; do
    if [ -f "backups/latest/config/$file" ]; then
        echo "✓ $file backed up"
    else
        echo "✗ $file missing from backup"
    fi
done
```

## Backup Storage

### Local Storage

**Pros:**
- Fast backup/restore
- No network dependency
- No additional cost

**Cons:**
- Single point of failure
- Limited by disk space
- Vulnerable to physical damage

**Configuration:**
```bash
# Default backup location
BACKUP_DIR=/opt/supabase/backups

# Ensure sufficient space
df -h /opt/supabase/backups
# Recommended: 2x database size + storage size
```

### Remote Storage (rsync)

**Pros:**
- Offsite backup
- Automated sync
- Version history

**Cons:**
- Requires network
- Additional server needed
- Transfer time

**Setup:**
```bash
# Setup SSH key authentication
ssh-keygen -t rsa -b 4096
ssh-copy-id backup-server

# Test connection
ssh backup-server "echo 'Connection successful'"

# Add to cron
0 3 * * * rsync -avz --delete /opt/supabase/backups/ backup-server:/backups/supabase/
```

### Cloud Storage (S3)

**Pros:**
- Highly durable (99.999999999%)
- Scalable
- Geographic redundancy
- Lifecycle policies

**Cons:**
- Ongoing cost
- Network dependency
- Egress fees

**Setup:**
```bash
# Install AWS CLI
sudo apt install awscli

# Configure credentials
aws configure

# Upload backup
aws s3 sync backups/ s3://my-bucket/supabase-backups/

# Add to cron
0 4 * * * aws s3 sync /opt/supabase/backups/ s3://my-bucket/supabase-backups/ --delete

# Lifecycle policy (delete after 90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "supabase-backups/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

### Backup Encryption

```bash
# Encrypt backup before upload
tar -czf - backups/latest | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -out backup-encrypted.tar.gz.enc

# Decrypt backup
openssl enc -aes-256-cbc -d -pbkdf2 -in backup-encrypted.tar.gz.enc | \
  tar -xzf -

# Using GPG
tar -czf - backups/latest | \
  gpg --symmetric --cipher-algo AES256 -o backup-encrypted.tar.gz.gpg

# Decrypt
gpg --decrypt backup-encrypted.tar.gz.gpg | tar -xzf -
```

## Best Practices

### Backup Best Practices

1. **Automate Everything**
   - Use cron or systemd timers
   - No manual intervention required
   - Automated verification

2. **Test Regularly**
   - Monthly restore tests
   - Quarterly DR drills
   - Document test results

3. **Multiple Locations**
   - Local + Remote + Cloud
   - Geographic diversity
   - Different storage types

4. **Monitor Backups**
   - Alert on failures
   - Check backup age
   - Verify integrity

5. **Document Procedures**
   - Step-by-step restore guide
   - Contact information
   - Escalation procedures

6. **Secure Backups**
   - Encrypt sensitive data
   - Restrict access
   - Audit backup access

7. **Retention Policy**
   - Daily: 7 days
   - Weekly: 4 weeks
   - Monthly: 12 months
   - Yearly: 7 years (compliance)

### Recovery Best Practices

1. **Have a Plan**
   - Written procedures
   - Tested regularly
   - Known to team

2. **Prioritize**
   - Critical data first
   - Staged recovery
   - Verify each step

3. **Communicate**
   - Notify stakeholders
   - Regular updates
   - Post-mortem review

4. **Document**
   - What happened
   - What was done
   - Lessons learned

5. **Improve**
   - Update procedures
   - Fix root causes
   - Prevent recurrence

### Backup Checklist

**Daily:**
- [ ] Verify backup completed
- [ ] Check backup size
- [ ] Review backup logs
- [ ] Monitor disk space

**Weekly:**
- [ ] Test backup integrity
- [ ] Verify offsite sync
- [ ] Review retention policy
- [ ] Check backup age

**Monthly:**
- [ ] Restore to test environment
- [ ] Verify all components
- [ ] Update documentation
- [ ] Review backup strategy

**Quarterly:**
- [ ] Full DR drill
- [ ] Test recovery procedures
- [ ] Review and update RTO/RPO
- [ ] Train team on procedures

## Additional Resources

- [Setup Guide](SETUP.md) - Initial setup
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [Architecture](ARCHITECTURE.md) - System architecture
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [API Reference](API_REFERENCE.md) - API documentation

## Support

- **Backup Script**: `./scripts/backup.sh --help`
- **Restore Script**: `./scripts/restore.sh --help`
- **Health Check**: `./scripts/health-check.sh`
- **Logs**: `docker compose logs -f [service]`
- **Community**: [Supabase Discord](https://discord.supabase.com)
