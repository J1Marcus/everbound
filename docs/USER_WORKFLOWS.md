# Digital Memoir Platform - User Workflows

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document defines the complete user workflows for the Digital Memoir Platform, ensuring all user journeys support the assembly-based narrative generation, voice preservation, and print-first requirements.

---

## 1. Workflow Overview

### 1.1 Core User Journeys

1. **Individual Memoir Creation:** Single narrator creating personal life story
2. **Family Memoir Creation:** Multiple narrators creating shared family story
3. **Voice Calibration:** Establishing narrator's unique voice
4. **Memory Capture:** Adding memory fragments to project
5. **Chapter Generation:** Assembling chapters from fragments
6. **Collaboration:** Family members providing feedback and corrections
7. **Quality Review:** Running quality gates and refinement
8. **Print Production:** Generating print-ready book

### 1.2 User Roles

- **Project Owner:** Creates and owns the project
- **Narrator:** Primary author (Individual Memoir)
- **Co-Narrator:** Independent author (Family Memoir)
- **Contributor:** Provides feedback and corrections
- **Reviewer:** Read-only access

---

## 2. Individual Memoir Workflow

### 2.1 Project Setup

**Goal:** Create new Individual Memoir project and configure settings

**Steps:**

1. **Create Account**
   - User registers with email and password
   - Email verification sent
   - User verifies email

2. **Create Project**
   - Click "Create New Memoir"
   - Select "Individual Memoir (My Story)"
   - Enter project details:
     - Title: "My Life Story"
     - Subtitle (optional)
     - Description
     - Target page count (default: 300)
     - Target chapter count (default: 20)
     - Trim size (default: 6x9)
   - Click "Create Project"

3. **Project Created**
   - Status: `setup`
   - User directed to Voice Calibration

**Success Criteria:**
- Project created in database
- User is project owner
- Status is `setup`

---

### 2.2 Voice Calibration

**Goal:** Establish narrator's unique voice characteristics

**Steps:**

1. **Introduction**
   - System explains voice calibration purpose
   - "We'll analyze your natural writing and speaking style to ensure the book sounds like you"

2. **Writing Sample**
   - Prompt: "Write 500-1000 words about any topic in your natural style"
   - Suggestions provided:
     - "Describe a typical day in your life"
     - "Write about a place that's meaningful to you"
     - "Share a lesson you've learned"
   - User writes in text editor
   - Word count displayed (minimum 500 words)
   - Click "Submit Writing Sample"

3. **Voice Recording**
   - Prompt: "Record 3-5 minutes of yourself speaking naturally"
   - Suggestions provided:
     - "Tell a story from your childhood"
     - "Describe your family"
     - "Talk about your career"
   - User clicks "Start Recording"
   - Recording interface with timer
   - User clicks "Stop Recording" when done
   - Playback option to review
   - Click "Submit Recording"

4. **Processing**
   - System analyzes writing sample and voice recording
   - Progress indicator: "Analyzing your voice... This may take 2-3 minutes"
   - Voice profile created with characteristics:
     - Sentence length and complexity
     - Formality level
     - Emotional expression
     - Humor indicators
     - Vocabulary range

5. **Voice Profile Complete**
   - Status: `calibrating` → `collecting`
   - User directed to Memory Capture
   - Voice profile stored and will constrain all generated prose

**Success Criteria:**
- Writing sample submitted (500+ words)
- Voice recording submitted (3+ minutes)
- Voice profile created with characteristics
- Project status updated to `collecting`

**Blocking Conditions:**
- Cannot proceed without both samples
- Writing sample must meet minimum length
- Voice recording must meet minimum duration

---

### 2.3 Memory Capture

**Goal:** Collect memory fragments to build narrative foundation

**Steps:**

1. **Memory Capture Dashboard**
   - Display progress:
     - Fragments collected: 0
     - Chapters ready: 0 / 20
     - Completion: 0%
   - Three input options:
     - "Add Text Memory"
     - "Record Voice Memory"
     - "Upload Photo Memory"

