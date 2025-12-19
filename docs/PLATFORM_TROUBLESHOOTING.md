# Digital Memoir Platform - Troubleshooting Guide

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document provides comprehensive troubleshooting guidance for common issues in the Digital Memoir Platform, with specific focus on memoir generation, voice calibration, quality gates, and print production.

---

## 1. Quick Diagnostic Commands

### 1.1 System Health Check

```bash
# Overall health
curl http://localhost:8000/health

# Component health
curl http://localhost:8000/health/db
curl http://localhost:8000/health/redis
curl http://localhost:8000/health/llm
curl http://localhost:8000/health/storage

# Service status
docker-compose ps

# View logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 worker
```

### 1.2 Database Diagnostics

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql $DATABASE_URL -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check slow queries
psql $DATABASE_URL -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"
```

### 1.3 Redis Diagnostics

```bash
# Check Redis connection
redis-cli ping

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli client list

# Monitor commands
redis-cli monitor
```

---

## 2. Voice Calibration Issues

### 2.1 Voice Sample Upload Fails

**Symptoms:**
- Upload returns 400 error
- "Invalid file format" error
- Upload times out

**Diagnosis:**
```bash
# Check file size
ls -lh voice_sample.mp3

# Check file type
file voice_sample.mp3

# Check storage connection
curl http://localhost:8000/health/storage
```

**Solutions:**

**Issue: File too large**
```bash
# Maximum file size: 50MB
# Compress audio file
ffmpeg -i voice_sample.mp3 -b:a 128k voice_sample_compressed.mp3
```

**Issue: Invalid format**
```bash
# Supported formats: MP3, WAV, M4A, OGG
# Convert to MP3
ffmpeg -i voice_sample.wav -codec:a libmp3lame voice_sample.mp3
```

**Issue: Storage connection failed**
```bash
# Check S3 credentials
echo $S3_ACCESS_KEY
echo $S3_SECRET_KEY

# Test S3 connection
aws s3 ls s3://$S3_BUCKET --endpoint-url $S3_ENDPOINT
```

### 2.2 Voice Analysis Fails

**Symptoms:**
- Voice profile status stuck on "processing"
- "Voice analysis failed" error
- No voice characteristics extracted

**Diagnosis:**
```bash
# Check worker logs
docker-compose logs worker | grep "voice_analysis"

# Check LLM API connection
curl http://localhost:8000/health/llm

# Check voice profile status
psql $DATABASE_URL -c "
SELECT id, narrator_id, status, created_at 
FROM voice_profiles 
WHERE status = 'processing' 
AND created_at < NOW() - INTERVAL '10 minutes';
"
```

**Solutions:**

**Issue: Worker not running**
```bash
# Start worker
docker-compose up -d worker

# Check worker status
celery -A app.celery inspect active
```

**Issue: LLM API quota exceeded**
```bash
# Check API usage
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Switch to alternative model
# Edit .env: OPENAI_MODEL=gpt-3.5-turbo
```

**Issue: Audio transcription failed**
```bash
# Check audio file integrity
ffmpeg -v error -i voice_sample.mp3 -f null -

# Re-upload audio file
curl -X POST http://localhost:8000/projects/{project_id}/voice-profile \
  -H "Authorization: Bearer $TOKEN" \
  -F "voice_recording=@voice_sample.mp3"
```

### 2.3 Voice Consistency Issues

**Symptoms:**
- Generated prose doesn't match narrator's voice
- Inconsistent sentence length
- Wrong formality level

**Diagnosis:**
```bash
# Check voice profile characteristics
psql $DATABASE_URL -c "
SELECT 
    id,
    narrator_id,
    characteristics->>'avg_sentence_length' as avg_length,
    characteristics->>'formality_level' as formality,
    characteristics->>'sentence_complexity' as complexity
FROM voice_profiles
WHERE narrator_id = 'uuid';
"

# Check generated chapter voice consistency
curl http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/voice-analysis \
  -H "Authorization: Bearer $TOKEN"
```

**Solutions:**

**Issue: Insufficient voice sample**
```bash
# Voice sample should be 500-1000 words
# Re-submit longer writing sample

