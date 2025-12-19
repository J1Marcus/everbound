# Supabase Self-Hosted API Reference

Complete API reference for self-hosted Supabase instances, covering all service endpoints and usage examples.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [REST API (PostgREST)](#rest-api-postgrest)
- [Auth API (GoTrue)](#auth-api-gotrue)
- [Storage API](#storage-api)
- [Realtime API](#realtime-api)
- [Edge Functions](#edge-functions)
- [Management APIs](#management-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## Overview

### Base URLs

**Local Development:**
```
API Gateway: http://localhost:8000
Studio: http://localhost:3000
```

**Production:**
```
API Gateway: https://api.yourdomain.com
Studio: https://studio.yourdomain.com
```

### API Structure

All APIs are accessed through the Kong API Gateway:

| Service | Path | Description |
|---------|------|-------------|
| REST API | `/rest/v1/` | Database operations |
| Auth API | `/auth/v1/` | Authentication |
| Storage API | `/storage/v1/` | File storage |
| Realtime | `/realtime/v1/` | WebSocket subscriptions |
| Functions | `/functions/v1/` | Edge Functions |

### API Keys

Get your API keys from [`docker/.env`](../docker/.env):

```bash
# Source environment variables
source docker/.env

# Anonymous key (public, client-side)
echo $ANON_KEY

# Service role key (private, server-side only)
echo $SERVICE_ROLE_KEY
```

**Key Types:**

- **ANON_KEY**: Public key for client-side applications, respects Row Level Security (RLS)
- **SERVICE_ROLE_KEY**: Private key for server-side operations, bypasses RLS

## Authentication

All API requests require authentication via API keys.

### Request Headers

```http
apikey: YOUR_ANON_KEY
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

### Example Request

```bash
curl -X GET 'http://localhost:8000/rest/v1/your_table' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

## REST API (PostgREST)

Automatic REST API for your PostgreSQL database.

### Base URL

```
http://localhost:8000/rest/v1/
```

### List Tables

```bash
# Get available tables
curl -X GET 'http://localhost:8000/rest/v1/' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

### Select Data

**Get all rows:**
```bash
curl -X GET 'http://localhost:8000/rest/v1/users?select=*' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Select specific columns:**
```bash
curl -X GET 'http://localhost:8000/rest/v1/users?select=id,email,name' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Filter results:**
```bash
# Equal to
curl -X GET 'http://localhost:8000/rest/v1/users?email=eq.user@example.com' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Greater than
curl -X GET 'http://localhost:8000/rest/v1/posts?created_at=gt.2023-01-01' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Like (pattern matching)
curl -X GET 'http://localhost:8000/rest/v1/users?name=like.*John*' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# In (multiple values)
curl -X GET 'http://localhost:8000/rest/v1/users?status=in.(active,pending)' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Ordering:**
```bash
# Order by column ascending
curl -X GET 'http://localhost:8000/rest/v1/posts?order=created_at.asc' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Order by column descending
curl -X GET 'http://localhost:8000/rest/v1/posts?order=created_at.desc' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Pagination:**
```bash
# Limit results
curl -X GET 'http://localhost:8000/rest/v1/posts?limit=10' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Offset (skip first N results)
curl -X GET 'http://localhost:8000/rest/v1/posts?limit=10&offset=20' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Range (page-based)
curl -X GET 'http://localhost:8000/rest/v1/posts' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Range: 0-9"  # First 10 items
```

**Joins (Foreign Keys):**
```bash
# Select with related data
curl -X GET 'http://localhost:8000/rest/v1/posts?select=*,author:users(name,email)' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

### Insert Data

**Single row:**
```bash
curl -X POST 'http://localhost:8000/rest/v1/users' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

**Multiple rows:**
```bash
curl -X POST 'http://localhost:8000/rest/v1/users' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[
    {"email": "user1@example.com", "name": "User One"},
    {"email": "user2@example.com", "name": "User Two"}
  ]'
```

### Update Data

**Update by ID:**
```bash
curl -X PATCH 'http://localhost:8000/rest/v1/users?id=eq.123' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Updated Name"
  }'
```

**Update with filter:**
```bash
curl -X PATCH 'http://localhost:8000/rest/v1/users?status=eq.pending' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Delete Data

**Delete by ID:**
```bash
curl -X DELETE 'http://localhost:8000/rest/v1/users?id=eq.123' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Delete with filter:**
```bash
curl -X DELETE 'http://localhost:8000/rest/v1/users?status=eq.inactive' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

### Call Functions

**RPC (Remote Procedure Call):**
```bash
curl -X POST 'http://localhost:8000/rest/v1/rpc/function_name' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "param1": "value1",
    "param2": "value2"
  }'
```

### Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal to | `?id=eq.123` |
| `neq` | Not equal to | `?status=neq.deleted` |
| `gt` | Greater than | `?age=gt.18` |
| `gte` | Greater than or equal | `?age=gte.18` |
| `lt` | Less than | `?age=lt.65` |
| `lte` | Less than or equal | `?age=lte.65` |
| `like` | Pattern match | `?name=like.*John*` |
| `ilike` | Case-insensitive pattern | `?name=ilike.*john*` |
| `in` | In list | `?status=in.(active,pending)` |
| `is` | Is null/true/false | `?deleted_at=is.null` |
| `not` | Negate condition | `?status=not.eq.deleted` |

## Auth API (GoTrue)

User authentication and management.

### Base URL

```
http://localhost:8000/auth/v1/
```

### Sign Up

**Email/Password:**
```bash
curl -X POST 'http://localhost:8000/auth/v1/signup' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

### Sign In

**Email/Password:**
```bash
curl -X POST 'http://localhost:8000/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Get User

```bash
curl -X GET 'http://localhost:8000/auth/v1/user' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

### Update User

```bash
curl -X PUT 'http://localhost:8000/auth/v1/user' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "newpassword123",
    "data": {
      "name": "John Doe"
    }
  }'
```

### Sign Out

```bash
curl -X POST 'http://localhost:8000/auth/v1/logout' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST 'http://localhost:8000/auth/v1/token?grant_type=refresh_token' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "REFRESH_TOKEN"
  }'
```

### Password Recovery

**Request reset:**
```bash
curl -X POST 'http://localhost:8000/auth/v1/recover' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Reset password:**
```bash
curl -X POST 'http://localhost:8000/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "newpassword123",
    "token": "RECOVERY_TOKEN"
  }'
```

### Magic Link

```bash
curl -X POST 'http://localhost:8000/auth/v1/magiclink' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### OAuth Providers

**Get OAuth URL:**
```bash
curl -X GET 'http://localhost:8000/auth/v1/authorize?provider=google' \
  -H "apikey: $ANON_KEY"
```

**Supported providers:**
- google
- github
- gitlab
- bitbucket
- azure
- facebook
- twitter
- discord
- twitch

## Storage API

File storage and management.

### Base URL

```
http://localhost:8000/storage/v1/
```

### List Buckets

```bash
curl -X GET 'http://localhost:8000/storage/v1/bucket' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

### Create Bucket

```bash
curl -X POST 'http://localhost:8000/storage/v1/bucket' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "avatars",
    "name": "avatars",
    "public": true
  }'
```

### Upload File

```bash
curl -X POST 'http://localhost:8000/storage/v1/object/avatars/user-123.jpg' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Download File

**Public bucket:**
```bash
curl -X GET 'http://localhost:8000/storage/v1/object/public/avatars/user-123.jpg' \
  -H "apikey: $ANON_KEY"
```

**Private bucket:**
```bash
curl -X GET 'http://localhost:8000/storage/v1/object/avatars/user-123.jpg' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

### List Files

```bash
curl -X POST 'http://localhost:8000/storage/v1/object/list/avatars' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "offset": 0,
    "sortBy": {
      "column": "name",
      "order": "asc"
    }
  }'
```

### Delete File

```bash
curl -X DELETE 'http://localhost:8000/storage/v1/object/avatars/user-123.jpg' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

### Create Signed URL

```bash
curl -X POST 'http://localhost:8000/storage/v1/object/sign/avatars/user-123.jpg' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expiresIn": 3600
  }'
```

**Response:**
```json
{
  "signedURL": "http://localhost:8000/storage/v1/object/sign/avatars/user-123.jpg?token=..."
}
```

### Image Transformations

```bash
# Resize image
curl -X GET 'http://localhost:8000/storage/v1/render/image/public/avatars/user-123.jpg?width=200&height=200' \
  -H "apikey: $ANON_KEY"

# With quality
curl -X GET 'http://localhost:8000/storage/v1/render/image/public/avatars/user-123.jpg?width=200&quality=80' \
  -H "apikey: $ANON_KEY"
```

## Realtime API

WebSocket subscriptions for real-time updates.

### Base URL

```
ws://localhost:8000/realtime/v1/websocket
```

### JavaScript Example

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'YOUR_ANON_KEY'
)

// Subscribe to table changes
const channel = supabase
  .channel('public:posts')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Subscribe to specific row
const channel = supabase
  .channel('public:posts:id=eq.123')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'posts',
      filter: 'id=eq.123'
    },
    (payload) => {
      console.log('Post updated!', payload)
    }
  )
  .subscribe()

// Unsubscribe
channel.unsubscribe()
```

### Events

- `INSERT`: New row inserted
- `UPDATE`: Row updated
- `DELETE`: Row deleted
- `*`: All events

### Presence

```javascript
// Track user presence
const channel = supabase.channel('room-1')

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    console.log('User joined:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    console.log('User left:', leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: 'user-123', online_at: new Date() })
    }
  })
```

### Broadcast

```javascript
// Send messages to channel
const channel = supabase.channel('room-1')

channel
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log('Message received:', payload)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { text: 'Hello!' }
      })
    }
  })
```

## Edge Functions

Serverless functions with Deno runtime.

### Base URL

```
http://localhost:8000/functions/v1/
```

### Create Function

```bash
# Create function directory
mkdir -p docker/volumes/functions/hello

# Create function file
cat > docker/volumes/functions/hello/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { name } = await req.json()
  
  const data = {
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString()
  }
  
  return new Response(
    JSON.stringify(data),
    { 
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  )
})
EOF

# Restart functions service
cd docker
docker compose restart functions
```

### Invoke Function

```bash
curl -X POST 'http://localhost:8000/functions/v1/hello' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "World"
  }'
```

**Response:**
```json
{
  "message": "Hello World!",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Function with Database Access

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(10)
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
  
  return new Response(
    JSON.stringify({ users: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
})
```

## Management APIs

### Meta API

Database metadata and migrations.

**Base URL:** `http://localhost:8080`

**Get tables:**
```bash
curl -X GET 'http://localhost:8080/tables' \
  -H "apikey: $SERVICE_ROLE_KEY"
```

**Get columns:**
```bash
curl -X GET 'http://localhost:8080/tables/users/columns' \
  -H "apikey: $SERVICE_ROLE_KEY"
```

### Health Checks

**Database:**
```bash
curl http://localhost:5432
```

**Kong:**
```bash
curl http://localhost:8000/
```

**Studio:**
```bash
curl http://localhost:3000/api/profile
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful, no content returned |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "code": "error_code",
  "message": "Human readable error message",
  "details": "Additional error details",
  "hint": "Suggestion for fixing the error"
}
```

### Common Errors

**Invalid API Key:**
```json
{
  "message": "Invalid API key"
}
```

**RLS Policy Violation:**
```json
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```

**Unique Constraint Violation:**
```json
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint"
}
```

## Rate Limiting

### Default Limits

- **Anonymous requests**: 100 requests per minute
- **Authenticated requests**: 1000 requests per minute
- **Service role**: Unlimited

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Handling Rate Limits

```javascript
async function makeRequest() {
  const response = await fetch('http://localhost:8000/rest/v1/users', {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  })
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset')
    const waitTime = resetTime - Date.now() / 1000
    console.log(`Rate limited. Retry after ${waitTime} seconds`)
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
    return makeRequest() // Retry
  }
  
  return response.json()
}
```

## Best Practices

### Security

1. **Never expose SERVICE_ROLE_KEY** on client-side
2. **Use Row Level Security (RLS)** for all tables
3. **Validate input** on both client and server
4. **Use HTTPS** in production
5. **Rotate API keys** regularly

### Performance

1. **Use indexes** on frequently queried columns
2. **Limit result sets** with pagination
3. **Select only needed columns** instead of `*`
4. **Use connection pooling** for database connections
5. **Cache frequently accessed data**

### Error Handling

1. **Always check response status**
2. **Handle network errors gracefully**
3. **Implement retry logic** for transient failures
4. **Log errors** for debugging
5. **Show user-friendly error messages**

### API Usage

1. **Use batch operations** when possible
2. **Implement exponential backoff** for retries
3. **Monitor rate limits**
4. **Use WebSockets** for real-time data
5. **Optimize queries** to reduce database load

## Code Examples

### JavaScript/TypeScript

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'YOUR_ANON_KEY'
)

// Insert data
const { data, error } = await supabase
  .from('users')
  .insert({ email: 'user@example.com', name: 'John Doe' })
  .select()

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10)

