# Digital Memoir Platform - Collaboration Models

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document defines the complete collaboration models for the Digital Memoir Platform, ensuring family collaboration supports the narrative quality and voice preservation requirements while respecting the distinct rules for Individual and Family everbound.

---

## 1. Collaboration Overview

### 1.1 Core Principles

1. **Book Type Determines Collaboration Model:** Individual and Family everbound have fundamentally different collaboration rules
2. **Voice Preservation:** Collaboration never compromises narrator voice authenticity
3. **Structured Contributions:** No real-time co-editing; all collaboration is structured and trackable
4. **Perspective Respect:** In Family everbound, conflicting memories are preserved, not resolved
5. **Final Authority:** Clear ownership and approval rights at all times

### 1.2 Collaboration vs. Real-Time Editing

**What This Platform IS:**
- Structured feedback and correction system
- Asynchronous contribution workflow
- Approval-based change management
- Independent authorship (Family Memoir)

**What This Platform IS NOT:**
- Google Docs-style real-time co-editing
- Simultaneous live editing
- Shared cursors or inline editing
- Automatic conflict resolution

---

## 2. Individual Memoir Collaboration Model

### 2.1 Overview

**Book Type:** Individual Memoir ("My Story")  
**Narrative Model:** Single first-person voice  
**Collaboration Role:** Contextual and advisory

### 2.2 Narrator Authority

**Primary Narrator:**
- Owns the narrative
- Has final approval on all content
- Controls voice and perspective
- Cannot be overridden by collaborators

**Immutable Principle:** The narrator's voice and perspective are sacrosanct.

### 2.3 Collaborator Roles

#### 2.3.1 Contributor Role

**Permissions:**
- ✅ View draft chapters
- ✅ Provide feedback and comments
- ✅ Submit factual corrections
- ✅ Submit optional letters
- ❌ Cannot directly edit prose
- ❌ Cannot alter narrator's voice
- ❌ Cannot approve chapters

**Use Cases:**
- Spouse providing context on shared experiences
- Sibling correcting factual details
- Child adding perspective on family events
- Friend offering feedback on clarity

**Example Workflow:**
```
1. Narrator shares Chapter 5 with spouse (Contributor)
2. Spouse reads chapter about their wedding
3. Spouse submits correction: "The wedding was June 15, not June 16"
4. Narrator reviews correction
5. Narrator accepts correction
6. System updates chapter (or narrator manually edits)
7. Narrator re-approves chapter
```

#### 2.3.2 Reviewer Role

**Permissions:**
- ✅ View draft chapters
- ✅ Provide general feedback
- ❌ Cannot submit corrections
- ❌ Cannot submit letters
- ❌ Cannot edit prose

**Use Cases:**
- Editor providing professional feedback
- Friend reviewing for readability
- Family member reading for enjoyment
- Beta reader providing impressions

### 2.4 Collaboration Workflows

#### 2.4.1 Feedback Submission

**Process:**
```
1. Collaborator views chapter
2. Clicks "Add Feedback" on specific section
3. Selects feedback type:
   - Comment (general observation)
   - Correction (factual error)
   - Suggestion (improvement idea)
   - Question (clarification needed)
4. Enters feedback text
5. Submits feedback
6. Narrator receives notification
```

**Feedback Structure:**
```json
{
  "id": "uuid",
  "collaborator": "Jane Doe",
  "chapter": "Chapter 5: Our Wedding Day",
  "type": "correction",
  "content": "The wedding was June 15, not June 16",
  "status": "pending",
  "created_at": "2025-12-19T18:00:00Z"
}
```

**Narrator Response Options:**
- **Accept:** Incorporate feedback into chapter
- **Reject:** Dismiss with optional explanation
- **Respond:** Ask for clarification or discuss

#### 2.4.2 Factual Correction Workflow

**Correction Types:**
- Dates and timelines
- Names and relationships
- Locations and places
- Event details
- Factual inaccuracies