curl -X PATCH http://localhost:8000/projects/{project_id}/voice-profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"writing_sample": "Longer sample text here..."}'
```

**Issue: Voice profile not applied**
```bash
# Regenerate chapter with voice profile
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/regenerate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apply_voice_profile": true}'
```

---

## 3. Memory Fragment Issues

### 3.1 Fragment Upload Fails

**Symptoms:**
- Upload returns 500 error
- Fragment not appearing in list
- "Processing failed" status

**Diagnosis:**
```bash
# Check fragment status
psql $DATABASE_URL -c "
SELECT id, input_type, status, created_at, updated_at
FROM memory_fragments
WHERE status = 'processing'
AND created_at < NOW() - INTERVAL '5 minutes';
"

# Check worker logs
docker-compose logs worker | grep "memory_fragment"

# Check tagging engine
curl http://localhost:8000/health/tagging
```

**Solutions:**

**Issue: Tagging engine failed**
```bash
# Restart worker
docker-compose restart worker

# Retry tagging
curl -X POST http://localhost:8000/admin/retry-tagging \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fragment_id": "uuid"}'
```

**Issue: Database connection timeout**
```bash
# Check database connections
psql $DATABASE_URL -c "
SELECT count(*), state 
FROM pg_stat_activity 
GROUP BY state;
"

# Increase connection pool
# Edit .env: DATABASE_POOL_SIZE=20
docker-compose restart backend
```

### 3.2 Fragment Tagging Incorrect

**Symptoms:**
- Wrong life stage assigned
- Missing themes
- Incorrect emotional tone

**Diagnosis:**
```bash
# Check fragment tags
psql $DATABASE_URL -c "
SELECT 
    id,
    tags->>'life_stage' as life_stage,
    tags->>'themes' as themes,
    tags->>'emotional_tone' as tone
FROM memory_fragments
WHERE id = 'uuid';
"

# Check tagging model version
curl http://localhost:8000/admin/tagging-info \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

**Solutions:**

**Issue: Incorrect life stage**
```bash
# Manually update life stage
curl -X PATCH http://localhost:8000/projects/{project_id}/memories/{memory_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"timeline_anchor": {"type": "life_stage", "value": "childhood"}}}'

# Retag fragment
curl -X POST http://localhost:8000/admin/retag-fragment \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"fragment_id": "uuid"}'
```

**Issue: Missing themes**
```bash
# Add more context to fragment
curl -X PATCH http://localhost:8000/projects/{project_id}/memories/{memory_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"processed_content": "Enhanced content with more thematic details..."}'
```

---

## 4. Chapter Generation Issues

### 4.1 Chapter Generation Blocked

**Symptoms:**
- "Insufficient fragments" error
- Chapter status stuck on "insufficient"
- Cannot generate chapter

**Diagnosis:**
```bash
# Check chapter readiness
curl http://localhost:8000/projects/{project_id}/chapters/{chapter_number}/readiness \
  -H "Authorization: Bearer $TOKEN"

# Check available fragments
psql $DATABASE_URL -c "
SELECT 
    tags->>'life_stage' as life_stage,
    count(*) as fragment_count
FROM memory_fragments
WHERE project_id = 'uuid'
AND status = 'validated'
GROUP BY tags->>'life_stage';
"
```

**Solutions:**

**Issue: Not enough fragments**
```bash
# Minimum required: 5-8 fragments per chapter
# Add more memory fragments for this life stage

# Check specific requirements
curl http://localhost:8000/projects/{project_id}/chapters/{chapter_number}/requirements \
  -H "Authorization: Bearer $TOKEN"

# Response shows what's missing:
{
  "missing_elements": ["scene_setting", "reflection"],
  "recommendations": [
    "Add memories with sensory details about the setting",
    "Add reflective thoughts about this period"
  ]
}
```

**Issue: Fragments not validated**
```bash
# Check fragment statuses
psql $DATABASE_URL -c "
SELECT status, count(*) 
FROM memory_fragments 
WHERE project_id = 'uuid'
GROUP BY status;
"

# Validate fragments
curl -X POST http://localhost:8000/admin/validate-fragments \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"project_id": "uuid"}'
```

### 4.2 Chapter Generation Fails

**Symptoms:**
- Generation times out
- "Generation failed" error
- Chapter status stuck on "generating"

