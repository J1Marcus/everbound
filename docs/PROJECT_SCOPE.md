# Digital Memoir Platform - Project Scope

**Version:** 1.1
**Last Updated:** 2025-12-19
**Status:** Authoritative

## Document Purpose

This document defines the complete project scope for the Digital Memoir Platform, derived directly from the authoritative concept and non-goals documents. All features, workflows, and technical decisions must align with the boundaries established here.

---

## 1. Executive Summary

The Digital Memoir Platform is a self-serve digital storytelling system designed to transform fragmented personal memories into cohesive, professionally structured hardcover books. The platform is delivered as a **Progressive Web App (PWA)** that works seamlessly across web browsers and mobile devices, prioritizing narrative quality, emotional coherence, and print readiness as first-class requirements.

**Primary Artifact:** Professionally printed hardcover book
**Primary Goal:** Transform memory fragments into intentionally authored narratives
**Platform Type:** Progressive Web App (installable on mobile and desktop)
**Core Constraint:** Every feature must directly contribute to narrative quality or print outcome

---

## 2. Product Vision

### 2.1 Core Purpose
Transform fragmented personal memories into cohesive, readable narratives that feel intentionally authored rather than transcribed. The end product is a professionally structured book, not a journal export or collection of dictated responses.

### 2.2 Platform Delivery
The platform is delivered as a **Progressive Web App (PWA)** providing:
- **Cross-Platform Access:** Works on iOS, Android, and desktop browsers
- **Installable Experience:** Can be installed like a native app on any device
- **Offline Capability:** Core features available without internet connection
- **Mobile-First Design:** Optimized for mobile devices while maintaining desktop functionality
- **No App Store Required:** Direct access via web browser, optional installation

### 2.3 Guiding Principles
1. **Print-First Design:** The hardcover book is the primary artifact; digital experience exists solely to enable its creation
2. **Mobile-First Approach:** Optimized for mobile capture and review, accessible anywhere
3. **Quality Over Speed:** Narrative quality and emotional coherence are never compromised for faster output
4. **Voice Preservation:** The system adapts to the narrator's voice; the narrator never adapts to the system
5. **Intentional Authorship:** Output must feel authored, not transcribed or generated
6. **Completion-Oriented:** Each project has a defined beginning and end

---

## 3. Supported Book Types

### 3.1 Individual Memoir ("My Story")

**Narrative Model:**
- Single first-person voice
- One narrator owns the narrative
- Unified perspective throughout

**Collaboration Rules:**
- Family members may contribute feedback
- Family members may provide factual corrections
- Family members may submit optional letters
- Family members cannot directly alter core prose unless explicitly approved by narrator

**Use Cases:**
- Personal life story
- Career memoir
- Coming-of-age narrative
- Life lessons and wisdom sharing

### 3.2 Family Memoir ("Our Story")

**Narrative Model:**
- Multi-narrator book with shared timeline
- Voices are never merged
- Each contributor maintains independent perspective
- Perspectives are clearly labeled in final manuscript

**Collaboration Rules:**
- Each contributor has independent prompts
- Each contributor completes voice calibration
- Each contributor has approval rights over their sections
- Conflicting memories are preserved as perspective differences
- Conflicts are flagged but not automatically resolved

**Use Cases:**
- Multi-generational family history
- Shared family experiences from different viewpoints
- Sibling perspectives on childhood
- Parent-child dual narratives

---

## 4. Narrative Construction Model

### 4.1 Assembly-Based Generation
The system does NOT generate books directly from prompts. Instead, it assembles chapters from validated narrative components.

### 4.2 Chapter Structure
Each chapter follows a consistent structure:
1. **Scene-Setting:** Establish time, place, and context
2. **Specific Narrative Moments:** Concrete events with sensory detail
3. **Reflection from Hindsight:** Looking back with perspective
4. **Optional Lessons or Values:** Extracted wisdom (when appropriate)

### 4.3 Generation Blocking
Chapter generation is blocked if insufficient material exists. This ensures:
- Every chapter meets minimum narrative depth
- Avoidance of thin or repetitive output
- Quality enforcement over speed

### 4.4 Narrative Components
Validated components include:
- Memory fragments with sensory detail
- Emotional context and tone
- Timeline anchors (dates, life stages)
- Key people and relationships
- Thematic connections
- Reflective insights

---

## 5. Input Philosophy

### 5.1 Input Format
Inputs are captured as **short, specific memory fragments** rather than long essays, optimized for mobile capture.

**Supported Input Types:**
- Short text entries (micro-narratives) - mobile-optimized input
- Voice dictation (treated as source material, not output) - mobile voice recording
- Photos with contextual prompts - mobile camera integration
- Approximate dates or life stages - mobile-friendly date pickers

### 5.2 Input Characteristics
The system favors:
- Micro-narratives anchored in sensory detail
- Specific moments over general summaries
- Emotional context and tone
- Concrete details (sights, sounds, smells, feelings)