2. **Add Text Memory**
   - Click "Add Text Memory"
   - Prompt: "Share a specific memory with sensory details"
   - Guidance displayed:
     - "Focus on a specific moment, not a general summary"
     - "Include what you saw, heard, smelled, felt"
     - "Keep it short: 200-500 words"
   - Text editor with word count
   - Timeline anchor:
     - Select date (if known) or life stage
     - Confidence level: High / Medium / Low
   - Location (optional)
   - People mentioned (optional)
   - Click "Save Memory"

3. **Record Voice Memory**
   - Click "Record Voice Memory"
   - Prompt: "Tell a specific story from your life"
   - Recording interface
   - Timeline anchor selection
   - Click "Save Recording"
   - System transcribes audio
   - User can review and edit transcription

4. **Upload Photo Memory**
   - Click "Upload Photo Memory"
   - Upload photo file
   - Prompt: "Describe what's happening in this photo"
   - Context text field (200-500 words)
   - Timeline anchor
   - People in photo
   - Caption
   - Click "Save Photo Memory"

5. **Memory Processing**
   - System processes each memory:
     - Extracts tags (life stage, themes, emotional tone)
     - Identifies key people
     - Analyzes timeline confidence
     - Detects sensory details
   - Status: `raw` → `processing` → `processed`

6. **Chapter Readiness Notifications**
   - When sufficient fragments exist for a chapter:
     - Notification: "Chapter 1 is ready to generate!"
     - Badge on Chapters tab
   - User can continue adding memories or start generating chapters

**Success Criteria:**
- Minimum 5-8 fragments per chapter
- Fragments have sensory details
- Timeline anchors established
- Variety of life stages covered

**Guidance:**
- System suggests life stages needing more coverage
- Prompts for specific types of memories (family, career, challenges, joys)
- Encourages sensory detail and specific moments

---

### 2.4 Chapter Generation

**Goal:** Assemble chapters from validated memory fragments

**Steps:**

1. **Chapter Overview**
   - Display all chapters (1-20)
   - Status indicators:
     - 🔴 Insufficient (not enough fragments)
     - 🟡 Ready (can generate)
     - 🟢 Draft (generated, needs review)
     - ✅ Approved (finalized)
   - Click chapter to view details

2. **Check Chapter Readiness**
   - Click "Chapter 1"
   - Readiness report displayed:
     - Fragments available: 8
     - Fragments required: 5
     - Missing elements: None
     - Recommendations: "Ready to generate"
   - Click "Generate Chapter"

3. **Chapter Generation**
   - System assembles chapter from fragments:
     - Scene-setting passage
     - Specific narrative moments
     - Reflection from hindsight
     - Optional lessons/values
   - Progress indicator: "Generating chapter... 2-3 minutes"
   - Voice constraints applied throughout
   - Status: `ready` → `generating` → `draft`

4. **Review Generated Chapter**
   - Chapter displayed with:
     - Title
     - Full prose content
     - Word count
     - Quality score
     - Quality issues (if any)
   - User reads chapter
   - Options:
     - "Approve Chapter" → Status: `approved`
     - "Request Changes" → Provide feedback
     - "Regenerate" → Generate new version

5. **Request Changes**
   - User provides feedback:
     - "Add more sensory details about the house"
     - "Expand the reflection section"
     - "Include more about my sister"
   - Click "Regenerate with Feedback"
   - System regenerates chapter incorporating feedback

6. **Approve Chapter**
   - User satisfied with chapter
   - Click "Approve Chapter"
   - Status: `draft` → `approved`
   - Chapter locked (can be unlocked if needed)
   - Progress updated: Chapters approved: 1 / 20

**Success Criteria:**
- Chapter meets minimum length (1,500 words)
- Chapter follows structure (scene-setting, moments, reflection)
- Voice consistency maintained
- No quality issues flagged

**Blocking Conditions:**
- Cannot generate if status is `insufficient`
- Must have minimum fragments (5-8)
- Must have voice profile completed

---

### 2.5 Collaboration (Individual Memoir)

**Goal:** Invite family members to provide feedback and corrections

**Steps:**

1. **Invite Collaborators**
   - Click "Collaborate" tab
   - Click "Invite Collaborator"
   - Enter email address
   - Select role: "Contributor" or "Reviewer"
   - Set permissions:
     - ✅ Can view drafts
     - ✅ Can provide feedback
     - ✅ Can submit corrections
     - ✅ Can submit letters
     - ❌ Cannot edit prose directly
   - Click "Send Invitation"