**Diagnosis:**
```bash
# Check generation status
psql $DATABASE_URL -c "
SELECT id, chapter_number, status, updated_at
FROM chapters
WHERE status = 'generating'
AND updated_at < NOW() - INTERVAL '10 minutes';
"

# Check worker logs
docker-compose logs worker | grep "chapter_generation"

# Check LLM API status
curl http://localhost:8000/health/llm
```

**Solutions:**

**Issue: LLM API timeout**
```bash
# Increase timeout
# Edit .env: LLM_TIMEOUT=120
docker-compose restart backend worker

# Retry generation
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/regenerate \
  -H "Authorization: Bearer $TOKEN"
```

**Issue: Out of memory**
```bash
# Check memory usage
docker stats

# Increase worker memory
# Edit docker-compose.yml:
# worker:
#   mem_limit: 4g

docker-compose up -d worker
```

**Issue: Generation queue backed up**
```bash
# Check queue depth
celery -A app.celery inspect active

# Add more workers
docker-compose scale worker=3
```

### 4.3 Generated Chapter Quality Issues

**Symptoms:**
- Chapter too short
- Repetitive content
- Missing narrative elements

**Diagnosis:**
```bash
# Check chapter quality
curl http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/quality \
  -H "Authorization: Bearer $TOKEN"

# Check word count
psql $DATABASE_URL -c "
SELECT id, chapter_number, word_count, target_word_count
FROM chapters
WHERE id = 'uuid';
"
```

**Solutions:**

**Issue: Chapter too short**
```bash
# Add more fragments to chapter
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/add-fragments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fragment_ids": ["uuid1", "uuid2", "uuid3"]}'

# Regenerate with more content
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/regenerate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"target_word_count": 3000}'
```

**Issue: Repetitive content**
```bash
# Run repetition detection
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/detect-repetition \
  -H "Authorization: Bearer $TOKEN"

# Regenerate with variety emphasis
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/regenerate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"emphasis": "variety"}'
```

---

## 5. Quality Gate Issues

### 5.1 Quality Check Fails

**Symptoms:**
- Quality score below threshold
- Specific checks failing
- Cannot proceed to print

**Diagnosis:**
```bash
# Get quality report
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/quality-report \
  -H "Authorization: Bearer $TOKEN"

# Check specific failures
psql $DATABASE_URL -c "
SELECT 
    id,
    overall_score,
    passed,
    checks->>'repetition_detection' as repetition,
    checks->>'timeline_coherence' as timeline,
    checks->>'chapter_length_validation' as length,
    checks->>'emotional_balance' as emotion,
    checks->>'filler_language' as filler
FROM quality_reports
WHERE manuscript_id = 'uuid'
ORDER BY created_at DESC
LIMIT 1;
"
```

**Solutions:**

**Issue: Repetition detection failed**
```bash
# View repeated phrases
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/repetitions \
  -H "Authorization: Bearer $TOKEN"

# Regenerate affected chapters
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/regenerate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"avoid_phrases": ["phrase1", "phrase2"]}'
```

**Issue: Timeline coherence failed**
```bash
# View timeline conflicts
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/timeline-conflicts \
  -H "Authorization: Bearer $TOKEN"

# Fix timeline conflicts
curl -X POST http://localhost:8000/projects/{project_id}/fix-timeline \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"conflicts": [{"fragment_id": "uuid", "corrected_date": "1985-06-15"}]}'
```

**Issue: Chapter length validation failed**
```bash
# View chapter lengths
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/chapter-lengths \
  -H "Authorization: Bearer $TOKEN"

# Expand short chapters
curl -X POST http://localhost:8000/projects/{project_id}/chapters/{chapter_id}/expand \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"target_word_count": 2500}'
```

**Issue: Emotional balance failed**
```bash
# View emotional arc
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/emotional-arc \
  -H "Authorization: Bearer $TOKEN"

# Add more varied memories
# Focus on different emotional tones
```

**Issue: Filler language detected**
```bash
# View filler language instances
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/filler-language \
  -H "Authorization: Bearer $TOKEN"

# Auto-fix filler language
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/fix-filler \
  -H "Authorization: Bearer $TOKEN"
```

### 5.2 Quality Check Timeout

**Symptoms:**
- Quality check never completes
- Status stuck on "quality_check"
- No quality report generated