**Process:**
```
1. Collaborator identifies factual error
2. Submits correction with evidence (optional)
3. Narrator reviews correction
4. If accepted:
   - Narrator edits chapter or requests regeneration
   - Chapter status returns to "draft"
   - Must re-approve after changes
5. If rejected:
   - Narrator provides explanation
   - Original content remains
```

**Example:**
```
Correction Submitted:
Chapter: "Chapter 3: Childhood Home"
Original: "We lived at 123 Oak Street"
Correction: "We lived at 456 Maple Street"
Evidence: "I have the old address on file"
Status: Pending Narrator Review

Narrator Action: Accept
Result: Chapter updated, status → draft, requires re-approval
```

#### 2.4.3 Letter Contribution

**Purpose:** Family members can contribute optional letters that appear in the book

**Letter Types:**
- **Foreword:** Introduction by family member
- **Afterword:** Closing thoughts by family member
- **Dedication:** Dedication to/from family member
- **Standalone:** Independent letter within book

**Process:**
```
1. Collaborator clicks "Write Letter"
2. Selects letter type and placement
3. Writes letter content (500-2000 words)
4. Submits letter
5. Narrator reviews letter
6. Narrator approves or requests changes
7. If approved, letter included in manuscript
```

**Letter Structure:**
```json
{
  "id": "uuid",
  "author": "Jane Doe (Daughter)",
  "type": "afterword",
  "title": "A Daughter's Perspective",
  "content": "Reading my father's memoir has been...",
  "status": "approved",
  "placement": "afterword"
}
```

**Constraints:**
- Letters maintain author's own voice (not narrator's voice)
- Letters are clearly attributed
- Narrator has final approval
- Letters are optional, not required

### 2.5 Permission Matrix (Individual Memoir)

| Action | Narrator | Contributor | Reviewer |
|--------|----------|-------------|----------|
| Add memories | ✅ | ❌ | ❌ |
| Edit memories | ✅ | ❌ | ❌ |
| Generate chapters | ✅ | ❌ | ❌ |
| View drafts | ✅ | ✅ | ✅ |
| Provide feedback | ✅ | ✅ | ✅ |
| Submit corrections | ✅ | ✅ | ❌ |
| Submit letters | ❌ | ✅ | ❌ |
| Edit prose | ✅ | ❌ | ❌ |
| Approve chapters | ✅ | ❌ | ❌ |
| Run quality check | ✅ | ❌ | ❌ |
| Generate print PDF | ✅ | ❌ | ❌ |

### 2.6 Collaboration Boundaries

**Collaborators CANNOT:**
- Directly edit narrator's prose
- Change narrator's voice or perspective
- Override narrator's decisions
- Approve chapters on narrator's behalf
- Access narrator's voice profile
- Generate or regenerate chapters
- Alter narrative structure

**Narrator MUST:**
- Review all feedback and corrections
- Make final decisions on all changes
- Maintain voice consistency
- Approve all content before print

---

## 3. Family Memoir Collaboration Model

### 3.1 Overview

**Book Type:** Family Memoir ("Our Story")  
**Narrative Model:** Multi-narrator with shared timeline  
**Collaboration Role:** Independent co-authorship

### 3.2 Co-Narrator Model

**Key Principle:** Each co-narrator is an independent author with equal rights over their own content.

**Co-Narrator Rights:**
- Own voice profile
- Independent memory capture
- Approval rights over own sections
- Cannot edit others' sections
- Maintain distinct perspective

### 3.3 Co-Narrator Roles

#### 3.3.1 Project Owner

**Special Permissions:**
- Creates project
- Invites co-narrators
- Manages project settings
- Coordinates manuscript assembly
- Submits print jobs

**Does NOT Have:**
- Authority over others' content
- Ability to override others' approvals
- Control over others' voice profiles

#### 3.3.2 Co-Narrator

