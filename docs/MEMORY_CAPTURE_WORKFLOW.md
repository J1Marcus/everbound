# Memory Capture Workflow Implementation

## Overview
This document describes the complete memory capture workflow implementation for the Everbound/everbound digital memoir platform. The workflow guides users through capturing life stories via AI-powered prompts organized into chronological sections.

## Architecture

### Workflow Stages
1. **Empty State** → Prompt Generation
2. **Prompt Selection** → Mode Selection
3. **Memory Capture** → Multi-mode capture (Conversational/Structured/Freeform)
4. **Section Completion** → Chapter Preview
5. **Project Completion** → Book Synthesis
6. **Export** → Final Book

## Component Reference

### 1. Empty State & Prompt Generation
**File**: [`frontend/src/components/ghostwriter/PromptList.tsx`](frontend/src/components/ghostwriter/PromptList.tsx)

**Features**:
- Displays empty state when no prompts exist in a section
- "Generate Memory Prompts" button creates demo prompts
- Currently generates 3 demo prompts per section
- Works in demo mode without backend

**Integration Point**:
```typescript
// Backend API needed: POST /api/prompts/generate
// Request: { sectionId: string, userId: string, profileContext: object }
// Response: { prompts: Prompt[] }
```

### 2. Multi-Mode Memory Capture

#### A. Conversational Mode (Recommended)
**File**: [`frontend/src/components/ghostwriter/ConversationalPrompt.tsx`](frontend/src/components/ghostwriter/ConversationalPrompt.tsx)

**Features**:
- AI-guided chat interface with one question at a time
- Message history with smooth auto-scrolling
- Voice input via microphone button
- Saves complete conversation transcript as memory

**Current Implementation**:
- Demo AI responses via `generateAIResponse()` function
- Simulates 1-2 second response delay
- Stores messages in component state

**Integration Points**:
```typescript
// OpenAI Integration needed at line 102
const generateAIResponse = async (userMessage: string): Promise<string> => {
  // TODO: Replace with actual OpenAI API call
  // Use GPT-4 with conversation history
  // Include user profile context for personalization
  // System prompt: "You are a compassionate memoir ghostwriter..."
}

// Whisper Integration needed at line 318
const handleVoiceInput = async () => {
  // TODO: Implement Whisper API for voice-to-text
  // 1. Record audio from microphone
  // 2. Send to Whisper API
  // 3. Insert transcribed text into input field
}
```

**API Endpoints Needed**:
- `POST /api/chat/message` - Send user message, receive AI response
- `POST /api/memories/save` - Save conversation transcript
- `POST /api/audio/transcribe` - Whisper transcription endpoint

#### B. Structured Mode
**File**: [`frontend/src/components/ghostwriter/ScenePrompt.tsx`](frontend/src/components/ghostwriter/ScenePrompt.tsx)

**Features**:
- Traditional form-based capture
- Multiple fields per prompt (who, what, when, where, why)
- Inline microphone button on every text field (line 256)
- Character count and validation

**Integration Point**:
```typescript
// Whisper Integration needed at line 275
// Each text field has a microphone button for voice input
```

#### C. Freeform Mode
**File**: [`frontend/src/pages/ghostwriter/PromptCapturePage.tsx`](frontend/src/pages/ghostwriter/PromptCapturePage.tsx)

**Features**:
- Single large text area for free writing
- Minimal structure, maximum flexibility
- Voice input support

### 3. Mode Selector
**File**: [`frontend/src/components/ghostwriter/PromptModeSelector.tsx`](frontend/src/components/ghostwriter/PromptModeSelector.tsx)

**Features**:
- Visual cards for each capture mode
- Conversational mode marked as "Recommended"
- Descriptions and icons for each mode
- Persists selection to route to appropriate interface

### 4. Section Completion Flow
**File**: [`frontend/src/components/ghostwriter/PromptList.tsx`](frontend/src/components/ghostwriter/PromptList.tsx:286)

**Features**:
- Automatically detects when all prompts in section are completed
- Shows celebration card with confetti animation
- "Continue to Chapter Preview" button
- Routes to synthesis checkpoint page

**Logic**:
```typescript
const allPromptsCompleted = prompts.every(p => p.status === 'completed');
if (allPromptsCompleted) {
  // Show celebration card
  // Navigate to /ghostwriter/synthesis/:projectId/:sectionId
}
```

### 5. Project Completion Flow
**File**: [`frontend/src/pages/ghostwriter/SectionRoadmapPage.tsx`](frontend/src/pages/ghostwriter/SectionRoadmapPage.tsx:134)

**Features**:
- Detects when ALL sections (10 chapters) are complete
- Shows large celebration card
- "Continue to Book Synthesis" button
- Routes to final book review page

**Logic**:
```typescript
const allSectionsComplete = sections.every(s => s.status === 'completed');
if (allSectionsComplete) {
  // Show project completion celebration
  // Navigate to /ghostwriter/book-synthesis/:projectId
}
```

### 6. Book Synthesis Page
**File**: [`frontend/src/pages/ghostwriter/BookSynthesisPage.tsx`](frontend/src/pages/ghostwriter/BookSynthesisPage.tsx)

