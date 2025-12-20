# Ghostwriter Workflow Architecture - Part 2

**Continuation of:** [`GHOSTWRITER_ARCHITECTURE.md`](GHOSTWRITER_ARCHITECTURE.md)

---

## 3.6 Migration 006: Create Section Synthesis Table (Continued)

```sql
-- Migration: 006_create_section_synthesis.sql
-- Description: Create section_synthesis table for chapter previews

-- Create section_synthesis table (full SQL from section 2.7)
CREATE TABLE section_synthesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES memoir_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    preview_content TEXT,
    preview_word_count INTEGER,
    fragment_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    photo_ids UUID[] DEFAULT ARRAY[]::UUID[],
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    quality_checks JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    user_approved BOOLEAN DEFAULT FALSE,
    user_feedback TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    generation_model VARCHAR(100),
    generation_parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_section_synthesis_section_id ON section_synthesis(section_id);
CREATE INDEX idx_section_synthesis_project_id ON section_synthesis(project_id);
CREATE INDEX idx_section_synthesis_approved ON section_synthesis(user_approved);
CREATE INDEX idx_section_synthesis_quality ON section_synthesis(quality_score);

-- Create trigger
CREATE TRIGGER update_section_synthesis_updated_at
    BEFORE UPDATE ON section_synthesis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE section_synthesis ENABLE ROW LEVEL SECURITY;
```

### 3.7 Migration 007: Seed Core Memoir Sections

```sql
-- Migration: 007_seed_core_sections.sql
-- Description: Create default section templates for new projects

-- Function to initialize memoir sections for a project
CREATE OR REPLACE FUNCTION initialize_memoir_sections(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Core Section 1: Origins (Always unlocked)
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'origins', 'Origins', 
        'Your birth, family background, and early home',
        1, TRUE, TRUE, 5,
        '[]'::jsonb
    );
    
    -- Core Section 2: Childhood
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'childhood', 'Childhood', 
        'School, friends, routines, early joys and fears',
        2, TRUE, TRUE, 6,
        '[]'::jsonb
    );
    
    -- Core Section 3: Teen Years
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'teen_years', 'Teen Years', 
        'Identity, rebellion, passions, formative moments',
        3, TRUE, FALSE, 5,
        '[]'::jsonb
    );
    
    -- Core Section 4: Early Adulthood
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'early_adulthood', 'Early Adulthood', 
        'Leaving home, first independence, early work',
        4, TRUE, FALSE, 5,
        '[]'::jsonb
    );
    
    -- Core Section 5: Work & Purpose
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'work_purpose', 'Work & Purpose', 
        'Career arcs, proud moments, failures, lessons',
        5, TRUE, FALSE, 6,
        '[]'::jsonb
    );
    
    -- Core Section 6: Values & Beliefs
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'values_beliefs', 'Values & Beliefs', 
        'What mattered, what changed, why',
        6, TRUE, FALSE, 4,
        '[]'::jsonb
    );
    
    -- Core Section 7: Hobbies & Joy
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'hobbies_joy', 'Hobbies & Joy', 
        'Sports, music, books, travel, things that made life feel alive',
        7, TRUE, FALSE, 5,
        '[]'::jsonb
    );
    
    -- Core Section 8: Milestones & Turning Points
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'milestones', 'Milestones & Turning Points', 
        'Moves, losses, wins, surprises',
        8, TRUE, FALSE, 6,
        '[]'::jsonb
    );
    
    -- Core Section 9: Lessons & Legacy
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, prompts
    ) VALUES (
        p_project_id, 'lessons_legacy', 'Lessons & Legacy', 
        'Advice, regrets, gratitude, what you hope they remember',
        9, TRUE, FALSE, 5,
        '[]'::jsonb
    );
    
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize sections when project is created
CREATE OR REPLACE FUNCTION trigger_initialize_memoir_sections()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_memoir_sections(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_create_initialize_sections
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_memoir_sections();
```

### 3.8 Migration Rollback Scripts