**Diagnosis:**
```bash
# Check quality check status
psql $DATABASE_URL -c "
SELECT id, status, updated_at
FROM manuscripts
WHERE status = 'quality_check'
AND updated_at < NOW() - INTERVAL '15 minutes';
"

# Check worker logs
docker-compose logs worker | grep "quality_check"
```

**Solutions:**

**Issue: Worker crashed**
```bash
# Restart worker
docker-compose restart worker

# Retry quality check
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/quality-check \
  -H "Authorization: Bearer $TOKEN"
```

**Issue: Large manuscript**
```bash
# Run quality checks individually
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/check-repetition \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/check-timeline \
  -H "Authorization: Bearer $TOKEN"

# Increase worker timeout
# Edit .env: QUALITY_CHECK_TIMEOUT=600
docker-compose restart worker
```

---

## 6. Collaboration Issues

### 6.1 Collaborator Cannot Access Project

**Symptoms:**
- "Permission denied" error
- Collaborator not seeing project
- Invitation not received

**Diagnosis:**
```bash
# Check collaborator status
psql $DATABASE_URL -c "
SELECT 
    pc.id,
    pc.user_id,
    u.email,
    pc.role,
    pc.status,
    pc.invited_at,
    pc.accepted_at
FROM project_collaborators pc
JOIN users u ON pc.user_id = u.id
WHERE pc.project_id = 'uuid';
"

# Check permissions
psql $DATABASE_URL -c "
SELECT permissions
FROM project_collaborators
WHERE project_id = 'uuid' AND user_id = 'uuid';
"
```

**Solutions:**

**Issue: Invitation not sent**
```bash
# Resend invitation
curl -X POST http://localhost:8000/projects/{project_id}/collaborators/{collaborator_id}/resend-invitation \
  -H "Authorization: Bearer $TOKEN"
```

**Issue: Invitation expired**
```bash
# Check invitation expiry
psql $DATABASE_URL -c "
SELECT invited_at, invited_at + INTERVAL '30 days' as expires_at
FROM project_collaborators
WHERE id = 'uuid';
"

# Create new invitation
curl -X POST http://localhost:8000/projects/{project_id}/collaborators \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email": "collaborator@example.com", "role": "contributor"}'
```

**Issue: Wrong permissions**
```bash
# Update permissions
curl -X PATCH http://localhost:8000/projects/{project_id}/collaborators/{collaborator_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissions": {"can_view_drafts": true, "can_provide_feedback": true}}'
```

### 6.2 Perspective Conflicts Not Flagged

**Symptoms:**
- Conflicting memories not detected
- No conflict notifications
- Perspectives not preserved

**Diagnosis:**
```bash
# Check for overlapping memories
psql $DATABASE_URL -c "
SELECT 
    mf1.id as fragment1_id,
    mf1.narrator_id as narrator1,
    mf2.id as fragment2_id,
    mf2.narrator_id as narrator2,
    mf1.metadata->>'timeline_anchor' as timeline1,
    mf2.metadata->>'timeline_anchor' as timeline2
FROM memory_fragments mf1
JOIN memory_fragments mf2 ON mf1.project_id = mf2.project_id
WHERE mf1.project_id = 'uuid'
AND mf1.narrator_id != mf2.narrator_id
AND mf1.metadata->>'timeline_anchor' = mf2.metadata->>'timeline_anchor';
"
```

**Solutions:**

**Issue: Conflict detection not running**
```bash
# Manually trigger conflict detection
curl -X POST http://localhost:8000/projects/{project_id}/detect-conflicts \
  -H "Authorization: Bearer $TOKEN"
```

**Issue: Conflicts not preserved**
```bash
# Check conflict preservation setting
curl http://localhost:8000/projects/{project_id}/settings \
  -H "Authorization: Bearer $TOKEN"

# Ensure preserve_conflicts is true
curl -X PATCH http://localhost:8000/projects/{project_id}/settings \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"preserve_conflicts": true}'
```

---

## 7. Print Production Issues

### 7.1 PDF Generation Fails

**Symptoms:**
- PDF generation times out
- "PDF generation failed" error
- Corrupted PDF file

**Diagnosis:**
```bash
# Check PDF generation status
psql $DATABASE_URL -c "
SELECT id, status, updated_at
FROM manuscripts
WHERE status = 'generating_pdf'
AND updated_at < NOW() - INTERVAL '10 minutes';
"

# Check worker logs
docker-compose logs worker | grep "pdf_generation"

# Check disk space
df -h
```