**Features**:
- Final book review showing all 10 chapters
- Chapter overview with word counts and page estimates
- "Review & Edit" button for each chapter
- "Export Complete Book" button (placeholder)
- Professional book-like layout

**Route**: `/ghostwriter/book-synthesis/:projectId`

**Integration Points**:
```typescript
// Backend API needed:
// GET /api/synthesis/book/:projectId - Fetch complete book data
// POST /api/export/book/:projectId - Export final book (PDF/DOCX)
```

### 7. Non-Sequential Section Access
**File**: [`frontend/src/lib/api/ghostwriter.ts`](frontend/src/lib/api/ghostwriter.ts:349)

**Implementation**:
- All sections unlocked by default (`isLocked: false`)
- Users can work on any section in any order
- No sequential progression required
- Flexible workflow for user preference

## Mock Data Configuration

### Dashboard Mock Data
**File**: [`frontend/src/pages/DashboardPage.tsx`](frontend/src/pages/DashboardPage.tsx:26)

**Configuration**:
- Project ID '2' ("The Smith Family Chronicles") set to 100% complete
- Used to demonstrate complete project flow
- Shows book synthesis button on dashboard

### API Mock Data
**File**: [`frontend/src/lib/api/ghostwriter.ts`](frontend/src/lib/api/ghostwriter.ts:203)

**Configuration**:
- Project ID '2' returns all sections as completed
- Enables testing of completion flows
- Demonstrates full workflow end-to-end

## Voice Input Integration

### Microphone Button Locations
1. **Conversational Mode**: Single mic button in chat input (line 318)
2. **Structured Mode**: Inline mic button on every text field (line 275)
3. **Freeform Mode**: Single mic button in text area

### Whisper API Integration Plan
```typescript
// Recommended implementation pattern:
interface VoiceInputHandler {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  transcribe(audio: Blob): Promise<string>;
}

// Usage:
const voiceHandler = new VoiceInputHandler();
await voiceHandler.startRecording();
// ... user speaks ...
const audioBlob = await voiceHandler.stopRecording();
const transcription = await voiceHandler.transcribe(audioBlob);
// Insert transcription into text field
```

## OpenAI Integration

### Conversational AI Requirements
**File**: [`frontend/src/components/ghostwriter/ConversationalPrompt.tsx`](frontend/src/components/ghostwriter/ConversationalPrompt.tsx:102)

**Implementation Needs**:
1. **Model**: GPT-4 or GPT-4-turbo
2. **System Prompt**: Compassionate memoir ghostwriter persona
3. **Context**: User profile data (age, background, preferences)
4. **History**: Full conversation history for context
5. **Temperature**: 0.7-0.8 for natural, empathetic responses

**Example System Prompt**:
```
You are a compassionate memoir ghostwriter helping someone capture their life story. 
Ask thoughtful, open-ended questions that encourage detailed storytelling. 
Show empathy and genuine interest. Keep questions focused and one at a time.
Use the user's profile context to personalize your questions.
```

### Context-Aware Prompts
- Use user profile data (age, location, family structure)
- Reference previous sections and memories
- Adapt tone based on section theme (childhood, career, family)
- Generate follow-up questions based on user responses

## Backend API Endpoints Required

### Prompt Management
```typescript
POST /api/prompts/generate
Request: {
  sectionId: string;
  userId: string;
  profileContext: UserProfile;
  count?: number; // Default: 3
}
Response: {
  prompts: Prompt[];
}

GET /api/sections/:sectionId/prompts
Response: {
  prompts: Prompt[];
}
```

### Memory Storage
```typescript
POST /api/memories/save
Request: {
  promptId: string;
  userId: string;
  content: string | ConversationTranscript;
  mode: 'conversational' | 'structured' | 'freeform';
  metadata?: {
    wordCount: number;
    duration?: number;
    voiceUsed?: boolean;
  };
}
Response: {
  memoryId: string;
  qualityScore?: number;
}
```

### Synthesis
```typescript
POST /api/synthesis/section
Request: {
  sectionId: string;
  userId: string;
}
Response: {
  synthesizedText: string;
  wordCount: number;
  pageEstimate: number;
}

POST /api/synthesis/book
Request: {
  projectId: string;
  userId: string;
}
Response: {
  chapters: Chapter[];
  totalWordCount: number;
  totalPages: number;
}
```

### Export
```typescript
POST /api/export/book
Request: {
  projectId: string;
  userId: string;
  format: 'pdf' | 'docx' | 'epub';
}
Response: {
  downloadUrl: string;
  expiresAt: string;
}
```