### 5.3 Internal Tagging
Each input is internally tagged by:
- Life stage
- Theme
- Emotional tone
- Key people
- Timeline confidence

**Note:** Tags drive narrative assembly but are NOT exposed directly to users.

### 5.4 Explicit Exclusions
- Long essays or stream-of-consciousness writing
- Unstructured text dumping
- Open-ended monologues
- Daily journal entries
- Verbatim transcription output

---

## 6. Voice and Style Preservation

### 6.1 Voice Calibration Phase
Each narrator completes a voice calibration consisting of:
1. **Short unprompted writing sample:** Captures natural writing style
2. **Free-form voice recording:** Captures speech patterns and personality

### 6.2 Voice Constraints
Calibration samples are used to constrain:
- Sentence length and complexity
- Formality level
- Emotional expression patterns
- Humor and tone
- Word choice and vocabulary

### 6.3 Adaptation Model
- System adapts prose to narrator's voice
- Narrator is never expected to adapt to system
- Consistency of voice across chapters is enforced automatically
- Voice preservation is a quality gate requirement

---

## 7. Family Collaboration Model

### 7.1 Individual Memoir Collaboration
**Role:** Contextual and advisory

**Permitted Actions:**
- Provide feedback on drafts
- Submit factual corrections
- Contribute optional letters or notes
- Flag timeline inconsistencies

**Restricted Actions:**
- Cannot directly edit core prose without narrator approval
- Cannot alter narrator's voice or perspective
- Cannot override narrator's final decisions

### 7.2 Family Memoir Collaboration
**Role:** Independent co-authors

**Permitted Actions:**
- Complete independent voice calibration
- Respond to personalized prompts
- Approve/reject their own sections
- Maintain distinct perspective
- Flag conflicts with other perspectives

**System Behavior:**
- Narrative conflicts are flagged but not automatically resolved
- Perspective differences are treated as valuable narrative elements
- Each voice remains distinct and labeled
- No voice merging or perspective reconciliation

---

## 8. Automated Quality Gates

### 8.1 Pre-Print Quality Checks
Before manuscript approval for print, the system must pass:

1. **Repetition Detection**
   - Identify repeated phrases, stories, or themes
   - Flag excessive similarity between chapters
   - Ensure variety in narrative approach

2. **Timeline Coherence**
   - Validate chronological consistency
   - Flag temporal contradictions
   - Ensure life stage progression makes sense

3. **Chapter Length Validation**
   - Enforce minimum and maximum chapter lengths
   - Ensure balanced chapter distribution
   - Validate total page count targets

4. **Emotional Balance Analysis**
   - Assess emotional arc across manuscript
   - Flag excessive negativity or monotone emotion
   - Ensure narrative variety and depth

5. **Filler Language Removal**
   - Detect and remove weak prose
   - Eliminate unnecessary qualifiers
   - Strengthen passive constructions

### 8.2 Quality Enforcement Philosophy
- If quality checks fail, system requests additional input
- System never generates low-quality prose to fill gaps
- Platform never knowingly produces a weak book
- User frustration due to quality enforcement is preferable to substandard output

---

## 9. Print-First Constraints

### 9.1 Physical Print Requirements
All manuscripts are designed explicitly for physical print with:

**Page Layout:**
- Target page counts (defined per book type)
- Chapter limits (maximum chapters per book)
- Trim size awareness (standard book dimensions)
- Margin and gutter specifications

**Photo Integration:**
- Photo placement rules
- Image resolution requirements
- Caption formatting standards
- Photo-to-text ratio guidelines

**Print Workflow:**
- Compatibility with professional print services
- PDF generation with print specifications
- Color profile management
- Bleed and trim mark support

### 9.2 Completion Criteria
A manuscript that cannot be printed cleanly is considered incomplete.

**Print-Ready Checklist:**
- [ ] Meets target page count range
- [ ] All photos meet resolution requirements
- [ ] Chapter structure is print-compatible
- [ ] Typography is professionally formatted
- [ ] PDF passes print service validation
- [ ] Cover design is finalized
- [ ] ISBN and copyright page are complete

---

## 10. Explicit Non-Goals

### 10.1 What This Platform Is NOT

**Not a General Writing Tool:**
- Not a free-form writing application
- Not a daily journal or note-taking tool
- Not optimized for long essays or unstructured content
- Not a streak-based writing habit app

**Not Transcription Software:**
- Does not produce verbatim transcripts
- Raw dictation is source material, not output
- Final manuscript must never resemble lightly edited transcription

**Not an AI Novel Generator:**
- Does not generate fictionalized narratives
- Does not invent events, dialogue, or emotional states
- Does not embellish or speculate beyond provided material
- Creative interpolation limited to narrative smoothing only

**Not a Social Network:**
- Private by default
- No feeds, likes, followers, or public profiles
- No social discovery or audience building
- Sharing limited to invited collaborators and book recipients