**Solutions:**

**Issue: Out of disk space**
```bash
# Clean up old PDFs
find /tmp -name "*.pdf" -mtime +7 -delete

# Clean up Docker volumes
docker system prune -a --volumes
```

**Issue: Missing fonts**
```bash
# Install required fonts
apt-get install fonts-liberation fonts-dejavu

# Verify fonts
fc-list | grep -i garamond
```

**Issue: Image resolution too low**
```bash
# Check photo resolutions
curl http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/photo-validation \
  -H "Authorization: Bearer $TOKEN"

# Replace low-resolution photos
curl -X POST http://localhost:8000/projects/{project_id}/media/{media_id}/replace \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@high_res_photo.jpg"
```

### 7.2 PDF Validation Fails

**Symptoms:**
- "PDF not print-ready" error
- Print service rejects PDF
- Quality issues in PDF

**Diagnosis:**
```bash
# Validate PDF
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/validate-pdf \
  -H "Authorization: Bearer $TOKEN"

# Check PDF properties
pdfinfo manuscript.pdf

# Check PDF/X compliance
gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFX -sOutputFile=validated.pdf manuscript.pdf
```

**Solutions:**

**Issue: Fonts not embedded**
```bash
# Check embedded fonts
pdffonts manuscript.pdf

# Regenerate PDF with embedded fonts
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/generate-pdf \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"embed_fonts": true}'
```

**Issue: Wrong color space**
```bash
# Convert to CMYK
gs -dSAFER -dBATCH -dNOPAUSE -dNOCACHE -sDEVICE=pdfwrite \
   -sColorConversionStrategy=CMYK -dProcessColorModel=/DeviceCMYK \
   -sOutputFile=cmyk.pdf manuscript.pdf
```

**Issue: Incorrect page size**
```bash
# Check page size
pdfinfo manuscript.pdf | grep "Page size"

# Regenerate with correct trim size
curl -X POST http://localhost:8000/projects/{project_id}/manuscripts/{manuscript_id}/generate-pdf \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"trim_size": "6x9"}'
```

### 7.3 Print Service Integration Issues

**Symptoms:**
- Cannot submit print job
- Print service API errors
- Order status not updating

**Diagnosis:**
```bash
# Check print service connection
curl http://localhost:8000/health/print-service

# Check print job status
psql $DATABASE_URL -c "
SELECT id, print_service, status, created_at, updated_at
FROM print_jobs
WHERE status IN ('pending', 'submitted')
AND updated_at < NOW() - INTERVAL '1 hour';
"
```

**Solutions:**

**Issue: API credentials invalid**
```bash
# Verify print service credentials
echo $BLURB_API_KEY
echo $LULU_API_KEY

# Test API connection
curl https://api.blurb.com/v1/health \
  -H "Authorization: Bearer $BLURB_API_KEY"
```

**Issue: Order submission failed**
```bash
# Retry print job submission
curl -X POST http://localhost:8000/projects/{project_id}/print-jobs/{print_job_id}/retry \
  -H "Authorization: Bearer $TOKEN"

# Check print service status page
# Blurb: https://status.blurb.com
# Lulu: https://status.lulu.com
```

---

## 8. Performance Issues

### 8.1 Slow API Responses

**Symptoms:**
- API requests taking > 2 seconds
- Timeouts
- Poor user experience

**Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/projects

# curl-format.txt:
# time_total: %{time_total}s

# Check database query performance
psql $DATABASE_URL -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# Check Redis performance
redis-cli --latency
```

**Solutions:**

**Issue: Missing database indexes**
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_memory_fragments_project_narrator 
ON memory_fragments(project_id, narrator_id);

CREATE INDEX CONCURRENTLY idx_chapters_project_status 
ON chapters(project_id, status);
```

**Issue: N+1 query problem**
```python
# Use eager loading
projects = db.query(Project).options(
    joinedload(Project.chapters),
    joinedload(Project.memory_fragments)
).all()
```

**Issue: Cache not working**
```bash
# Check Redis connection
redis-cli ping

# Clear cache and restart
redis-cli FLUSHALL
docker-compose restart backend
```

### 8.2 High Memory Usage

**Symptoms:**
- Out of memory errors
- Services crashing
- Slow performance