### Voice Transcription
```typescript
POST /api/audio/transcribe
Request: FormData {
  audio: Blob;
  language?: string; // Default: 'en'
}
Response: {
  transcription: string;
  confidence: number;
}
```

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Section Roadmap (10 chapters)                            │
│    - All sections unlocked                                  │
│    - User selects any section                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Prompt List (Empty State)                                │
│    - "Generate Memory Prompts" button                       │
│    - Creates 3 prompts for section                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Prompt List (With Prompts)                               │
│    - Shows 3 generated prompts                              │
│    - User clicks "Start" on a prompt                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Mode Selector                                            │
│    - Conversational (Recommended)                           │
│    - Structured                                             │
│    - Freeform                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Memory Capture (Selected Mode)                           │
│    - Conversational: AI chat interface                      │
│    - Structured: Form with fields                           │
│    - Freeform: Large text area                              │
│    - Voice input available in all modes                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Save Memory                                              │
│    - Stores response in database                            │
│    - Marks prompt as completed                              │
│    - Returns to Prompt List                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Section Completion Check                                 │
│    - If all prompts completed → Show celebration            │
│    - "Continue to Chapter Preview" button                   │
│    - If not complete → Return to Prompt List                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Chapter Preview (Synthesis Checkpoint)                   │
│    - Shows synthesized chapter text                         │
│    - Quality feedback                                       │
│    - Edit or approve                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Return to Section Roadmap                                │
│    - Section marked as complete                             │
│    - User can select another section                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Project Completion Check                                │
│     - If all 10 sections complete → Show celebration        │
│     - "Continue to Book Synthesis" button                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. Book Synthesis Page                                     │
│     - Shows all 10 chapters                                 │
│     - Word counts and page estimates                        │
│     - "Review & Edit" for each chapter                      │
│     - "Export Complete Book" button                         │
└─────────────────────────────────────────────────────────────┘
```

## Current State

### ✅ Completed
- All UI components functional in demo mode
- TypeScript compilation successful
- Complete user flow from empty state to book synthesis
- All sections accessible in any order
- Three capture modes implemented
- Voice input UI components ready
- Section and project completion flows
- Mock data for testing complete workflow

### 🔄 In Progress / Demo Mode
- OpenAI integration (using demo responses)
- Whisper integration (UI ready, API not connected)
- Backend API connections (using mock data)
- Data persistence (in-memory only)

### ⏳ Not Started
- Actual OpenAI API integration
- Actual Whisper API integration
- Backend API endpoint implementation
- Database persistence
- Book export functionality (PDF/DOCX)
- Quality scoring and feedback mechanisms
- Photo upload and intelligence features

## Testing the Workflow

### Demo Mode Testing
1. Navigate to dashboard
2. Select "The Smith Family Chronicles" (Project ID '2')
3. View completed project state
4. Click "View Book Synthesis" to see final book
5. Create new project to test empty states
6. Generate prompts in any section
7. Test all three capture modes
8. Complete prompts to trigger section completion
9. Complete all sections to trigger project completion

### Integration Testing Checklist
- [ ] OpenAI API returns contextual questions
- [ ] Whisper API transcribes voice accurately
- [ ] Memories persist to database
- [ ] Section synthesis generates coherent text
- [ ] Book synthesis combines all chapters
- [ ] Export generates downloadable file
- [ ] Quality scoring provides feedback
- [ ] Voice input works on mobile devices

## Performance Considerations

### Optimization Opportunities
1. **Lazy Loading**: Load prompts on-demand
2. **Caching**: Cache AI responses for similar questions
3. **Debouncing**: Debounce voice input processing
4. **Pagination**: Paginate long conversation histories
5. **Compression**: Compress audio before upload
6. **CDN**: Serve static assets from CDN

### Mobile Optimization
- Voice input critical for mobile users
- Touch-friendly UI elements
- Responsive layouts tested
- Offline support via PWA (service worker ready)

## Security Considerations

### Data Protection
- User memories contain sensitive personal information
- Encrypt data in transit (HTTPS)
- Encrypt data at rest (database encryption)
- Implement proper authentication and authorization
- Rate limit API endpoints to prevent abuse

### Voice Data
- Audio files should be deleted after transcription
- Don't store raw audio unless user explicitly opts in
- Comply with data privacy regulations (GDPR, CCPA)

## Next Steps Priority

### Phase 1: Core Integration (High Priority)
1. Integrate OpenAI API for conversational prompts
2. Implement backend API endpoints for data persistence
3. Connect frontend to backend APIs
4. Test end-to-end workflow with real data

### Phase 2: Voice Integration (Medium Priority)
1. Integrate Whisper API for voice transcription
2. Implement audio recording in browser
3. Test voice input on mobile devices
4. Optimize audio upload and processing

### Phase 3: Synthesis & Export (Medium Priority)
1. Implement section synthesis logic
2. Implement book synthesis logic
3. Create PDF export functionality
4. Add DOCX export option

### Phase 4: Quality & Polish (Low Priority)
1. Implement quality scoring system
2. Add feedback mechanisms
3. Optimize performance
4. Add analytics and monitoring

## Related Documentation
- [`GHOSTWRITER_WORKFLOW_GUIDE.md`](GHOSTWRITER_WORKFLOW_GUIDE.md) - Overall workflow architecture
- [`GHOSTWRITER_FRONTEND_IMPLEMENTATION.md`](GHOSTWRITER_FRONTEND_IMPLEMENTATION.md) - Frontend implementation details
- [`API_SPECIFICATIONS.md`](API_SPECIFICATIONS.md) - API endpoint specifications
- [`USER_WORKFLOWS.md`](USER_WORKFLOWS.md) - User journey documentation