**Permissions:**
- ✅ Complete voice calibration
- ✅ Add own memories
- ✅ Edit own memories
- ✅ View own chapters
- ✅ Approve own sections
- ✅ View others' approved content
- ❌ Cannot edit others' memories
- ❌ Cannot approve others' sections
- ❌ Cannot alter others' voice

**Independence:** Each co-narrator operates independently within their own narrative space.

### 3.4 Multi-Voice Chapter Structure

**Chapter Organization:**

**Option 1: Perspective Sections**
```
Chapter 5: Summer 1985

Dad's Perspective (2,500 words)
- Scene-setting from Dad's viewpoint
- Dad's memories and reflections
- Dad's voice throughout

Mom's Perspective (2,200 words)
- Scene-setting from Mom's viewpoint
- Mom's memories and reflections
- Mom's voice throughout

Sister's Perspective (1,800 words)
- Scene-setting from Sister's viewpoint
- Sister's memories and reflections
- Sister's voice throughout
```

**Option 2: Interwoven Narrative**
```
Chapter 5: Summer 1985

Scene-Setting (Dad)
"That summer, I had just started my new job..."

The Road Trip (Mom)
"I remember packing the car that morning..."

The Destination (Sister)
"When we arrived, I couldn't believe..."

Reflection (Dad)
"Looking back, that trip changed everything..."
```

**Labeling Requirements:**
- Each section clearly attributed to narrator
- Voice transitions marked
- No voice merging or blending

### 3.5 Perspective Differences

**Core Principle:** Conflicting memories are preserved as perspective differences, not errors.

#### 3.5.1 Conflict Detection

**System Behavior:**
- Detects when multiple narrators describe same event
- Flags potential conflicts
- Does NOT automatically resolve
- Presents both perspectives

**Example Detection:**
```
Perspective Difference Detected:

Dad's Memory (Chapter 5):
"The wedding was in the summer of 1985"
Timeline: June 1985

Mom's Memory (Chapter 5):
"We got married in the fall, just as the leaves were changing"
Timeline: September 1985

System Action:
- Flag as perspective difference
- Notify both narrators
- Preserve both versions
- Include both in chapter with clear attribution
```

#### 3.5.2 Conflict Presentation

**In Manuscript:**
```
Dad remembers the wedding taking place in the summer of 1985, 
with warm sunshine and blooming flowers. Mom recalls it 
differently—she remembers the fall colors and crisp autumn air. 
Both memories capture the joy of that day, even if the season 
remains a point of loving disagreement.
```

**Conflict Types:**
- **Temporal:** Different dates or seasons
- **Factual:** Different details about same event
- **Emotional:** Different emotional tones for same event
- **Interpretive:** Different meanings or significance

**Resolution Approach:**
- Acknowledge the difference
- Present both perspectives
- Frame as enriching, not problematic
- Maintain both narrators' authenticity

### 3.6 Collaboration Workflows (Family Memoir)

#### 3.6.1 Independent Memory Capture

**Process:**
```
1. Each co-narrator adds memories independently
2. Memories tagged with narrator ID
3. System builds shared timeline
4. Overlapping events flagged (not conflicts)
5. Each narrator sees own memories + others' approved content
```

**Timeline Visualization:**
```
Shared Family Timeline:

1980 ─────────────────────────────────────────────
      │
      ├─ Dad: "Started new job" (June 1980)
      │
      ├─ Mom: "We moved to Chicago" (June 1980)
      │
1985 ─────────────────────────────────────────────
      │
      ├─ Dad: "Summer wedding" (June 1985)
      │
      ├─ Mom: "Fall wedding" (Sept 1985) ⚠️ Difference
      │
      ├─ Sister: "I was flower girl" (1985)
```

#### 3.6.2 Chapter Generation with Multiple Voices

**Process:**
```
1. System identifies time period or theme for chapter
2. Gathers memories from all relevant narrators
3. Generates sections for each narrator
4. Applies each narrator's voice profile to their section
5. Assembles multi-voice chapter
6. Each narrator reviews and approves their section
7. Chapter fully approved when all narrators approve
```