2. **Collaborator Accepts**
   - Collaborator receives email invitation
   - Clicks link to accept
   - Creates account or logs in
   - Gains access to project

3. **Collaborator Provides Feedback**
   - Collaborator views chapters
   - Clicks "Add Feedback" on specific chapter
   - Selects feedback type:
     - Comment
     - Correction
     - Suggestion
     - Question
   - Enters feedback text
   - Click "Submit Feedback"

4. **Owner Reviews Feedback**
   - Owner sees notification: "New feedback from Jane"
   - Reviews feedback
   - Options:
     - Accept → Incorporate into chapter
     - Reject → Dismiss with optional response
     - Respond → Ask for clarification

5. **Collaborator Submits Letter**
   - Collaborator clicks "Write Letter"
   - Selects placement:
     - Foreword
     - Afterword
     - Dedication
     - Standalone
   - Writes letter content
   - Click "Submit Letter"
   - Owner reviews and approves

**Success Criteria:**
- Collaborators can view appropriate content
- Feedback is structured and trackable
- Owner maintains final approval authority
- Letters can be included in manuscript

**Constraints:**
- Collaborators cannot directly edit prose
- All changes require owner approval
- Collaborators cannot alter narrator's voice

---

### 2.6 Quality Review

**Goal:** Run automated quality gates and refine manuscript

**Steps:**

1. **Create Manuscript**
   - All chapters approved
   - Click "Create Manuscript"
   - Enter manuscript details:
     - Title
     - Subtitle
     - Author name
     - Dedication
   - Click "Create Manuscript"
   - Status: `draft`

2. **Run Quality Check**
   - Click "Run Quality Check"
   - System runs all quality gates:
     - Repetition detection
     - Timeline coherence
     - Chapter length validation
     - Emotional balance analysis
     - Filler language detection
   - Progress indicator: "Running quality checks... 3-5 minutes"
   - Status: `draft` → `quality_check`

3. **Review Quality Report**
   - Quality report displayed:
     - Overall score: 0.87 / 1.0
     - Passed: ✅ Yes
     - Individual check results:
       - ✅ Repetition Detection: 0.92
       - ✅ Timeline Coherence: 0.95
       - ⚠️ Chapter Length: 0.78 (Chapter 3 below minimum)
       - ✅ Emotional Balance: 0.85
       - ✅ Filler Language: 0.90
   - Recommendations displayed:
     - "Add 800 more words to Chapter 3"
     - "Consider expanding the summer vacation memory"

4. **Address Quality Issues**
   - If quality check fails:
     - User must address issues before proceeding
     - Click on specific issue to see details
     - Options:
       - Add more memory fragments
       - Regenerate affected chapters
       - Edit chapters directly
   - Re-run quality check after changes

5. **Quality Check Passed**
   - All checks passed
   - Status: `quality_check` → `print_ready`
   - User can proceed to print production

**Success Criteria:**
- Overall quality score ≥ 0.80
- All individual checks passed
- No blocking issues
- Manuscript meets print standards

**Blocking Conditions:**
- Cannot proceed to print if quality check fails
- Must address all critical issues
- Must re-run quality check after changes

---

### 2.7 Print Production

**Goal:** Generate print-ready PDF and order physical book

**Steps:**

1. **Generate Print PDF**
   - Click "Generate Print PDF"
   - Select print specifications:
     - Trim size: 6x9, 7x10, or 8.5x11
     - Binding: Hardcover or Paperback
     - Paper type: White or Cream
     - Cover finish: Matte or Glossy
   - Click "Generate PDF"
   - System generates print-ready PDF:
     - Applies typography
     - Places photos
     - Adds page numbers
     - Creates table of contents
     - Generates cover
   - Progress indicator: "Generating PDF... 5-10 minutes"

2. **Review PDF**
   - PDF preview displayed
   - User can download and review
   - Options:
     - "Approve for Print"
     - "Request Changes"

3. **Order Print**
   - Click "Order Print"
   - Select print service:
     - Blurb
     - Lulu
     - IngramSpark
   - Enter quantity
   - Enter shipping address
   - Review cost estimate
   - Click "Place Order"