**Not Real-Time Collaborative Editor:**
- No simultaneous live editing
- No Google Docs-style co-authoring
- Collaboration through structured contributions, not shared cursors

**Not a Genealogy Platform:**
- Does not build family trees
- Does not validate lineage
- Does not perform genealogical research
- Ancestral references appear in narrative form only

**Not a Therapeutic Tool:**
- Not positioned as mental health intervention
- Not a counseling or clinical tool
- Not designed for diagnosis or treatment

**Not an Infinite Experience:**
- Each project has defined beginning and end
- Goal is completion of finite manuscript
- No endless iteration or perpetual drafts

**Not Optimized for Speed:**
- Does not prioritize instant output
- No one-click book generation
- Quality enforcement may slow process
- Additional input required when narrative standards not met

---

## 11. Success Criteria

### 11.1 Product Success Metrics
1. **Narrative Quality:** Books feel intentionally authored, not generated
2. **Print Success Rate:** Manuscripts pass print service validation
3. **Voice Consistency:** Narrator voice is preserved throughout
4. **Completion Rate:** Users complete books rather than abandon projects
5. **Emotional Coherence:** Stories have clear emotional arcs

### 11.2 User Success Indicators
- User receives professionally printed hardcover book
- Book meets user's quality expectations
- Narrative feels authentic to user's voice
- Family members recognize and appreciate the stories
- Book becomes treasured family artifact

---

## 12. Scope Boundaries

### 12.1 In Scope
- **Progressive Web App (PWA) delivery**
- **Mobile-first user interface**
- **Offline capability for core features**
- **Cross-platform compatibility (iOS, Android, desktop)**
- Memory fragment capture and organization
- Voice calibration and preservation
- Narrative assembly from validated components
- Quality gate enforcement
- Print-ready manuscript generation
- Family collaboration (structured)
- Photo integration with context
- Timeline management
- Emotional tone analysis
- Chapter structure enforcement

### 12.2 Out of Scope
- Native mobile apps (iOS App Store, Google Play Store)
- Real-time collaborative editing
- Social sharing features
- Public publishing
- Genealogy research
- Therapeutic interventions
- Verbatim transcription
- Fictionalized content generation
- Endless iteration features
- Speed-optimized generation
- Free-form journaling

### 12.3 Explicitly Excluded
- Features that don't contribute to narrative quality or print outcome
- Any behavior that compromises voice authenticity
- Automatic resolution of perspective conflicts
- Fabrication of life events
- Public social features
- Live co-authoring capabilities
- Genealogical data structures
- Clinical or therapeutic positioning

---

## 13. Project Constraints

### 13.1 Technical Constraints
- **Must work as Progressive Web App (PWA)**
- **Must function on mobile devices (iOS, Android)**
- **Must provide offline capability for core features**
- **Must be installable without app stores**
- Must generate print-ready PDFs
- Must support professional print specifications
- Must handle photo resolution requirements
- Must maintain voice consistency across sessions
- Must scale to book-length manuscripts (200-400 pages typical)

### 13.2 Quality Constraints
- Never knowingly produce weak narrative
- Block generation when insufficient material exists
- Enforce minimum narrative depth per chapter
- Maintain emotional coherence across manuscript
- Preserve authentic voice throughout

### 13.3 User Experience Constraints
- **Mobile-first interface design**
- **Touch-optimized interactions**
- **Responsive across all screen sizes**
- **Fast loading on mobile networks**
- Favor short, specific inputs over long essays
- Guide users toward sensory detail and concrete moments
- Provide clear feedback when more input needed
- Make quality requirements transparent
- Support completion-oriented workflow

---

## 14. Stakeholder Alignment

### 14.1 Primary Stakeholders
- **Memoir Authors:** Individuals creating personal life stories
- **Family Contributors:** Relatives providing context, corrections, or perspectives
- **Print Service Providers:** Professional book printing partners
- **Platform Operators:** Team maintaining and improving the system

### 14.2 Stakeholder Needs
- **Authors Need:** Easy input methods, voice preservation, quality output
- **Contributors Need:** Clear collaboration boundaries, respect for perspective
- **Print Services Need:** Properly formatted, print-ready files
- **Operators Need:** Maintainable system, clear quality metrics, scalable architecture

---

## 15. Document Authority

This document is derived from and subordinate to:
1. `Digital_Memoir_Platform_Concept_and_Scope.pdf` (authoritative vision)
2. `Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf` (authoritative exclusions)

Any conflict between this document and the source documents should be resolved in favor of the source documents. Any feature, behavior, or assumption not explicitly supported by the source documents should be considered out of scope.

---

## 16. Change Control

Changes to this scope document require:
1. Explicit alignment with source documents
2. Review for scope creep or feature drift
3. Validation that changes support narrative quality or print outcome
4. Confirmation that changes don't introduce excluded features

**Scope Change Approval:** All scope changes must be validated against the authoritative source documents before implementation.
