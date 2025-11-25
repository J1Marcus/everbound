#!/bin/sh
# ============================================
# MinIO Initialization Script
# ============================================
# This script runs after MinIO starts to configure storage buckets
# and policies for Supabase Storage API.
#
# Buckets created:
# - supabase-storage: Main storage bucket for user files
#
# Bucket structure:
# - /public: Publicly accessible files (read access)
# - /private: Private files (authenticated access only)
# - /authenticated: Files accessible to authenticated users
#
# This script uses the MinIO Client (mc) to configure buckets

set -e

echo "================================================"
echo "MinIO Initialization"
echo "================================================"

# Wait for MinIO to be fully ready
echo "Waiting for MinIO to be ready..."
sleep 10

# Check if MinIO is accessible
until curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do
  echo "Waiting for MinIO health check..."
  sleep 2
done

echo "✓ MinIO is ready"

# ============================================
# Configure MinIO Client
# ============================================
echo "Configuring MinIO client..."

# Set up alias for local MinIO instance
mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" --api S3v4

if [ $? -eq 0 ]; then
  echo "✓ MinIO client configured"
else
  echo "✗ Failed to configure MinIO client"
  exit 1
fi

# ============================================
# Create Storage Buckets
# ============================================
echo "Creating storage buckets..."

# Create main storage bucket
if mc mb local/supabase-storage --ignore-existing; then
  echo "✓ supabase-storage bucket created"
else
  echo "✗ Failed to create supabase-storage bucket"
  exit 1
fi

# ============================================
# Configure Bucket Policies
# ============================================
echo "Configuring bucket policies..."

# Create policy for public read access to /public folder
cat > /tmp/public-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::supabase-storage/public/*"]
    }
  ]
}
EOF

# Apply public policy
if mc anonymous set-json /tmp/public-policy.json local/supabase-storage; then
  echo "✓ Public folder policy configured"
else
  echo "⚠ Warning: Could not set public folder policy (may not be supported in this MinIO version)"
fi

# Set download policy for public folder (alternative method)
if mc anonymous set download local/supabase-storage/public; then
  echo "✓ Public folder download access enabled"
else
  echo "⚠ Warning: Could not enable public folder download access"
fi

# ============================================
# Configure Bucket Versioning (Optional)
# ============================================
echo "Configuring bucket versioning..."

if mc version enable local/supabase-storage; then
  echo "✓ Bucket versioning enabled"
else
  echo "⚠ Warning: Could not enable bucket versioning"
fi

# ============================================
# Configure CORS (Optional)
# ============================================
echo "Configuring CORS..."

# Create CORS configuration
cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

# Apply CORS configuration
if mc anonymous set-json /tmp/cors.json local/supabase-storage 2>/dev/null; then
  echo "✓ CORS configured"
else
  echo "⚠ Warning: Could not configure CORS (may require MinIO gateway mode)"
fi

# ============================================
# Create Folder Structure
# ============================================
echo "Creating folder structure..."

# Create placeholder files to establish folder structure
echo "placeholder" | mc pipe local/supabase-storage/public/.keep
echo "placeholder" | mc pipe local/supabase-storage/private/.keep
echo "placeholder" | mc pipe local/supabase-storage/authenticated/.keep

if [ $? -eq 0 ]; then
  echo "✓ Folder structure created"
else
  echo "⚠ Warning: Could not create folder structure"
fi

# ============================================
# Verify Configuration
# ============================================
echo "Verifying configuration..."

# List buckets
echo "Available buckets:"
mc ls local/

# Show bucket info
echo ""
echo "Bucket details:"
mc stat local/supabase-storage

# ============================================
# Data Persistence Testing
# ============================================
# To verify MinIO data persistence across container restarts:
#
# 1. Upload a test file:
#    echo "test content" > /tmp/test.txt
#    mc cp /tmp/test.txt local/supabase-storage/test.txt
#
# 2. Verify upload:
#    mc ls local/supabase-storage/
#
# 3. Restart container:
#    docker-compose -f docker/docker-compose.yml restart minio
#
# 4. Verify file persists:
#    mc ls local/supabase-storage/
#    mc cat local/supabase-storage/test.txt
#
# 5. Clean up:
#    mc rm local/supabase-storage/test.txt

# Clean up temporary files
rm -f /tmp/public-policy.json /tmp/cors.json

echo "================================================"
echo "MinIO initialization complete!"
echo "================================================"
echo ""
echo "Bucket created:"
echo "  - supabase-storage (main storage bucket)"
echo ""
echo "Folder structure:"
echo "  - /public (publicly accessible)"
echo "  - /private (private access)"
echo "  - /authenticated (authenticated users)"
echo ""
echo "Access URLs:"
echo "  - API: http://localhost:${MINIO_PORT:-9000}"
echo "  - Console: http://localhost:${MINIO_CONSOLE_PORT:-9001}"
echo ""
echo "Credentials:"
echo "  - User: ${MINIO_ROOT_USER}"
echo "  - Password: [hidden]"
echo "================================================"

exit 0