4. **Print Job Submitted**
   - Order submitted to print service
   - Status: `print_ready` → `printing`
   - Tracking information provided
   - Email notifications for status updates

5. **Book Delivered**
   - Book arrives at shipping address
   - Status: `printing` → `completed`
   - User receives completion notification
   - Project marked as completed

**Success Criteria:**
- PDF meets print service specifications
- All photos meet resolution requirements
- Typography is professionally formatted
- Book successfully printed and delivered

---

## 3. Family Memoir Workflow

### 3.1 Project Setup (Family Memoir)

**Goal:** Create Family Memoir project with multiple narrators

**Steps:**

1. **Create Project**
   - User creates account and logs in
   - Click "Create New Memoir"
   - Select "Family Memoir (Our Story)"
   - Enter project details:
     - Title: "The Smith Family Story"
     - Description: "Our family history from multiple perspectives"
     - Target page count: 400
     - Target chapter count: 25
   - Click "Create Project"

2. **Invite Co-Narrators**
   - Click "Invite Co-Narrators"
   - Enter email addresses for family members
   - Each receives invitation
   - Role: "Co-Narrator"
   - Permissions:
     - ✅ Can add memories
     - ✅ Can edit own memories
     - ✅ Can approve own chapters
     - ✅ Independent voice calibration
     - ❌ Cannot edit others' prose

3. **Co-Narrators Accept**
   - Each co-narrator receives invitation
   - Creates account or logs in
   - Accepts invitation
   - Gains co-narrator access

**Success Criteria:**
- Project created with `family_memoir` type
- Multiple co-narrators invited and accepted
- Each co-narrator has independent authorship rights

---

### 3.2 Voice Calibration (Each Co-Narrator)

**Goal:** Each narrator establishes their unique voice

**Steps:**

1. **Independent Calibration**
   - Each co-narrator completes voice calibration separately
   - Same process as Individual Memoir:
     - Writing sample (500-1000 words)
     - Voice recording (3-5 minutes)
   - Each narrator gets unique voice profile

2. **Voice Profiles Created**
   - System creates separate voice profile for each narrator
   - Each profile constrains that narrator's prose only
   - Voices remain distinct in final manuscript

**Success Criteria:**
- Each co-narrator has completed voice calibration
- Each has unique voice profile
- Profiles are independent and distinct

---

### 3.3 Memory Capture (Family Memoir)

**Goal:** Each narrator adds memories from their perspective

**Steps:**

1. **Independent Memory Capture**
   - Each co-narrator adds memories independently
   - Same process as Individual Memoir
   - Memories tagged with narrator ID
   - Timeline anchors may overlap (same events, different perspectives)

2. **Perspective Differences**
   - System detects when multiple narrators describe same event
   - Flags as "Perspective Difference" (not conflict)
   - Both perspectives preserved
   - User notified: "Dad also has a memory from this time period"

3. **Shared Timeline**
   - System builds shared family timeline
   - Events from all narrators displayed
   - Color-coded by narrator
   - Overlapping events clearly marked

**Success Criteria:**
- Each narrator contributes memories
- Perspectives are preserved, not merged
- Shared timeline constructed
- Perspective differences flagged but not resolved

---

### 3.4 Chapter Generation (Family Memoir)

**Goal:** Generate chapters with multiple distinct voices

**Steps:**

1. **Chapter Structure**
   - Chapters organized by time period or theme
   - Each narrator's perspective clearly labeled
   - Voices never merged
   - Example structure:
     - Chapter 5: "Summer 1985"
       - Dad's Perspective
       - Mom's Perspective
       - Sister's Perspective

2. **Generate Multi-Voice Chapter**
   - System assembles chapter from multiple narrators
   - Each section maintains narrator's voice
   - Clear labels: "Dad remembers..." "Mom's perspective..."
   - Transitions between perspectives

3. **Perspective Conflicts**
   - When memories conflict (different dates, different details):
     - System flags conflict
     - Both versions included
     - Labeled as perspective differences
     - Example: "Dad remembers this happening in summer, while Mom recalls it was fall"

