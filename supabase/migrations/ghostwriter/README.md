# Ghostwriter Workflow Database Migrations

This directory contains the database schema migrations for the Ghostwriter Workflow feature, which transforms the Digital Memoir Platform from an open-ended memory capture system into a structured, intelligent interview process.

## Overview

The Ghostwriter Workflow introduces:
- **Profile-driven section roadmap** - Personalized memoir structure based on user questionnaire
- **Scene-based prompts** - Guided questions with sensory detail focus
- **Photo intelligence** - AI-powered photo analysis to enhance memories
- **Progressive unlocking** - Sections unlock as previous ones are completed
- **Quality feedback** - Synthesis checkpoints with improvement recommendations

## Architecture Documentation

For complete architecture details, see:
- [`docs/GHOSTWRITER_ARCHITECTURE.md`](../../../docs/GHOSTWRITER_ARCHITECTURE.md) - Full technical specification
- [`docs/GHOSTWRITER_ARCHITECTURE_PART2.md`](../../../docs/GHOSTWRITER_ARCHITECTURE_PART2.md) - Continuation with implementation details

## Migration Files

### Core Migrations (Required)

1. **`001_create_user_profiles.sql`**
   - Creates `user_profiles` table for questionnaire responses
   - Stores timeline anchors, comfort boundaries, and book tone preferences
   - Enables personalized section roadmap generation
   - **Dependencies:** `users`, `projects` tables

2. **`002_create_memoir_sections.sql`**
   - Creates `memoir_sections` table for chapter roadmap
   - Tracks progress, unlocking, and completion status
   - Stores section-specific prompts in JSONB
   - **Dependencies:** `projects` table

3. **`003_create_section_prompts.sql`**
   - Creates `section_prompts` table for normalized prompt storage
   - Supports sensitivity tiers and privacy controls
   - Enables photo-specific prompts
   - **Dependencies:** `memoir_sections`, `projects` tables

4. **`004_create_section_synthesis.sql`**
   - Creates `section_synthesis` table for chapter previews
   - Stores quality assessments and recommendations
   - Tracks user approval workflow
   - **Dependencies:** `memoir_sections`, `projects` tables

5. **`005_extend_memory_fragments.sql`**
   - Extends existing `memory_fragments` table
   - Adds: `section_id`, `prompt_id`, `photo_id`, `ai_enhanced_content`
   - Adds quality scores: `sensory_richness_score`, `emotional_depth_score`
   - Adds `privacy_level` and auto-calculated `word_count`
   - **Dependencies:** `memory_fragments`, `memoir_sections`, `section_prompts` tables
   - **⚠️ IMPORTANT:** Non-destructive - only adds columns, preserves existing data

6. **`006_extend_media_files.sql`**
   - Creates or extends `media_files` table
   - Adds photo intelligence fields: `ai_analysis`, `user_context`, `narrative_usage`
   - Supports GPT-4 Vision integration
   - **Dependencies:** `projects`, `users` tables
   - **⚠️ IMPORTANT:** Uses conditional logic to handle existing table

7. **`007_create_indexes.sql`**
   - Creates performance indexes for all new tables
   - Adds composite indexes for common query patterns
   - Creates helper functions: `check_section_unlock_eligibility`, `get_section_progress`, `get_project_ghostwriter_overview`
   - **Dependencies:** All previous migrations

8. **`008_rls_policies.sql`**
   - Creates Row-Level Security policies for all new tables
   - Enforces privacy levels on memory fragments
   - Enables collaboration while respecting permissions
   - **Dependencies:** All previous migrations

9. **`009_seed_data.sql`**
   - Seeds default memoir sections (Origins, Childhood, Teen Years, etc.)
   - Creates auto-initialization trigger for new projects
   - Includes sample prompts for Origins section
   - Provides migration function for existing projects
   - **Dependencies:** All previous migrations

## Migration Order

**CRITICAL:** Migrations must be applied in numerical order (001 → 009) due to foreign key dependencies.

```
001_create_user_profiles.sql
  ↓
002_create_memoir_sections.sql
  ↓
003_create_section_prompts.sql
  ↓
004_create_section_synthesis.sql
  ↓
005_extend_memory_fragments.sql
  ↓
006_extend_media_files.sql
  ↓
007_create_indexes.sql
  ↓
008_rls_policies.sql
  ↓
009_seed_data.sql
```

## Running Migrations

### Automated (Recommended)

Use the provided migration runner script:

```bash
# From project root
./scripts/run-ghostwriter-migrations.sh

# Check migration status
./scripts/run-ghostwriter-migrations.sh --status

# Rollback if needed
./scripts/run-ghostwriter-migrations.sh --rollback
```

### Manual

If you prefer to run migrations manually:

```bash
# Ensure Supabase is running
cd docker && docker-compose ps

# Run each migration in order
docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/ghostwriter/001_create_user_profiles.sql
docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/ghostwriter/002_create_memoir_sections.sql
# ... continue for all migrations
```

### Via Supabase CLI (Alternative)

If using Supabase CLI:

```bash
supabase db push
```

## Verification

After running migrations, verify the schema:

