# Mock Synthesis Data Setup

## Overview

Mock synthesis data has been added to enable testing of the chapter synthesis/preview functionality without requiring a backend database connection.

## Files Created/Modified

### 1. Mock Data File
**Location:** [`frontend/src/data/mockSynthesisData.ts`](../frontend/src/data/mockSynthesisData.ts)

This file contains:
- **`SynthesisData` interface**: TypeScript interface defining the structure of synthesis data
- **`mockChapter1Synthesis`**: Complete mock data for Chapter 1 ("Origins" section)
- **Helper functions**:
  - `getMockSynthesis(sectionKey)`: Retrieve mock synthesis data by section key
  - `hasMockSynthesis(sectionKey)`: Check if mock data exists for a section

### 2. Chapter Review Page
**Location:** [`frontend/src/pages/ChapterReviewPage.tsx`](../frontend/src/pages/ChapterReviewPage.tsx)

**Changes:**
- Imports mock synthesis data utilities
- Falls back to mock data when database query fails
- Uses mock quality scores for Chapter 1
- Displays full chapter content from mock data

### 3. Chapter Overview Page
**Location:** [`frontend/src/pages/ChapterOverviewPage.tsx`](../frontend/src/pages/ChapterOverviewPage.tsx)

**Changes:**
- Imports mock synthesis utilities
- Automatically adds mock Chapter 1 when no chapters exist in database
- Displays Chapter 1 as "approved" status with 2,150 words

### 4. Database Migration (Optional)
**Location:** [`supabase/migrations/ghostwriter/010_add_mock_synthesis_data.sql`](../supabase/migrations/ghostwriter/010_add_mock_synthesis_data.sql)

SQL migration file that can be run when backend is set up to populate real database with the same mock data.

## Mock Chapter 1 Content

### Chapter Details
- **Title:** "Where It All Started"
- **Section:** Origins
- **Word Count:** 2,150 words
- **Status:** Approved
- **Quality Score:** 0.92 (92%)

### Content Summary
The mock chapter tells a nostalgic story about:
- Being born in a small brick house on Maple Street in 1952
- A mother who was a seamstress with a sewing machine that hummed at night
- A father who worked at a steel mill and took the narrator fishing on Saturdays
- Sensory details: green door painted every spring, rose bushes, fresh paint smell
- Reflective framing showing wisdom gained over time

### Quality Metrics
- **Sensory Richness:** 0.95 (95%) ✅
- **Emotional Depth:** 0.88 (88%) ✅
- **Narrative Flow:** 0.94 (94%) ✅
- **Voice Consistency:** 0.91 (91%) ✅
- **Character Development:** 0.89 (89%) ✅

### Recommendations
1. **Enhancement (Low Priority):** Consider adding a photo of the house or family from this era
2. **Expansion (Low Priority):** Could expand on siblings or other family members if relevant

## How to Use

### Viewing Mock Chapter 1

1. **Navigate to any project's chapters page:**
   ```
   /projects/{projectId}/chapters
   ```

2. **If no chapters exist in the database:**
   - Mock Chapter 1 will automatically appear in the list
   - Shows as "Approved" with 2,150 words

3. **Click "View Chapter" to see the full content:**
   ```
   /projects/{projectId}/chapters/chapter-1
   ```

4. **The chapter review page will display:**
   - Full chapter text with proper formatting
   - Quality metrics with visual progress bars
   - Recommendations for enhancement
   - Action buttons (Approve, Request Changes, Regenerate)

### Adding More Mock Chapters

To add mock data for additional chapters, edit [`mockSynthesisData.ts`](../frontend/src/data/mockSynthesisData.ts):

```typescript
export const mockChapter2Synthesis: SynthesisData = {
  id: 'mock-synthesis-002',
  sectionId: 'childhood',
  sectionTitle: 'Childhood Memories',
  chapterNumber: 2,
  previewContent: `# Chapter 2: Childhood Days\n\n...`,
  wordCount: 2300,
  qualityScore: 0.89,
  // ... rest of the structure
}

// Add to the export object
export const mockSynthesisData: Record<string, SynthesisData> = {
  'origins': mockChapter1Synthesis,
  'chapter-1': mockChapter1Synthesis,
  'childhood': mockChapter2Synthesis,
  'chapter-2': mockChapter2Synthesis
}
```

## Testing Checklist

- [x] Mock data file created with complete Chapter 1 content
- [x] ChapterOverviewPage displays mock Chapter 1 when no database chapters exist
- [x] ChapterReviewPage loads and displays mock Chapter 1 content
- [x] Quality metrics display correctly from mock data
- [x] Chapter content renders with proper formatting
- [x] TypeScript types are correct and compile without errors

## Future Enhancements

When backend is implemented:

1. **Run the SQL migration** to populate real database:
   ```bash
   psql -U postgres -d your_database -f supabase/migrations/ghostwriter/010_add_mock_synthesis_data.sql
   ```

2. **Remove mock data fallbacks** from frontend code once real data is available

3. **Keep mock data file** for development/testing purposes

## Related Documentation

- [`SYNTHESIS_ARCHITECTURE.md`](SYNTHESIS_ARCHITECTURE.md) - Chapter synthesis architecture
- [`DATA_MODEL.md`](DATA_MODEL.md) - Database schema and data structures
- [`GHOSTWRITER_WORKFLOW_GUIDE.md`](GHOSTWRITER_WORKFLOW_GUIDE.md) - Complete workflow guide