4. **Individual Approval**
   - Each narrator approves their own sections
   - Cannot approve others' sections
   - Chapter fully approved when all narrators approve their parts

**Success Criteria:**
- Multiple voices clearly distinguished
- Each narrator's voice preserved
- Conflicts flagged but not auto-resolved
- All narrators approve their sections

---

## 4. Common Workflows

### 4.1 Adding More Memories

**Trigger:** User wants to add more content to existing project

**Steps:**

1. Navigate to "Memories" tab
2. Click "Add Memory"
3. Follow memory capture process
4. System re-evaluates chapter readiness
5. Notifications if new chapters become ready

**Use Cases:**
- Initial memory capture incomplete
- Quality check reveals thin chapters
- User remembers additional stories
- Collaborator suggests missing content

---

### 4.2 Editing Existing Memories

**Trigger:** User wants to correct or enhance existing memory

**Steps:**

1. Navigate to "Memories" tab
2. Find memory to edit
3. Click "Edit"
4. Modify content
5. Click "Save Changes"
6. System re-processes memory (tags, timeline)
7. If memory used in chapter, chapter marked for review

**Constraints:**
- Can only edit own memories
- If memory used in approved chapter, warning displayed
- Chapter may need regeneration

---

### 4.3 Regenerating Chapters

**Trigger:** User unsatisfied with generated chapter

**Steps:**

1. Navigate to chapter
2. Click "Regenerate"
3. Optionally provide feedback
4. System generates new version
5. Previous version saved (can revert)
6. Review new version

**Use Cases:**
- Voice doesn't sound right
- Missing important details
- Too short or too long
- Quality issues detected

---

### 4.4 Unlocking Approved Chapters

**Trigger:** User needs to modify approved chapter

**Steps:**

1. Navigate to approved chapter
2. Click "Unlock Chapter"
3. Confirmation: "This will change chapter status to draft"
4. Click "Confirm"
5. Status: `approved` → `draft`
6. Make changes
7. Re-approve when done

**Constraints:**
- Unlocking triggers quality re-check
- May affect manuscript print-readiness
- Must re-approve before print

---

### 4.5 Exporting Draft

**Trigger:** User wants to review manuscript outside platform

**Steps:**

1. Navigate to "Manuscript" tab
2. Click "Export Draft"
3. Select format:
   - PDF (reading copy, not print-ready)
   - DOCX (editable)
   - TXT (plain text)
4. Click "Generate Export"
5. Download file

**Use Cases:**
- Share with family for review
- Read on different device
- Backup copy
- External editing (not recommended)

---

## 5. Error Handling & Edge Cases

### 5.1 Insufficient Memory Fragments

**Scenario:** User tries to generate chapter without enough fragments

**System Response:**
- Block generation
- Display message: "Chapter 3 needs 3 more memory fragments"
- Show recommendations:
  - "Add memories about your teenage years"
  - "Include more sensory details"
  - "Describe specific moments from this period"
- Provide "Add Memory" button

---

### 5.2 Quality Check Failure

**Scenario:** Manuscript fails quality gates

**System Response:**
- Block print production
- Display detailed quality report
- Highlight specific issues
- Provide actionable recommendations
- Options:
  - Add more content
  - Regenerate chapters
  - Edit directly
- Must re-run quality check after changes

---

### 5.3 Voice Calibration Incomplete

**Scenario:** User tries to skip voice calibration

**System Response:**
- Block memory capture and chapter generation
- Display message: "Voice calibration required"
- Explain importance: "This ensures the book sounds like you"
- Redirect to voice calibration

---

### 5.4 Collaborator Permission Conflict

**Scenario:** Collaborator tries to edit prose directly

**System Response:**
- Block action
- Display message: "You can provide feedback, but cannot edit prose directly"
- Offer alternative: "Submit a correction or suggestion instead"
- Redirect to feedback form

---

### 5.5 Photo Resolution Too Low

**Scenario:** User uploads low-resolution photo

**System Response:**
- Accept upload but flag issue
- Display warning: "This photo may not print clearly (current: 150 DPI, required: 300 DPI)"
- Options:
  - Upload higher resolution version
  - Use for digital only
  - Proceed anyway (with quality warning)

---

## 6. Notification System