```bash
# Check tables exist
docker exec supabase-db psql -U postgres -d postgres -c "\dt"

# Check new columns in memory_fragments
docker exec supabase-db psql -U postgres -d postgres -c "\d memory_fragments"

# Check RLS policies
docker exec supabase-db psql -U postgres -d postgres -c "\d+ user_profiles"

# Test helper functions
docker exec supabase-db psql -U postgres -d postgres -c "SELECT * FROM get_project_ghostwriter_overview('test-uuid');"
```

## Backward Compatibility

These migrations are designed to be **backward compatible**:

✅ **Safe:**
- Existing `memory_fragments` continue to work without `section_id`
- New columns are nullable or have defaults
- No existing data is modified or deleted
- Existing RLS policies remain intact
- Legacy memory capture workflow still functions

⚠️ **Considerations:**
- New projects automatically get memoir sections (via trigger)
- Existing projects need manual migration: `SELECT migrate_project_to_ghostwriter('project-uuid');`
- Frontend must handle both legacy and ghostwriter workflows

## Rollback

If you need to rollback migrations, they should be rolled back in **reverse order** (009 → 001).

**Note:** Rollback scripts are not included by default. If needed, create them following this pattern:

```sql
-- Example: 005_rollback.sql
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS section_id;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS prompt_id;
-- ... etc
```

## Database Schema Summary

### New Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `user_profiles` | User questionnaire responses | → `users`, `projects` |
| `memoir_sections` | Chapter roadmap & progress | → `projects` |
| `section_prompts` | Normalized prompt storage | → `memoir_sections`, `projects` |
| `section_synthesis` | Chapter preview & quality | → `memoir_sections`, `projects` |
| `media_files` | Photos with AI analysis | → `projects`, `users` |

### Extended Tables

| Table | New Columns | Purpose |
|-------|-------------|---------|
| `memory_fragments` | `section_id`, `prompt_id`, `photo_id`, `ai_enhanced_content`, `privacy_level`, `word_count`, `sensory_richness_score`, `emotional_depth_score` | Link fragments to workflow, track quality |

## TypeScript Types

After running migrations, the TypeScript types in [`frontend/src/types/database.types.ts`](../../../frontend/src/types/database.types.ts) have been updated to include:

- `user_profiles` table types
- `memoir_sections` table types
- `section_prompts` table types
- `section_synthesis` table types
- `media_files` table types
- Extended `memory_fragments` types with new fields

## Testing

### Unit Tests

Test individual migrations:

```bash
# Test in transaction (auto-rollback)
docker exec supabase-db psql -U postgres -d postgres -c "
BEGIN;
\i /path/to/001_create_user_profiles.sql
-- Run test queries
ROLLBACK;
"
```

### Integration Tests

Test the full workflow:

1. Create a test project
2. Verify sections are auto-initialized
3. Create a user profile
4. Check conditional sections appear
5. Add memory fragments with section links
6. Upload photos and verify AI analysis fields
7. Generate section synthesis
8. Verify RLS policies work correctly

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Some tables may already exist from previous attempts
- Use `CREATE TABLE IF NOT EXISTS` (already in migrations)
- Or manually drop tables and re-run

**Error: "foreign key constraint violation"**
- Migrations run out of order
- Rollback and re-run in correct order

**Error: "column already exists"**
- Migration 005 or 006 partially applied
- Use `ADD COLUMN IF NOT EXISTS` (already in migrations)

### RLS Policy Issues

**Error: "new row violates row-level security policy"**
- Check JWT token is valid
- Verify user has project access
- Check policy conditions match your use case

### Performance Issues

**Slow queries after migration**
- Run `ANALYZE` on new tables
- Check indexes are created: `\di` in psql
- Review query plans: `EXPLAIN ANALYZE SELECT ...`

## Next Steps

After successful migration:

1. **Update Frontend:**
   - Import new types from `database.types.ts`
   - Create UI components for profile questionnaire
   - Build section roadmap visualization
   - Implement prompt interface

2. **Create Edge Functions:**
   - `analyze-photo` - GPT-4 Vision integration
   - `enhance-memory` - Photo-enhanced memory generation
   - `synthesize-section` - Chapter preview generation
   - `calculate-quality-scores` - Quality metric calculation

3. **Test Workflows:**
   - Profile creation → section initialization
   - Memory capture → section linking
   - Photo upload → AI analysis
   - Section completion → synthesis generation

4. **Monitor Performance:**
   - Query performance on JSONB fields
   - Index usage statistics
   - RLS policy overhead

## Support

For issues or questions:
- Review architecture docs: [`docs/GHOSTWRITER_ARCHITECTURE.md`](../../../docs/GHOSTWRITER_ARCHITECTURE.md)
- Check troubleshooting guide: [`docs/PLATFORM_TROUBLESHOOTING.md`](../../../docs/PLATFORM_TROUBLESHOOTING.md)
- Examine migration logs for specific errors

## Version History

- **v1.0** (2025-12-19) - Initial ghostwriter workflow schema
  - 9 migration files
  - 5 new tables
  - Extended memory_fragments and media_files
  - Full RLS policies
  - Auto-initialization triggers