**Approval Tracking:**
```
Chapter 5: Summer 1985
Status: Partially Approved

Dad's Section: ✅ Approved (Dec 15, 2025)
Mom's Section: ⏳ Pending Review
Sister's Section: ✅ Approved (Dec 16, 2025)

Overall Status: Waiting for Mom's approval
```

#### 3.6.3 Cross-Narrator Feedback

**Permitted:**
- Co-narrators can comment on others' sections
- Can flag factual inconsistencies
- Can ask questions for clarification

**Not Permitted:**
- Cannot edit others' prose
- Cannot approve others' sections
- Cannot alter others' voice or perspective

**Example:**
```
Dad's Comment on Mom's Section:
"I remember the wedding being in summer, not fall. 
Can we discuss this difference?"

System Response:
- Flags as perspective difference
- Notifies Mom
- Mom can respond or maintain her version
- Both perspectives preserved in final chapter
```

### 3.7 Permission Matrix (Family Memoir)

| Action | Project Owner | Co-Narrator | Contributor |
|--------|---------------|-------------|-------------|
| Add own memories | ✅ | ✅ | ❌ |
| Edit own memories | ✅ | ✅ | ❌ |
| View own memories | ✅ | ✅ | ❌ |
| View others' approved content | ✅ | ✅ | ✅ |
| Edit others' memories | ❌ | ❌ | ❌ |
| Generate own chapters | ✅ | ✅ | ❌ |
| Approve own sections | ✅ | ✅ | ❌ |
| Approve others' sections | ❌ | ❌ | ❌ |
| Provide feedback | ✅ | ✅ | ✅ |
| Manage project settings | ✅ | ❌ | ❌ |
| Invite co-narrators | ✅ | ❌ | ❌ |
| Generate print PDF | ✅ | ❌ | ❌ |

### 3.8 Collaboration Boundaries (Family Memoir)

**Each Co-Narrator CANNOT:**
- Edit others' memories or prose
- Approve others' sections
- Access others' voice profiles
- Override others' decisions
- Resolve perspective conflicts unilaterally

**Each Co-Narrator CAN:**
- Maintain independent voice
- Contribute own perspective
- Flag inconsistencies
- Discuss differences
- Approve own content

**Project Owner CANNOT:**
- Override co-narrators' content decisions
- Edit co-narrators' prose without permission
- Approve on behalf of co-narrators
- Resolve conflicts unilaterally

**Project Owner CAN:**
- Coordinate manuscript assembly
- Manage project timeline
- Submit print jobs (after all approvals)
- Facilitate discussions

---

## 4. Invitation & Onboarding

### 4.1 Invitation Process

**Individual Memoir:**
```
1. Narrator clicks "Invite Collaborator"
2. Enters email address
3. Selects role: Contributor or Reviewer
4. Customizes permissions (optional)
5. Adds personal message (optional)
6. Sends invitation
```

**Family Memoir:**
```
1. Project Owner clicks "Invite Co-Narrator"
2. Enters email address
3. Role automatically set to "Co-Narrator"
4. Adds personal message (optional)
5. Sends invitation
```

### 4.2 Invitation Email

**Template:**
```
Subject: [Name] has invited you to collaborate on their memoir

Hi [Recipient],

[Name] has invited you to collaborate on their memoir project 
"[Project Title]" on the Digital Memoir Platform.

Your Role: [Contributor/Co-Narrator/Reviewer]

What you can do:
- [List of permissions]

Accept Invitation: [Link]

This invitation expires in 30 days.
```

### 4.3 Onboarding Flow

**For Contributors/Reviewers (Individual Memoir):**
```
1. Click invitation link
2. Create account or log in
3. View project overview
4. See role and permissions
5. Tutorial on providing feedback
6. Access project
```

**For Co-Narrators (Family Memoir):**
```
1. Click invitation link
2. Create account or log in
3. View project overview
4. Complete voice calibration
5. Tutorial on independent authorship
6. Start adding memories
```

---