```sql
-- Rollback: 007_rollback.sql
DROP TRIGGER IF EXISTS on_project_create_initialize_sections ON projects;
DROP FUNCTION IF EXISTS trigger_initialize_memoir_sections();
DROP FUNCTION IF EXISTS initialize_memoir_sections(UUID);

-- Rollback: 006_rollback.sql
DROP TRIGGER IF EXISTS update_section_synthesis_updated_at ON section_synthesis;
DROP TABLE IF EXISTS section_synthesis CASCADE;

-- Rollback: 005_rollback.sql
ALTER TABLE media_files DROP COLUMN IF EXISTS ai_analysis;
ALTER TABLE media_files DROP COLUMN IF EXISTS user_context;
ALTER TABLE media_files DROP COLUMN IF EXISTS narrative_usage;
ALTER TABLE media_files DROP COLUMN IF EXISTS analyzed_at;

-- Rollback: 004_rollback.sql
DROP TRIGGER IF EXISTS memory_fragments_word_count_trigger ON memory_fragments;
DROP FUNCTION IF EXISTS update_memory_fragment_word_count();
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS section_id;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS prompt_id;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS photo_id;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS ai_enhanced_content;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS privacy_level;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS word_count;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS sensory_richness_score;
ALTER TABLE memory_fragments DROP COLUMN IF EXISTS emotional_depth_score;

-- Rollback: 003_rollback.sql
DROP TRIGGER IF EXISTS update_section_prompts_updated_at ON section_prompts;
DROP TRIGGER IF EXISTS update_memoir_sections_updated_at ON memoir_sections;
DROP TABLE IF EXISTS section_prompts CASCADE;
DROP TABLE IF EXISTS memoir_sections CASCADE;

-- Rollback: 002_rollback.sql
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Rollback: 001_rollback.sql
DROP FUNCTION IF EXISTS check_section_unlock_eligibility(UUID, INTEGER);
DROP FUNCTION IF EXISTS calculate_word_count(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

## 7. Integration Points

### 7.1 Integration with Existing Memory Capture

**Backward Compatibility Strategy:**

The Ghostwriter Workflow coexists with the existing memory capture system:

1. **Legacy Memory Fragments:** Existing fragments without `section_id` continue to work
2. **Gradual Migration:** Users can optionally assign old fragments to sections
3. **Dual Interface:** Both "Add Memory" and "Answer Prompt" interfaces available

**Integration Points:**
- [`memory_fragments`](../frontend/src/types/database.types.ts:76) table extended, not replaced
- Existing RLS policies remain intact
- New columns are nullable to support legacy data

### 7.2 Integration with Voice Calibration

**Voice Profile Usage:**

The voice profile created during calibration is used in:

1. **Prompt Generation:** Tone and complexity adjusted to user's style
2. **Memory Enhancement:** AI respects user's voice when enhancing text
3. **Synthesis:** Chapter previews maintain consistent voice

**Integration Flow:**
```typescript
// Get voice profile for synthesis
const { data: voiceProfile } = await supabase
  .from('voice_profiles')
  .select('characteristics, constraints')
  .eq('narrator_id', userId)
  .eq('project_id', projectId)
  .single();

// Use in synthesis
const synthesis = await synthesizeSection(
  sectionId,
  fragments,
  voiceProfile
);
```

### 7.3 Integration with Chapter Assembly

**Chapter Generation Enhancement:**

Ghostwriter sections feed into existing chapter assembly:

1. **Section → Chapter Mapping:** Each section can become a chapter
2. **Quality Pre-Check:** Synthesis ensures quality before chapter generation
3. **Photo Placement:** AI analysis informs photo placement in chapters

**Data Flow:**
```
memoir_sections (completed)
    ↓
section_synthesis (approved preview)
    ↓
chapters (generated with existing system)
    ↓
