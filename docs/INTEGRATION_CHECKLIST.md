# Memory Capture Workflow - Integration Checklist

## Overview
This checklist tracks the integration tasks needed to connect the frontend memory capture workflow to backend services (OpenAI, Whisper, Supabase).

## Integration Status Legend
- ✅ **Complete**: Fully implemented and tested
- 🔄 **In Progress**: Currently being worked on
- ⏳ **Not Started**: Ready for implementation
- 🚫 **Blocked**: Waiting on dependencies

---

## 1. OpenAI Integration

### 1.1 Conversational AI Setup
**File**: [`frontend/src/components/ghostwriter/ConversationalPrompt.tsx`](frontend/src/components/ghostwriter/ConversationalPrompt.tsx:102)

- [ ] ⏳ Create OpenAI service module
  - Location: `frontend/src/lib/openai.ts`
  - Export: `generateConversationalResponse()`
  - Model: GPT-4 or GPT-4-turbo
  - Temperature: 0.7-0.8

- [ ] ⏳ Define system prompt for memoir ghostwriter
  - Compassionate, empathetic tone
  - One question at a time
  - Context-aware based on user profile
  - Encourage detailed storytelling

- [ ] ⏳ Implement conversation history management
  - Store full message history
  - Include in API context
  - Limit to last 20 messages for token efficiency

- [ ] ⏳ Replace `generateAIResponse()` demo function
  - Line 102 in ConversationalPrompt.tsx
  - Call OpenAI service
  - Handle errors gracefully
  - Show loading states

- [ ] ⏳ Add user profile context to prompts
  - Include age, location, family structure
  - Reference previous sections
  - Personalize questions

### 1.2 Environment Configuration
- [ ] ⏳ Add OpenAI API key to environment
  - Variable: `VITE_OPENAI_API_KEY`
  - Document in `.env.example`
  - Secure key storage

- [ ] ⏳ Configure API endpoint
  - Variable: `VITE_OPENAI_API_URL`
  - Default: `https://api.openai.com/v1`

### 1.3 Error Handling
- [ ] ⏳ Handle rate limits
  - Implement exponential backoff
  - Show user-friendly messages
  - Queue requests if needed

- [ ] ⏳ Handle API errors
  - Network failures
  - Invalid responses
  - Timeout handling

### 1.4 Testing
- [ ] ⏳ Test conversational flow
  - Multi-turn conversations
  - Context retention
  - Natural responses

- [ ] ⏳ Test edge cases
  - Very long responses
  - Special characters
  - Multiple languages

---

## 2. Whisper Integration

### 2.1 Audio Recording Setup
**Files**: 
- [`frontend/src/components/ghostwriter/ConversationalPrompt.tsx`](frontend/src/components/ghostwriter/ConversationalPrompt.tsx:318)
- [`frontend/src/components/ghostwriter/ScenePrompt.tsx`](frontend/src/components/ghostwriter/ScenePrompt.tsx:275)

- [ ] ⏳ Create audio recording service
  - Location: `frontend/src/lib/audio.ts`
  - Use MediaRecorder API
  - Support multiple audio formats (webm, mp4, wav)

- [ ] ⏳ Implement recording controls
  - Start recording
  - Stop recording
  - Cancel recording
  - Visual feedback (recording indicator)

- [ ] ⏳ Handle browser permissions
  - Request microphone access
  - Handle permission denial
  - Show permission instructions

### 2.2 Whisper API Integration
- [ ] ⏳ Create Whisper service module
  - Location: `frontend/src/lib/whisper.ts`
  - Export: `transcribeAudio()`
  - Handle file upload

- [ ] ⏳ Implement transcription endpoint
  - Backend: `POST /api/audio/transcribe`
  - Accept audio blob
  - Return transcription text
  - Include confidence score

- [ ] ⏳ Replace microphone button handlers
  - ConversationalPrompt.tsx line 318
  - ScenePrompt.tsx line 275
  - Connect to audio service
  - Insert transcription into text field

### 2.3 Audio Processing
- [ ] ⏳ Implement audio compression
  - Reduce file size before upload
  - Maintain quality for transcription
  - Show compression progress

- [ ] ⏳ Add audio format conversion
  - Convert to Whisper-compatible format
  - Handle browser compatibility

- [ ] ⏳ Implement chunking for long recordings
  - Split recordings > 25MB
  - Process chunks sequentially
  - Combine transcriptions

### 2.4 Environment Configuration
- [ ] ⏳ Add Whisper API configuration
  - Variable: `VITE_WHISPER_API_URL`
  - Variable: `VITE_MAX_AUDIO_SIZE`
  - Document in `.env.example`

### 2.5 Mobile Optimization
- [ ] ⏳ Test on iOS Safari
  - Microphone permissions
  - Audio recording
  - Upload functionality

- [ ] ⏳ Test on Android Chrome
  - Microphone permissions
  - Audio recording
  - Upload functionality

- [ ] ⏳ Optimize for mobile networks
  - Compress audio aggressively
  - Show upload progress
  - Handle slow connections

### 2.6 Testing
- [ ] ⏳ Test recording quality
  - Clear audio
  - Background noise handling
  - Multiple speakers