### 6.1 Email Notifications

**Triggers:**
- Project invitation received
- Collaborator accepted invitation
- New feedback submitted
- Chapter ready to generate
- Quality check completed
- Print job status updates
- Book delivered

### 6.2 In-App Notifications

**Triggers:**
- Memory processing complete
- Chapter generation complete
- Quality issue detected
- Collaborator activity
- Milestone reached (e.g., "10 chapters approved!")

### 6.3 Progress Notifications

**Triggers:**
- 25% complete
- 50% complete
- 75% complete
- All chapters approved
- Print-ready

---

## 7. Workflow State Transitions

### 7.1 Project Status Flow

```
setup → calibrating → collecting → assembling → reviewing → quality_check → print_ready → printing → completed
```

**Transitions:**
- `setup` → `calibrating`: Project created
- `calibrating` → `collecting`: Voice profile completed
- `collecting` → `assembling`: First chapter generated
- `assembling` → `reviewing`: All chapters drafted
- `reviewing` → `quality_check`: All chapters approved
- `quality_check` → `print_ready`: Quality gates passed
- `print_ready` → `printing`: Print job submitted
- `printing` → `completed`: Book delivered

### 7.2 Chapter Status Flow

```
insufficient → ready → generating → draft → validated → approved
```

**Transitions:**
- `insufficient` → `ready`: Minimum fragments added
- `ready` → `generating`: User initiates generation
- `generating` → `draft`: Generation complete
- `draft` → `validated`: Quality checks passed
- `validated` → `approved`: User approves chapter

### 7.3 Memory Fragment Status Flow

```
raw → processing → processed → validated → used
```

**Transitions:**
- `raw` → `processing`: Fragment submitted
- `processing` → `processed`: Tagging complete
- `processed` → `validated`: User reviews and confirms
- `validated` → `used`: Included in chapter

---

## 8. Success Metrics

### 8.1 User Success Indicators

- **Completion Rate:** % of projects that reach `completed` status
- **Time to First Chapter:** Days from project creation to first chapter generated
- **Time to Completion:** Days from project creation to book delivered
- **Quality Pass Rate:** % of manuscripts that pass quality gates on first attempt
- **User Satisfaction:** Rating of final book quality

### 8.2 Engagement Metrics

- **Memories per Project:** Average number of memory fragments
- **Collaboration Rate:** % of projects with active collaborators
- **Regeneration Rate:** % of chapters regenerated before approval
- **Feedback Volume:** Average feedback items per project

---

## 9. Workflow Optimization

### 9.1 Guided Onboarding

- Interactive tutorial for first-time users
- Step-by-step guidance through voice calibration
- Example memories to inspire users
- Progress checklist visible throughout

### 9.2 Smart Prompts

- Context-aware prompts based on existing memories
- Suggestions for underrepresented life stages
- Reminders for sensory details
- Timeline gap identification

### 9.3 Batch Operations

- Generate multiple chapters at once
- Bulk approve chapters
- Batch export memories
- Mass photo upload

---

## 10. Workflow Constraints

### 10.1 Sequential Requirements

**Must Complete in Order:**
1. Voice calibration before memory capture
2. Minimum fragments before chapter generation
3. All chapters approved before quality check
4. Quality gates passed before print production

### 10.2 Blocking Conditions

**Cannot Proceed If:**
- Voice profile incomplete
- Insufficient memory fragments
- Quality check failed
- Print specifications invalid
- Payment not processed

### 10.3 Reversible Actions

**Can Undo:**
- Chapter approval (unlock)
- Memory deletion (archive instead)
- Collaborator invitation (revoke)
- Manuscript version (revert)

**Cannot Undo:**
- Print job submission (once sent to printer)
- Project deletion (permanent)
- Voice profile (must recalibrate)

---

## Document Authority

This workflow documentation is derived from and subordinate to:
1. [`Digital_Memoir_Platform_Concept_and_Scope.pdf`](Digital_Memoir_Platform_Concept_and_Scope.pdf) (authoritative vision)
2. [`Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf`](Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf) (authoritative exclusions)
3. [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md) (project scope)

All workflows must align with the print-first, quality-enforced, voice-preserved principles established in these documents.