## 5. Notification System

### 5.1 Collaboration Notifications

**Email Notifications:**
- Invitation received
- Invitation accepted
- New feedback submitted
- Feedback responded to
- Correction accepted/rejected
- Letter approved
- Chapter ready for review
- All approvals complete

**In-App Notifications:**
- Real-time collaboration activity
- Feedback status updates
- Approval requests
- Perspective conflicts flagged

### 5.2 Notification Preferences

**User Controls:**
- Email frequency (immediate, daily digest, weekly)
- Notification types (all, important only, none)
- Per-project settings
- Quiet hours

---

## 6. Conflict Resolution

### 6.1 Individual Memoir Conflicts

**Scenario:** Collaborator disagrees with narrator's content

**Resolution:**
- Collaborator submits feedback
- Narrator reviews and decides
- Narrator's decision is final
- No escalation mechanism (narrator owns narrative)

**Example:**
```
Collaborator: "I don't think that's how it happened"
Narrator: "This is my memory and perspective"
Resolution: Narrator's version remains
```

### 6.2 Family Memoir Conflicts

**Scenario:** Co-narrators have conflicting memories

**Resolution:**
- System flags perspective difference
- Both narrators notified
- Discussion encouraged (optional)
- Both perspectives preserved
- No forced resolution

**Example:**
```
Dad: "The wedding was in summer"
Mom: "The wedding was in fall"
Resolution: Both versions included with attribution
Final Text: "Dad remembers summer, Mom remembers fall"
```

### 6.3 Escalation

**No Escalation Mechanism:**
- Platform does not mediate disputes
- No arbitration or voting system
- No "correct" version determination
- Perspective differences are features, not bugs

**If Irreconcilable:**
- Co-narrators can choose to:
  - Include both perspectives
  - Omit contentious section
  - Create separate projects
- Project Owner can remove co-narrator (extreme case)

---

## 7. Privacy & Access Control

### 7.1 Content Visibility

**Individual Memoir:**
- Narrator sees all content
- Contributors see content they're invited to review
- Reviewers see content shared with them
- No public access

**Family Memoir:**
- Each co-narrator sees own content (all states)
- Each co-narrator sees others' approved content
- Each co-narrator sees others' draft content (if permitted)
- Contributors see approved content only

### 7.2 Access Revocation

**Removing Collaborator:**
```
1. Narrator/Owner clicks "Remove Collaborator"
2. Confirms action
3. Collaborator loses access immediately
4. Previous contributions remain (attributed)
5. Collaborator notified of removal
```

**Leaving Project:**
```
1. Collaborator clicks "Leave Project"
2. Confirms action
3. Loses access immediately
4. Previous contributions remain
5. Project Owner notified
```

### 7.3 Data Ownership

**Individual Memoir:**
- Narrator owns all narrative content
- Collaborators own their letters
- Feedback is project data (not owned by collaborator)

**Family Memoir:**
- Each co-narrator owns their content
- Shared ownership of compiled manuscript
- All co-narrators must approve print

---

## 8. Collaboration Best Practices

### 8.1 For Narrators (Individual Memoir)

**Do:**
- Invite trusted family members early
- Be open to factual corrections
- Consider collaborator feedback thoughtfully
- Communicate decisions clearly

**Don't:**
- Feel obligated to accept all feedback
- Compromise your voice or perspective
- Let collaborators override your narrative
- Delay decisions indefinitely

### 8.2 For Co-Narrators (Family Memoir)

**Do:**
- Complete voice calibration early
- Add memories independently
- Respect others' perspectives
- Embrace perspective differences
- Communicate about overlapping events

**Don't:**
- Try to edit others' content
- Insist on single "correct" version
- Delay approvals unnecessarily
- Compromise your own voice

### 8.3 For Contributors

**Do:**
- Provide specific, actionable feedback
- Focus on factual corrections
- Respect narrator's final authority
- Be timely with responses