- [ ] ⏳ Test transcription accuracy
  - Various accents
  - Technical terms
  - Proper nouns

---

## 3. Backend API Integration

### 3.1 Prompt Management API
**File**: [`frontend/src/lib/api/ghostwriter.ts`](frontend/src/lib/api/ghostwriter.ts)

- [ ] ⏳ Implement `POST /api/prompts/generate`
  - Generate prompts for section
  - Use user profile context
  - Return 3-5 prompts per section

- [ ] ⏳ Implement `GET /api/sections/:sectionId/prompts`
  - Fetch existing prompts
  - Include completion status
  - Order by creation date

- [ ] ⏳ Replace mock data in `generatePromptsForSection()`
  - Line 349 in ghostwriter.ts
  - Call real API endpoint
  - Handle loading states

### 3.2 Memory Storage API
- [ ] ⏳ Implement `POST /api/memories/save`
  - Save memory responses
  - Support all capture modes
  - Store metadata (word count, duration, voice used)

- [ ] ⏳ Implement `GET /api/memories/:promptId`
  - Fetch saved memories
  - Include quality scores
  - Return formatted content

- [ ] ⏳ Implement `PUT /api/memories/:memoryId`
  - Update existing memories
  - Track revision history
  - Maintain version control

- [ ] ⏳ Replace mock data in memory save functions
  - Update ConversationalPrompt.tsx save logic
  - Update ScenePrompt.tsx save logic
  - Handle save errors

### 3.3 Section Synthesis API
- [ ] ⏳ Implement `POST /api/synthesis/section`
  - Generate chapter from memories
  - Use OpenAI for synthesis
  - Return formatted text

- [ ] ⏳ Implement `GET /api/synthesis/section/:sectionId`
  - Fetch existing synthesis
  - Include metadata
  - Return quality scores

- [ ] ⏳ Connect to SynthesisCheckpoint component
  - Fetch synthesis on page load
  - Show loading states
  - Handle synthesis errors

### 3.4 Book Synthesis API
- [ ] ⏳ Implement `POST /api/synthesis/book`
  - Combine all chapters
  - Generate table of contents
  - Calculate total word count

- [ ] ⏳ Implement `GET /api/synthesis/book/:projectId`
  - Fetch complete book data
  - Include all chapters
  - Return metadata

- [ ] ⏳ Connect to BookSynthesisPage
  - Replace mock data
  - Show real chapter data
  - Display accurate statistics

### 3.5 Export API
- [ ] ⏳ Implement `POST /api/export/book`
  - Generate PDF export
  - Generate DOCX export
  - Generate EPUB export (optional)

- [ ] ⏳ Implement download URL generation
  - Secure temporary URLs
  - Set expiration time
  - Handle large files

- [ ] ⏳ Connect export button
  - BookSynthesisPage export button
  - Show export progress
  - Trigger download

### 3.6 Testing
- [ ] ⏳ Test API error handling
  - Network failures
  - Invalid data
  - Authentication errors

- [ ] ⏳ Test data persistence
  - Save and retrieve memories
  - Update existing data
  - Delete data

---

## 4. Supabase Integration

### 4.1 Database Schema
- [ ] ⏳ Review existing schema
  - Check ghostwriter migrations
  - Verify table structure
  - Ensure indexes exist

- [ ] ⏳ Add missing tables if needed
  - Prompts table
  - Memories table
  - Synthesis table

### 4.2 Authentication
- [ ] ⏳ Verify Supabase auth integration
  - Check ProtectedRoute component
  - Test session management
  - Handle token refresh

- [ ] ⏳ Add row-level security policies
  - Users can only access their own data
  - Implement proper permissions
  - Test security rules

### 4.3 Real-time Features (Optional)
- [ ] ⏳ Add real-time updates for collaboration
  - Multiple users on same project
  - Live typing indicators
  - Conflict resolution

### 4.4 Storage
- [ ] ⏳ Configure Supabase Storage for audio files
  - Create audio bucket
  - Set size limits
  - Configure CORS

- [ ] ⏳ Implement audio upload to Supabase
  - Upload from browser
  - Generate signed URLs
  - Clean up old files

---

## 5. Quality & Polish

### 5.1 Quality Scoring
- [ ] ⏳ Implement quality scoring algorithm
  - Word count thresholds
  - Detail level assessment
  - Emotional depth scoring

- [ ] ⏳ Add quality feedback UI
  - Show scores in PromptList
  - Display improvement suggestions
  - Track quality over time

### 5.2 Performance Optimization
- [ ] ⏳ Implement lazy loading
  - Load prompts on demand
  - Paginate long lists
  - Defer non-critical data

- [ ] ⏳ Add caching
  - Cache AI responses
  - Cache user profile
  - Cache section data

- [ ] ⏳ Optimize bundle size
  - Code splitting
  - Tree shaking
  - Lazy load components

### 5.3 Error Handling
- [ ] ⏳ Add global error boundary
  - Catch React errors
  - Show user-friendly messages
  - Log errors for debugging

- [ ] ⏳ Implement retry logic
  - Retry failed API calls
  - Exponential backoff
  - Max retry limits

