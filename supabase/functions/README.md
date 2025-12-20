# Ghostwriter Workflow Edge Functions

This directory contains Supabase Edge Functions that power the Ghostwriter Workflow feature for the Digital Memoir Platform.

## Overview

The Ghostwriter Workflow transforms memoir creation from an open-ended process into a structured, intelligent interview experience. These Edge Functions provide the backend API layer for:

- **Profile Management**: User questionnaire and personalized section initialization
- **Section Management**: Progressive unlocking and prompt retrieval
- **Photo Intelligence**: GPT-4 Vision analysis and memory enhancement
- **Section Synthesis**: Chapter preview generation and quality feedback

## Architecture

```
supabase/functions/
├── _shared/                    # Shared utilities
│   ├── db.ts                  # Database client and queries
│   ├── openai.ts              # OpenAI/GPT-4 integration
│   ├── quality-scoring.ts     # Quality metrics calculation
│   └── section-logic.ts       # Section unlocking logic
│
├── profile-management/         # Profile CRUD operations
│   ├── index.ts
│   └── test.ts
│
├── section-management/         # Section listing and unlocking
│   └── index.ts
│
├── photo-intelligence/         # Photo analysis and enhancement
│   └── index.ts
│
└── section-synthesis/          # Chapter preview generation
    └── index.ts
```

## Edge Functions

### 1. Profile Management (`/profile-management`)

Handles user profile questionnaire and memoir section initialization.

**Endpoints:**

- `GET /profile-management?projectId={id}` - Get profile for project
- `POST /profile-management` - Create/update profile
- `PATCH /profile-management` - Partial update

**Request Example:**
```bash
curl -X POST http://localhost:9000/profile-management \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid",
    "birth_year": 1980,
    "has_children": true,
    "marital_status": "married",
    "book_tone": "warm"
  }'
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "project_id": "uuid",
    "birth_year": 1980,
    "has_children": true,
    "profile_completed": true,
    ...
  },
  "message": "Profile created successfully"
}
```

**Features:**
- Validates profile data
- Initializes memoir sections based on profile
- Creates core sections (always) + conditional sections (based on life circumstances)

---

### 2. Section Management (`/section-management`)

Manages memoir sections, progressive unlocking, and prompts.

**Endpoints:**

- `GET /section-management?projectId={id}` - Get all sections with status
- `POST /section-management/unlock` - Unlock next section
- `GET /section-management/prompts?sectionId={id}` - Get prompts for section
- `POST /section-management/check-eligibility` - Check unlock eligibility

**Request Example:**
```bash
# Get sections
curl "http://localhost:9000/section-management?projectId=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Unlock next section
curl -X POST http://localhost:9000/section-management/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_section_id": "uuid",
    "project_id": "uuid"
  }'
```

**Response:**
```json
{
  "sections": [
    {
      "section_id": "uuid",
      "section_key": "origins",
      "section_title": "Origins",
      "is_unlocked": true,
      "is_completed": false,
      "required_memories": 5,
      "collected_memories": 3,
      "progress_percentage": 60,
      "can_unlock_next": false,
      "quality_threshold_met": true
    }
  ]
}
```

**Features:**
- Progressive unlocking based on completion
- Quality threshold validation
- Section status tracking
- Prompt retrieval

---

### 3. Photo Intelligence (`/photo-intelligence`)

Analyzes photos with GPT-4 Vision and enhances memories.

**Endpoints:**

- `POST /photo-intelligence/analyze` - Analyze photo with GPT-4 Vision
- `POST /photo-intelligence/enhance-memory` - Enhance memory text with photo
- `GET /photo-intelligence/prompts?photoId={id}` - Generate photo-specific prompts
- `POST /photo-intelligence/batch-analyze` - Analyze multiple photos

**Request Example:**
```bash
# Analyze photo
curl -X POST http://localhost:9000/photo-intelligence/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo_url": "https://example.com/photo.jpg",
    "project_id": "uuid",
    "photo_id": "uuid",
    "user_context": "Family beach day, summer 1975"
  }'

# Enhance memory
curl -X POST http://localhost:9000/photo-intelligence/enhance-memory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "original_text": "My mother was a kind woman",
    "photo_id": "uuid",
    "project_id": "uuid",
    "fragment_id": "uuid"
  }'
```

