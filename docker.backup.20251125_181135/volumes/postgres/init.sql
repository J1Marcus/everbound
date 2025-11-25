-- ============================================
-- Supabase PostgreSQL Initialization Script
-- ============================================
-- This script runs automatically when the PostgreSQL container
-- is first created. It enables all required extensions and
-- creates the necessary schemas for Supabase services.
--
-- Extensions enabled:
-- - uuid-ossp: UUID generation functions
-- - pgcrypto: Cryptographic functions for password hashing
-- - pgjwt: JWT token generation and validation
-- - pg_net: HTTP client for making requests from database
-- - pgsodium: Modern encryption library
-- - pg_graphql: GraphQL support for PostgREST
-- - pg_stat_statements: Query performance monitoring
--
-- Schemas created:
-- - auth: GoTrue authentication service
-- - storage: Storage API service
-- - realtime: Realtime server
-- - supabase_functions: Edge Functions runtime

\echo '================================================'
\echo 'Supabase PostgreSQL Initialization'
\echo '================================================'

-- ============================================
-- Create Required Schemas First
-- ============================================
\echo 'Creating Supabase schemas...'

-- Extensions schema (must be created before extensions)
CREATE SCHEMA IF NOT EXISTS extensions;
\echo '✓ extensions schema created'

-- Authentication schema for GoTrue
CREATE SCHEMA IF NOT EXISTS auth;
\echo '✓ auth schema created'

-- Storage schema for Storage API
CREATE SCHEMA IF NOT EXISTS storage;
\echo '✓ storage schema created'

-- Realtime schema for Realtime server
CREATE SCHEMA IF NOT EXISTS realtime;
\echo '✓ realtime schema created'

-- Edge Functions schema
CREATE SCHEMA IF NOT EXISTS supabase_functions;
\echo '✓ supabase_functions schema created'

-- GraphQL schema for public GraphQL API
CREATE SCHEMA IF NOT EXISTS graphql_public;
\echo '✓ graphql_public schema created'

-- ============================================
-- Enable Required Extensions
-- ============================================
\echo 'Enabling PostgreSQL extensions...'

-- UUID generation (required for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
\echo '✓ uuid-ossp enabled'

-- Cryptographic functions (required for password hashing)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
\echo '✓ pgcrypto enabled'

-- JWT token generation (required for authentication)
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA extensions;
\echo '✓ pgjwt enabled'

-- HTTP client (required for webhooks and external API calls)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;
\echo '✓ pg_net enabled'

-- Modern encryption library (required for secure data storage)
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA extensions;
\echo '✓ pgsodium enabled'

-- GraphQL support (required for GraphQL API)
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA extensions;
\echo '✓ pg_graphql enabled'

-- Query performance monitoring (required for analytics)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA pg_catalog;
\echo '✓ pg_stat_statements enabled'

-- ============================================
-- Grant Schema Permissions
-- ============================================
\echo 'Granting schema permissions...'

-- Grant usage on schemas to postgres superuser
GRANT USAGE ON SCHEMA extensions TO postgres;
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT USAGE ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA graphql_public TO postgres;

-- Grant all privileges on all tables in schemas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA extensions TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA realtime TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA supabase_functions TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA graphql_public TO postgres;

-- Grant all privileges on all sequences in schemas
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA extensions TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA realtime TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA supabase_functions TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA graphql_public TO postgres;

\echo '✓ Schema permissions granted'

-- ============================================
-- Create Database Roles
-- ============================================
\echo 'Creating database roles...'

-- Anonymous role (for unauthenticated requests)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
    RAISE NOTICE '✓ anon role created';
  ELSE
    RAISE NOTICE '✓ anon role already exists';
  END IF;
END
$$;

-- Authenticated role (for authenticated requests)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
    RAISE NOTICE '✓ authenticated role created';
  ELSE
    RAISE NOTICE '✓ authenticated role already exists';
  END IF;
END
$$;

-- Service role (for service-level access, bypasses RLS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    RAISE NOTICE '✓ service_role created';
  ELSE
    RAISE NOTICE '✓ service_role already exists';
  END IF;
END
$$;

-- Supabase admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN NOINHERIT;
    RAISE NOTICE '✓ supabase_admin role created';
  ELSE
    RAISE NOTICE '✓ supabase_admin role already exists';
  END IF;
END
$$;

-- ============================================
-- Grant Role Permissions
-- ============================================
\echo 'Granting role permissions...'

-- Grant schema usage to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT USAGE ON SCHEMA supabase_functions TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;

-- Grant table permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

\echo '✓ Role permissions granted'

-- ============================================
-- Configure Publication for Realtime
-- ============================================
\echo 'Configuring realtime publication...'

-- Create publication for realtime changes
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    RAISE NOTICE '✓ supabase_realtime publication created';
  ELSE
    RAISE NOTICE '✓ supabase_realtime publication already exists';
  END IF;
END
$$;

-- ============================================
-- Set Default Privileges
-- ============================================
\echo 'Setting default privileges...'

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

\echo '✓ Default privileges set'

-- ============================================
-- Create Storage Schema Tables
-- ============================================
\echo 'Creating storage schema tables...'

-- Buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

-- Objects table (without path_tokens - storage service will add it via migration)
CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    bucket_id text REFERENCES storage.buckets(id),
    name text NOT NULL,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    version text,
    UNIQUE(bucket_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS objects_bucket_id_idx ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS objects_name_idx ON storage.objects(name);

\echo '✓ Storage tables created'

-- ============================================
-- Data Persistence Testing
-- ============================================
-- To verify data persistence across container restarts:
--
-- 1. Create test data:
--    docker exec -it ${PROJECT_NAME}_db psql -U postgres -d postgres -c "CREATE TABLE test_persistence (id SERIAL PRIMARY KEY, data TEXT, created_at TIMESTAMP DEFAULT NOW());"
--    docker exec -it ${PROJECT_NAME}_db psql -U postgres -d postgres -c "INSERT INTO test_persistence (data) VALUES ('Test data before restart');"
--
-- 2. Restart container:
--    docker-compose -f docker/docker-compose.yml restart db
--
-- 3. Verify data persists:
--    docker exec -it ${PROJECT_NAME}_db psql -U postgres -d postgres -c "SELECT * FROM test_persistence;"
--
-- 4. Clean up:
--    docker exec -it ${PROJECT_NAME}_db psql -U postgres -d postgres -c "DROP TABLE test_persistence;"

\echo '================================================'
\echo 'PostgreSQL initialization complete!'
\echo 'Database is ready for Supabase services.'
\echo '================================================'
\echo ''
\echo 'Enabled extensions:'
\echo '  - uuid-ossp (UUID generation)'
\echo '  - pgcrypto (cryptographic functions)'
\echo '  - pgjwt (JWT tokens)'
\echo '  - pg_net (HTTP client)'
\echo '  - pgsodium (encryption)'
\echo '  - pg_graphql (GraphQL support)'
\echo '  - pg_stat_statements (query monitoring)'
\echo ''
\echo 'Created schemas:'
\echo '  - extensions (extension functions)'
\echo '  - auth (authentication)'
\echo '  - storage (file storage)'
\echo '  - realtime (real-time updates)'
\echo '  - supabase_functions (edge functions)'
\echo '  - graphql_public (GraphQL API)'
\echo ''
\echo 'Created roles:'
\echo '  - anon (anonymous access)'
\echo '  - authenticated (authenticated users)'
\echo '  - service_role (service access)'
\echo '  - supabase_admin (admin access)'
\echo '================================================'