**Diagnosis:**
```bash
# Check memory usage
docker stats

# Check process memory
ps aux --sort=-%mem | head -10

# Check database memory
psql $DATABASE_URL -c "
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as db_size;
"
```

**Solutions:**

**Issue: Memory leak**
```bash
# Restart services
docker-compose restart backend worker

# Monitor memory over time
watch -n 5 'docker stats --no-stream'
```

**Issue: Large result sets**
```python
# Use pagination
def get_fragments(project_id, limit=100, offset=0):
    return db.query(MemoryFragment)\
        .filter_by(project_id=project_id)\
        .limit(limit)\
        .offset(offset)\
        .all()
```

**Issue: Insufficient resources**
```bash
# Increase Docker memory limit
# Edit docker-compose.yml:
# backend:
#   mem_limit: 4g
# worker:
#   mem_limit: 4g

docker-compose up -d
```

---

## 9. Data Issues

### 9.1 Data Corruption

**Symptoms:**
- Invalid data in database
- Foreign key violations
- Orphaned records

**Diagnosis:**
```sql
-- Check for orphaned memory fragments
SELECT mf.id
FROM memory_fragments mf
LEFT JOIN projects p ON mf.project_id = p.id
WHERE p.id IS NULL;

-- Check for orphaned chapters
SELECT c.id
FROM chapters c
LEFT JOIN projects p ON c.project_id = p.id
WHERE p.id IS NULL;

-- Check for invalid statuses
SELECT id, status
FROM projects
WHERE status NOT IN ('setup', 'calibrating', 'collecting', 'assembling', 'reviewing', 'quality_check', 'print_ready', 'printing', 'completed');
```

**Solutions:**

**Issue: Orphaned records**
```sql
-- Clean up orphaned memory fragments
DELETE FROM memory_fragments
WHERE project_id NOT IN (SELECT id FROM projects);

-- Clean up orphaned chapters
DELETE FROM chapters
WHERE project_id NOT IN (SELECT id FROM projects);
```

**Issue: Invalid statuses**
```sql
-- Reset invalid statuses
UPDATE projects
SET status = 'collecting'
WHERE status NOT IN ('setup', 'calibrating', 'collecting', 'assembling', 'reviewing', 'quality_check', 'print_ready', 'printing', 'completed');
```

### 9.2 Data Recovery

**Symptoms:**
- Accidentally deleted data
- Need to restore previous version
- Data loss

**Diagnosis:**
```bash
# Check available backups
ls -lh /backups/

# Check backup age
find /backups/ -name "*.sql" -mtime -7
```

**Solutions:**

**Issue: Recent deletion**
```sql
-- Check if soft delete is enabled
SELECT id, deleted_at
FROM projects
WHERE deleted_at IS NOT NULL;

-- Restore soft-deleted record
UPDATE projects
SET deleted_at = NULL
WHERE id = 'uuid';
```

**Issue: Need full restore**
```bash
# Restore from backup
./scripts/restore-database.sh production backup-2025-12-19.sql

# Verify restoration
psql $DATABASE_URL -c "SELECT count(*) FROM projects;"
```

---

## 10. Getting Help

### 10.1 Log Collection

```bash
# Collect all logs
./scripts/collect-logs.sh

# This creates: logs-2025-12-19.tar.gz containing:
# - Backend logs
# - Worker logs
# - Database logs
# - Redis logs
# - System logs
```

### 10.2 Issue Reporting

**Include in Bug Report:**
1. Error message (exact text)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment (dev/staging/production)
6. Relevant logs
7. Screenshots (if applicable)

**Template:**
```markdown
## Bug Report

**Environment:** Production
**Version:** 1.0.0
**Date:** 2025-12-19

**Description:**
Chapter generation fails with timeout error

**Steps to Reproduce:**
1. Create project
2. Add 10 memory fragments
3. Attempt to generate chapter 1
4. Wait 5 minutes
5. Error appears

**Expected Behavior:**
Chapter should generate within 2 minutes

**Actual Behavior:**
Request times out after 5 minutes

**Error Message:**
```
LLM API timeout after 300 seconds
```

**Logs:**
[Attach logs]

**Screenshots:**
[Attach screenshots]
```

### 10.3 Support Channels

- **Documentation:** [`docs/INDEX.md`](INDEX.md)