### 5.4 Loading States
- [ ] ⏳ Add loading indicators
  - API calls
  - AI responses
  - Audio transcription

- [ ] ⏳ Add skeleton screens
  - Prompt list loading
  - Section roadmap loading
  - Book synthesis loading

### 5.5 Analytics
- [ ] ⏳ Add analytics tracking
  - User actions
  - Completion rates
  - Time spent per section

- [ ] ⏳ Add error monitoring
  - Sentry or similar
  - Track API errors
  - Monitor performance

---

## 6. Testing & Validation

### 6.1 Unit Tests
- [ ] ⏳ Test OpenAI service
  - Mock API responses
  - Test error handling
  - Test context building

- [ ] ⏳ Test Whisper service
  - Mock transcription
  - Test audio processing
  - Test error handling

- [ ] ⏳ Test API client
  - Mock endpoints
  - Test request/response
  - Test error handling

### 6.2 Integration Tests
- [ ] ⏳ Test complete workflow
  - Empty state → prompt generation
  - Prompt selection → memory capture
  - Memory capture → section completion
  - Section completion → book synthesis

- [ ] ⏳ Test all capture modes
  - Conversational mode
  - Structured mode
  - Freeform mode

- [ ] ⏳ Test voice input
  - Recording
  - Transcription
  - Text insertion

### 6.3 End-to-End Tests
- [ ] ⏳ Test user journey
  - Create project
  - Complete all sections
  - Generate book
  - Export book

- [ ] ⏳ Test mobile experience
  - iOS Safari
  - Android Chrome
  - Responsive layouts

### 6.4 Performance Tests
- [ ] ⏳ Test with large datasets
  - Many prompts
  - Long conversations
  - Large audio files

- [ ] ⏳ Test API performance
  - Response times
  - Concurrent requests
  - Rate limiting

---

## 7. Documentation

### 7.1 Developer Documentation
- [x] ✅ Memory Capture Workflow guide
- [ ] ⏳ API integration guide
- [ ] ⏳ OpenAI setup guide
- [ ] ⏳ Whisper setup guide

### 7.2 User Documentation
- [ ] ⏳ User guide for memory capture
- [ ] ⏳ Voice input tutorial
- [ ] ⏳ FAQ for common issues
- [ ] ⏳ Video tutorials

### 7.3 Deployment Documentation
- [ ] ⏳ Environment setup guide
- [ ] ⏳ API key management
- [ ] ⏳ Deployment checklist
- [ ] ⏳ Monitoring setup

---

## Priority Matrix

### 🔴 Critical (Week 1)
1. OpenAI conversational AI integration
2. Backend API endpoints for data persistence
3. Connect frontend to backend APIs
4. Basic error handling

### 🟡 High Priority (Week 2)
1. Whisper API integration
2. Audio recording implementation
3. Quality scoring system
4. Mobile testing

### 🟢 Medium Priority (Week 3)
1. Section synthesis
2. Book synthesis
3. Export functionality
4. Performance optimization

### 🔵 Low Priority (Week 4+)
1. Advanced analytics
2. Real-time collaboration
3. Additional export formats
4. Advanced quality features

---

## Dependencies

### External Services
- OpenAI API account and key
- Whisper API access (via OpenAI)
- Supabase project configured
- Storage bucket for audio files

### Environment Variables Required
```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_API_URL=https://api.openai.com/v1

# Whisper
VITE_WHISPER_API_URL=https://api.openai.com/v1/audio/transcriptions
VITE_MAX_AUDIO_SIZE=25000000

# Supabase
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# API
VITE_API_BASE_URL=http://localhost:54321/functions/v1
```

### Package Dependencies
```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ All UI components functional
- [ ] OpenAI integration working
- [ ] Basic voice input working
- [ ] Data persists to database
- [ ] Complete workflow functional end-to-end

### Full Feature Set
- [ ] All capture modes working
- [ ] Voice input on all platforms
- [ ] Section synthesis generating quality text
- [ ] Book export in multiple formats
- [ ] Quality scoring providing feedback
- [ ] Mobile experience optimized

### Production Ready
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Monitoring in place

---

## Notes

### Known Issues
- None currently - all UI components working in demo mode

### Future Enhancements
- Photo upload and intelligence integration
- Collaborative editing features
- Advanced export options (custom formatting)
- AI-powered editing suggestions
- Timeline visualization
- Family tree integration

### Questions for Product Team
- What is the target response time for AI questions?
- What is the maximum audio recording length?
- What export formats are highest priority?
- What quality score thresholds should trigger feedback?

---

## Related Documentation
- [`MEMORY_CAPTURE_WORKFLOW.md`](MEMORY_CAPTURE_WORKFLOW.md) - Complete workflow documentation
- [`GHOSTWRITER_WORKFLOW_GUIDE.md`](GHOSTWRITER_WORKFLOW_GUIDE.md) - Overall architecture
- [`API_SPECIFICATIONS.md`](API_SPECIFICATIONS.md) - API endpoint specs
- [`FRONTEND_STATUS.md`](FRONTEND_STATUS.md) - Frontend implementation status