**Response:**
```json
{
  "analysis": {
    "people_detected": [
      {
        "position": "center",
        "estimated_age": "30-35",
        "description": "Dark curly hair, warm smile, floral dress"
      }
    ],
    "setting": {
      "type": "outdoor",
      "location_type": "beach",
      "time_period": "1970s",
      "season": "summer"
    },
    "objects": ["beach umbrella", "picnic basket"],
    "mood": "joyful, relaxed",
    "suggestions": ["Ask about this day at the beach"]
  }
}
```

**Features:**
- GPT-4 Vision photo analysis
- Memory text enhancement with visual details
- Photo-specific prompt generation
- Batch processing support
- Quality score calculation

---

### 4. Section Synthesis (`/section-synthesis`)

Generates chapter previews from memories and provides quality feedback.

**Endpoints:**

- `POST /section-synthesis/generate` - Generate chapter preview
- `GET /section-synthesis/preview?sectionId={id}` - Get existing preview
- `POST /section-synthesis/approve` - Approve and complete section
- `POST /section-synthesis/regenerate` - Regenerate with feedback

**Request Example:**
```bash
# Generate preview
curl -X POST http://localhost:9000/section-synthesis/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "uuid",
    "project_id": "uuid"
  }'

# Approve section
curl -X POST http://localhost:9000/section-synthesis/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "uuid",
    "project_id": "uuid",
    "user_feedback": "Looks great!"
  }'
```

**Response:**
```json
{
  "synthesis": {
    "id": "uuid",
    "section_id": "uuid",
    "preview_content": "Chapter text...",
    "preview_word_count": 1500,
    "quality_score": 0.85,
    "recommendations": {
      "strengths": ["Rich sensory details"],
      "suggestions": ["Add more about the setting"],
      "missing_elements": ["Transition between scenes"]
    }
  },
  "quality_analysis": {
    "scores": {
      "sensory_richness_score": 0.82,
      "emotional_depth_score": 0.88,
      "overall_quality": 0.85
    }
  }
}
```

**Features:**
- Synthesizes memories into book-quality prose
- Maintains narrator's voice
- Provides quality feedback
- Suggests photo placements
- Approval workflow

---

## Shared Utilities

### Database Client (`_shared/db.ts`)

Provides common database operations:

- `createAuthenticatedClient()` - Create Supabase client with JWT
- `getAuthenticatedUser()` - Extract user from JWT
- `verifyProjectAccess()` - Check user has project access
- `getUserProfile()` - Get user profile
- `geteverboundections()` - Get sections for project
- `getSectionFragments()` - Get memories for section
- `jsonResponse()` / `errorResponse()` - Standard responses

### OpenAI Client (`_shared/openai.ts`)

GPT-4 and GPT-4 Vision integration:

- `callOpenAI()` - Generic OpenAI API call
- `analyzePhoto()` - Analyze photo with GPT-4 Vision
- `enhanceMemoryWithPhoto()` - Enhance text with photo details
- `generatePhotoPrompts()` - Create photo-specific prompts
- `synthesizeSection()` - Generate chapter preview

### Quality Scoring (`_shared/quality-scoring.ts`)

Calculate quality metrics:

- `calculateSensoryRichness()` - Score sensory details (0-1)
- `calculateEmotionalDepth()` - Score emotional content (0-1)
- `calculateDetailScore()` - Score level of detail (0-1)
- `calculateQualityScores()` - Overall quality analysis
- `generateQualityFeedback()` - Actionable feedback

### Section Logic (`_shared/section-logic.ts`)

Progressive unlocking and validation:

- `checkUnlockEligibility()` - Verify section can be unlocked
- `getSectionStatus()` - Get section progress
- `unlockNextSection()` - Unlock next section if eligible
- `completeSectionIfReady()` - Mark section complete
- `getAllSectionsStatus()` - Get all sections with status
- `filterSectionsByProfile()` - Filter conditional sections