**Don't:**
- Try to rewrite narrator's prose
- Insist on your perspective
- Provide vague feedback
- Expect immediate incorporation

---

## 9. Technical Implementation

### 9.1 Permission System

**Role-Based Access Control (RBAC):**
```python
class Permission:
    CAN_ADD_MEMORIES = "can_add_memories"
    CAN_EDIT_OWN_MEMORIES = "can_edit_own_memories"
    CAN_EDIT_OTHERS_MEMORIES = "can_edit_others_memories"
    CAN_VIEW_DRAFTS = "can_view_drafts"
    CAN_PROVIDE_FEEDBACK = "can_provide_feedback"
    CAN_SUBMIT_CORRECTIONS = "can_submit_corrections"
    CAN_SUBMIT_LETTERS = "can_submit_letters"
    CAN_APPROVE_CHAPTERS = "can_approve_chapters"
    CAN_GENERATE_CHAPTERS = "can_generate_chapters"
    CAN_RUN_QUALITY_CHECK = "can_run_quality_check"
    CAN_GENERATE_PDF = "can_generate_pdf"

class Role:
    NARRATOR = {
        Permission.CAN_ADD_MEMORIES,
        Permission.CAN_EDIT_OWN_MEMORIES,
        Permission.CAN_VIEW_DRAFTS,
        Permission.CAN_APPROVE_CHAPTERS,
        Permission.CAN_GENERATE_CHAPTERS,
        Permission.CAN_RUN_QUALITY_CHECK,
        Permission.CAN_GENERATE_PDF
    }
    
    CONTRIBUTOR = {
        Permission.CAN_VIEW_DRAFTS,
        Permission.CAN_PROVIDE_FEEDBACK,
        Permission.CAN_SUBMIT_CORRECTIONS,
        Permission.CAN_SUBMIT_LETTERS
    }
    
    REVIEWER = {
        Permission.CAN_VIEW_DRAFTS,
        Permission.CAN_PROVIDE_FEEDBACK
    }
    
    CO_NARRATOR = {
        Permission.CAN_ADD_MEMORIES,
        Permission.CAN_EDIT_OWN_MEMORIES,
        Permission.CAN_VIEW_DRAFTS,
        Permission.CAN_APPROVE_CHAPTERS,  # Own sections only
        Permission.CAN_GENERATE_CHAPTERS,  # Own sections only
        Permission.CAN_PROVIDE_FEEDBACK
    }
```

### 9.2 Access Control Checks

**Before Every Action:**
```python
def check_permission(user, action, resource):
    # Get user's role in project
    role = get_user_role(user, resource.project)
    
    # Check if role has permission
    if action not in role.permissions:
        raise PermissionDenied(
            f"User {user.id} does not have permission to {action}"
        )
    
    # Additional checks for co-narrators
    if role == Role.CO_NARRATOR:
        if action in [Permission.CAN_EDIT_OWN_MEMORIES]:
            if resource.narrator_id != user.id:
                raise PermissionDenied(
                    "Co-narrators can only edit their own content"
                )
    
    return True
```

### 9.3 Collaboration Event Tracking

**Audit Log:**
```json
{
  "event_id": "uuid",
  "project_id": "uuid",
  "user_id": "uuid",
  "action": "feedback_submitted",
  "target": {
    "type": "chapter",
    "id": "uuid"
  },
  "details": {
    "feedback_type": "correction",
    "content": "Date correction"
  },
  "timestamp": "2025-12-19T18:00:00Z"
}
```

---

## Document Authority

This collaboration documentation is derived from and subordinate to:
1. [`Digital_Memoir_Platform_Concept_and_Scope.pdf`](Digital_Memoir_Platform_Concept_and_Scope.pdf) (authoritative vision)
2. [`Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf`](Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf) (authoritative exclusions)
3. [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md) (project scope)

**Core Principles:**
- Individual Memoir: Contextual and advisory collaboration
- Family Memoir: Independent co-authorship with perspective preservation
- No real-time collaborative editing
- Voice preservation is non-negotiable