// Update data
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', 123)

// Delete data
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', 123)

// Upload file
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('user-123.jpg', file)

// Subscribe to changes
const channel = supabase
  .channel('public:users')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, 
    (payload) => console.log(payload)
  )
  .subscribe()
```

### Python

```python
from supabase import create_client, Client

supabase: Client = create_client(
    "http://localhost:8000",
    "YOUR_ANON_KEY"
)

# Insert data
data = supabase.table('users').insert({
    "email": "user@example.com",
    "name": "John Doe"
}).execute()

# Query data
data = supabase.table('users')\
    .select("*")\
    .eq('status', 'active')\
    .order('created_at', desc=True)\
    .limit(10)\
    .execute()

# Update data
data = supabase.table('users')\
    .update({"name": "Jane Doe"})\
    .eq('id', 123)\
    .execute()

# Delete data
data = supabase.table('users')\
    .delete()\
    .eq('id', 123)\
    .execute()
```

## Additional Resources

- [Setup Guide](SETUP.md) - Initial setup and configuration
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [Architecture](ARCHITECTURE.md) - System architecture
- [Supabase Documentation](https://supabase.com/docs) - Official docs
- [PostgREST Documentation](https://postgrest.org) - REST API details

## Support

- **Health Check**: `./scripts/health-check.sh`
- **Logs**: `docker compose logs -f [service]`
- **Studio**: Access via browser for visual interface
- **Community**: [Supabase Discord](https://discord.supabase.com)