manuscripts (final book)
```

### 7.4 Integration with Collaboration Features

**Multi-User Considerations:**

1. **Profile Per User:** Each collaborator can have their own profile
2. **Section Ownership:** Sections can be assigned to specific narrators
3. **Privacy Levels:** Respect privacy settings in collaborative projects

**RLS Integration:**
```sql
-- Collaborators can view sections they have access to
CREATE POLICY "Collaborators can view sections"
ON memoir_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = memoir_sections.project_id
    AND user_id = auth.uid()
    AND accepted_at IS NOT NULL
  )
);
```

### 7.5 Integration with Storage System

**Photo Storage Flow:**

1. **Upload:** Photos uploaded to Supabase Storage (`memoir-photos` bucket)
2. **Analysis:** Edge Function calls GPT-4 Vision with public URL
3. **Metadata:** Analysis stored in `media_files.ai_analysis`
4. **Usage:** Photos linked to fragments via `memory_fragments.photo_id`

**Storage Bucket Structure:**
```
memoir-photos/
  {project_id}/
    {section_key}/
      {fragment_id}/
        original.jpg
        thumbnail.jpg
```

---

## 8. Photo Intelligence Architecture

### 8.1 Photo Analysis Pipeline

```
┌──────────────┐
│ User Uploads │
│    Photo     │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│  Storage API       │
│  Upload to bucket  │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│  Edge Function:    │
│  analyze-photo     │
└──────┬─────────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Get Public  │   │  Call GPT-4  │
│     URL      │   │    Vision    │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
       ┌────────────────────┐
       │  Parse Analysis    │
       │  - People          │
       │  - Setting         │
       │  - Objects         │
       │  - Emotions        │
       │  - Suggestions     │
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Store in          │
       │  media_files       │
       │  ai_analysis field │
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Generate Photo-   │
       │  Specific Prompts  │
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Present to User   │
       └────────────────────┘