---

## Environment Variables

Create a `.env` file in `supabase/functions/`:

```bash
# Required
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key

# Optional
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

---

## Development

### Local Testing

1. **Start Supabase locally:**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Serve Edge Functions:**
   ```bash
   supabase functions serve --env-file supabase/functions/.env
   ```

3. **Test with curl:**
   ```bash
   # Get your JWT token
   TOKEN=$(supabase auth login --email user@example.com --password password)
   
   # Test profile creation
   curl -X POST http://localhost:9000/profile-management \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"project_id": "uuid", "birth_year": 1980}'
   ```

### Deployment

Deploy to production:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy profile-management

# Set environment variables
supabase secrets set OPENAI_API_KEY=your-key
```

---

## Testing

### Manual Testing

Each function includes a `test.ts` file with example requests:

```bash
cd supabase/functions/profile-management
deno run --allow-net --allow-env test.ts
```

### Integration Testing

Test the full workflow:

1. Create profile → Sections initialized
2. Add memories → Progress tracked
3. Upload photo → Photo analyzed
4. Enhance memory → Quality improved
5. Complete section → Next unlocked
6. Generate preview → Chapter created
7. Approve section → Section completed

### Error Cases

Test error handling:

- Missing Authorization header → 401
- Invalid project_id → 400
- Access to another user's project → 403
- Missing required fields → 400
- OpenAI API errors → 500 with details

---

## Performance Considerations

### Photo Analysis
- **Caching**: Analysis results cached for 24 hours
- **Batch Processing**: Use `/batch-analyze` for multiple photos
- **Async Processing**: Analysis doesn't block user interaction

### Synthesis
- **Fragment Caching**: Processed fragments cached for 5 minutes
- **Streaming**: Consider streaming responses for long content
- **Rate Limiting**: Implement rate limits for expensive operations

### Database Queries
- **Indexes**: All foreign keys and lookup fields indexed
- **RLS**: Row-level security enforced at database level
- **Connection Pooling**: Supabase handles connection management

---

## Security

### Authentication
- All endpoints require valid JWT token
- User identity extracted from JWT
- Project access verified for every request

### Authorization
- Row-Level Security (RLS) policies enforced
- Users can only access their own projects
- Collaborators have appropriate permissions

### Data Validation
- Input validation on all endpoints
- Type checking with TypeScript
- SQL injection prevention via parameterized queries

---

## Troubleshooting

### Common Issues

**1. "Unauthorized" errors**
- Check JWT token is valid and not expired
- Verify Authorization header format: `Bearer <token>`
- Ensure user has access to the project

**2. "OpenAI API error"**
- Verify OPENAI_API_KEY is set correctly
- Check API quota and rate limits
- Review error message for specific issue

**3. "Section not found"**
- Ensure sections were initialized (create profile first)
- Verify section_id is correct
- Check project_id matches

**4. "Failed to unlock section"**
- Verify previous section is completed
- Check quality threshold is met
- Ensure required memories collected

### Debug Mode

Enable detailed logging:

```typescript
// In Edge Function
console.log('Debug:', { user, projectId, data })
```

View logs:
```bash
supabase functions logs profile-management
```

---

## API Reference

See [`docs/API_SPECIFICATIONS.md`](../../docs/API_SPECIFICATIONS.md) for complete API documentation.

## Related Documentation

- [Ghostwriter Architecture](../../docs/GHOSTWRITER_ARCHITECTURE_PART2.md)
- [Ghostwriter Workflow Guide](../../docs/GHOSTWRITER_WORKFLOW_GUIDE.md)
- [Database Schema](../../supabase/migrations/ghostwriter/README.md)
- [Frontend Integration](../../frontend/src/lib/api/ghostwriter.ts)

---

## Support

For issues or questions:
1. Check this README and related documentation
2. Review test files for examples
3. Check Edge Function logs for errors
4. Consult the troubleshooting section

---

**Last Updated:** 2025-12-19  
**Version:** 1.0.0