```

### 8.2 Photo Enhancement Pipeline

```
┌──────────────┐
│ User Writes  │
│   Memory     │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ User Uploads       │
│ Related Photo      │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Photo Analyzed     │
│ (see 8.1)          │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Edge Function:     │
│ enhance-memory     │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Combine:           │
│ - Original text    │
│ - Photo analysis   │
│ - Voice profile    │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Call GPT-4 with    │
│ Enhancement Prompt │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Enhanced Text:     │
│ - Visual details   │
│ - Sensory richness │
│ - Emotional depth  │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Calculate Quality  │
│ Scores             │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Update Fragment:   │
│ - ai_enhanced_     │
│   content          │
│ - quality scores   │
│ - photo_id link    │
└────────────────────┘
```

### 8.3 Photo Intelligence Quality Metrics

**Sensory Richness Score (0-1):**
- Visual details mentioned: 0.3
- Other senses (sound, smell, touch, taste): 0.4
- Specific vs generic descriptions: 0.3

**Emotional Depth Score (0-1):**
- Emotional words used: 0.3
- Personal reflection present: 0.4
- Connection to meaning: 0.3

**Calculation Example:**
```typescript
function calculateSensoryRichness(text: string, photoAnalysis: AIAnalysis): number {
  let score = 0;
  
  // Visual details (0.3)
  const visualWords = countVisualDescriptors(text);
  score += Math.min(visualWords / 10, 0.3);
  
  // Other senses (0.4)
  const sensoryWords = countSensoryWords(text, ['sound', 'smell', 'touch', 'taste']);
  score += Math.min(sensoryWords / 8, 0.4);
  
  // Specificity (0.3)
  const specificityRatio = calculateSpecificity(text);
  score += specificityRatio * 0.3;
  
  return Math.min(score, 1.0);
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Database schema and core infrastructure

**Tasks:**
1. Run migrations 001-003 (helper functions, profiles, sections)
2. Create Edge Functions scaffolding
3. Set up RLS policies
4. Test database integrity

**Deliverables:**
- ✅ All tables created
- ✅ RLS policies active
- ✅ Helper functions working
- ✅ Section initialization trigger working

**Success Criteria:**
- Can create user profile
- Sections auto-initialize on project creation
- RLS prevents unauthorized access

### Phase 2: Profile & Sections UI (Weeks 3-4)

**Goal:** User-facing profile questionnaire and section roadmap

**Tasks:**
1. Build [`ProfileQuestionnaire.tsx`](../frontend/src/components/)
2. Build [`SectionRoadmap.tsx`](../frontend/src/components/)
3. Implement profile API endpoints
4. Implement section listing API
5. Add progress tracking UI

**Deliverables:**
- ✅ Profile questionnaire component
- ✅ Section roadmap visualization
- ✅ Progress indicators
- ✅ Section unlock logic

**Success Criteria:**
- User can complete profile in < 3 minutes
- Sections display based on profile
- Progress updates in real-time

### Phase 3: Photo Intelligence (Weeks 5-6)

**Goal:** Photo upload, analysis, and enhancement

**Tasks:**
1. Run migration 005 (media_files extensions)
2. Build photo upload component
3. Create `analyze-photo` Edge Function
4. Create `enhance-memory` Edge Function
5. Integrate GPT-4 Vision API
6. Build photo-specific prompt generator

**Deliverables:**
- ✅ Photo upload with preview
- ✅ AI analysis working
- ✅ Enhancement suggestions
- ✅ Photo-specific prompts

**Success Criteria:**
- Photo analysis completes in < 10 seconds
- Enhancement improves quality scores by 20%+
- Photo-specific prompts are contextually relevant

### Phase 4: Prompt Engine (Weeks 7-8)

**Goal:** Scene-based prompts and memory capture

**Tasks:**
1. Build [`ScenePrompt.tsx`](../frontend/src/components/)
2. Implement prompt progression logic
3. Add sensitivity tier filtering
4. Build memory fragment creation with section linking
5. Implement word count tracking
6. Add privacy level controls

**Deliverables:**
- ✅ Prompt interface
- ✅ Memory capture with section linking
- ✅ Privacy controls
- ✅ Progress tracking per section

**Success Criteria:**
- Prompts feel natural and guided
- Users complete 5+ memories per section
- Privacy settings respected

### Phase 5: Synthesis & Quality (Weeks 9-10)

**Goal:** Chapter preview generation and quality feedback

**Tasks:**
1. Run migration 006 (section_synthesis)
2. Create `synthesize-section` Edge Function
3. Implement quality scoring algorithms
4. Build [`SynthesisCheckpoint.tsx`](../frontend/src/components/)
5. Add recommendation engine
6. Implement user approval workflow

**Deliverables:**
- ✅ Chapter preview generation
- ✅ Quality scoring
- ✅ Recommendations
- ✅ Approval workflow

**Success Criteria:**
- Synthesis completes in < 30 seconds
- Quality scores correlate with user satisfaction
- Recommendations are actionable

### Phase 6: Integration & Polish (Weeks 11-12)

**Goal:** Integration with existing systems and refinement

**Tasks:**
1. Integrate with existing chapter assembly
2. Add conditional sections based on profile
3. Implement section-to-chapter conversion
4. Add photo placement in chapters
5. Performance optimization
6. User testing and refinement

**Deliverables:**
- ✅ Full workflow integration
- ✅ Conditional sections working
- ✅ Performance optimized
- ✅ User feedback incorporated

**Success Criteria:**
- End-to-end workflow functional
- Performance meets targets
- User satisfaction > 85%

---

## 10. Potential Conflicts & Resolutions

### 10.1 Schema Conflicts

**Conflict:** `media_files` table may already exist with different structure

**Resolution:**
- Use `CREATE TABLE IF NOT EXISTS` in migration
- Add columns conditionally with `IF NOT EXISTS` checks
- Provide migration path for existing data

**Migration Strategy:**
```sql
-- Check if table exists and has different structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files') THEN
        -- Add new columns if they don't exist
        -- (See migration 005 for full implementation)
    ELSE
        -- Create table with full schema
    END IF;
END $$;
```

### 10.2 RLS Policy Conflicts

**Conflict:** Existing RLS policies on `memory_fragments` may conflict with new privacy levels

**Resolution:**
- Extend existing policies rather than replace
- Add new policies with specific names
- Test policy precedence

**Example:**
```sql
-- New policy that respects privacy levels
CREATE POLICY "Users respect privacy levels"
ON memory_fragments FOR SELECT
USING (
  (privacy_level = 'included' OR narrator_id = auth.uid())
  AND
  -- Existing access check
  EXISTS (SELECT 1 FROM projects WHERE ...)
);
```

### 10.3 Performance Concerns

**Conflict:** JSONB queries on `prompts` and `ai_analysis` may be slow

**Resolution:**
- Add GIN indexes on JSONB columns
- Denormalize frequently accessed fields
- Use materialized views for complex queries

**Optimization:**
```sql
-- GIN index for fast JSONB queries
CREATE INDEX idx_memoir_sections_prompts ON memoir_sections USING GIN (prompts);

-- Materialized view for section progress
CREATE MATERIALIZED VIEW section_progress AS
SELECT 
    ms.id,
    ms.project_id,
    ms.section_title,
    ms.required_memories,
    COUNT(mf.id) as collected_memories,
    SUM(mf.word_count) as total_words
FROM memoir_sections ms
LEFT JOIN memory_fragments mf ON mf.section_id = ms.id
GROUP BY ms.id;
```

### 10.4 Photo Analysis Cost

**Conflict:** GPT-4 Vision API calls are expensive at scale

**Resolution:**
- Implement caching for analyzed photos
- Batch analysis requests
- Offer tiered analysis (basic vs detailed)
- Set rate limits per user

**Cost Management:**
```typescript
// Cache analysis results
const cacheKey = `photo_analysis_${photoHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Analyze and cache
const analysis = await analyzeWithGPT4Vision(photoUrl);
await redis.set(cacheKey, JSON.stringify(analysis), 'EX', 86400); // 24h cache
```

### 10.5 Data Migration for Existing Projects

**Conflict:** Existing projects don't have profiles or sections

**Resolution:**
- Trigger section initialization on first profile creation
- Provide "Upgrade to Ghostwriter" workflow
- Allow gradual adoption

**Migration Function:**
```sql
CREATE OR REPLACE FUNCTION migrate_project_to_ghostwriter(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if already migrated
    IF EXISTS (SELECT 1 FROM memoir_sections WHERE project_id = p_project_id) THEN
        RETURN;
    END IF;
    
    -- Initialize sections
    PERFORM initialize_memoir_sections(p_project_id);
    
    -- Try to assign existing fragments to sections based on tags
    UPDATE memory_fragments
    SET section_id = (
        SELECT id FROM memoir_sections
        WHERE project_id = p_project_id
        AND section_key = CASE
            WHEN tags->>'life_stage' = 'childhood' THEN 'childhood'
            WHEN tags->>'life_stage' = 'teen' THEN 'teen_years'
            ELSE 'origins'
        END
        LIMIT 1
    )
    WHERE project_id = p_project_id
    AND section_id IS NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Performance Considerations

### 11.1 Database Query Optimization

**Indexes Strategy:**

All critical query paths have indexes:
- Foreign keys: Automatic indexes on all FK columns
- Lookup fields: `section_key`, `prompt_key`, `privacy_level`
- JSONB fields: GIN indexes for `prompts`, `ai_analysis`, `user_context`
- Composite indexes: `(project_id, section_order)`, `(section_id, prompt_order)`

**Query Performance Targets:**
- Profile lookup: < 50ms
- Section list: < 100ms
- Prompt retrieval: < 75ms
- Fragment insertion: < 150ms

### 11.2 Photo Analysis Performance

**Optimization Strategies:**

1. **Async Processing:**
   ```typescript
   // Don't block on analysis
   const { data: media } = await supabase
     .from('media_files')
     .insert({ ...fileData, status: 'processing' });
   
   // Trigger async analysis
   await supabase.functions.invoke('analyze-photo', {
     body: { media_id: media.id }
   });
   
   // Return immediately
   return { media_id: media.id, status: 'processing' };
   ```

2. **Caching:**
   - Cache analysis results for 24 hours
   - Use photo hash to detect duplicates
   - Store common patterns (e.g., "beach scene") for reuse

3. **Batch Processing:**
   - Queue multiple photos for batch analysis
   - Process during off-peak hours
   - Prioritize user-visible photos

**Performance Targets:**
- Photo upload: < 2 seconds
- Analysis trigger: < 500ms
- Analysis completion: < 15 seconds
- Enhancement: < 10 seconds

### 11.3 Synthesis Performance

**Optimization Strategies:**

1. **Fragment Caching:**
   ```typescript
   // Cache processed fragments
   const cacheKey = `section_fragments_${sectionId}`;
   let fragments = await cache.get(cacheKey);
   
   if (!fragments) {
     fragments = await fetchFragments(sectionId);
     await cache.set(cacheKey, fragments, 300); // 5min cache
   }
   ```

2. **Incremental Synthesis:**
   - Generate partial previews as memories are added
   - Only regenerate changed sections
   - Cache synthesis results

3. **Streaming Responses:**
   ```typescript
   // Stream synthesis to user
   const stream = await openai.chat.completions.create({
     model: 'gpt-4',
     messages: [...],
     stream: true
   });
   
   for await (const chunk of stream) {
     // Send chunk to client via WebSocket
     await sendChunk(chunk);
   }
   ```

**Performance Targets:**
- Synthesis initiation: < 1 second
- First content chunk: < 5 seconds
- Full synthesis: < 30 seconds
- Quality scoring: < 5 seconds

### 11.4 Real-time Updates

**Supabase Realtime Optimization:**

```typescript
// Subscribe only to relevant changes
const subscription = supabase
  .channel(`project:${projectId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'memoir_sections',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // Update UI with new section status
      updateSectionStatus(payload.new);
    }
  )
  .subscribe();

// Unsubscribe when component unmounts
return () => subscription.unsubscribe();
```

**Optimization:**
- Subscribe to specific project channels only
- Debounce rapid updates
- Use presence for collaborative editing awareness

---

## 12. Testing Strategy

### 12.1 Database Testing

**Migration Testing:**
```sql
-- Test migration 001
BEGIN;
  \i migrations/001_create_helper_functions.sql
  -- Test helper functions
  SELECT calculate_word_count('Hello world test');
  SELECT check_section_unlock_eligibility('test-uuid', 1);
ROLLBACK;

-- Test migration 002
BEGIN;
  \i migrations/002_create_user_profiles.sql
  -- Test profile creation
  INSERT INTO user_profiles (user_id, project_id, birth_year)
  VALUES ('test-user', 'test-project', 1980);
ROLLBACK;
```

**RLS Testing:**
```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid';

-- Should succeed
SELECT * FROM user_profiles WHERE user_id = 'user-uuid';

-- Should fail
SELECT * FROM user_profiles WHERE user_id = 'other-user-uuid';
```

### 12.2 API Testing

**Edge Function Testing:**
```typescript
// Test analyze-photo function
describe('analyze-photo', () => {
  it('should analyze photo and return structured data', async () => {
    const response = await fetch('http://localhost:9000/analyze-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photo_url: 'https://example.com/test.jpg',
        context: 'Family beach day'
      })
    });
    
    const data = await response.json();
    
    expect(data.ai_analysis).toBeDefined();
    expect(data.ai_analysis.people_detected).toBeInstanceOf(Array);
    expect(data.ai_analysis.setting).toBeDefined();
  });
});
```

### 12.3 Integration Testing

**End-to-End Workflow:**
```typescript
describe('Ghostwriter Workflow', () => {
  it('should complete full workflow from profile to synthesis', async () => {
    // 1. Create profile
    const profile = await createProfile({
      project_id: testProjectId,
      birth_year: 1980,
      has_children: true
    });
    expect(profile).toBeDefined();
    
    // 2. Verify sections initialized
    const sections = await getSections(testProjectId);
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].is_unlocked).toBe(true);