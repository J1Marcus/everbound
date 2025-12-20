# Project Orientation Flow

## Overview

The Project Orientation Flow is a thoughtful, elder-friendly onboarding experience that establishes intent, audience, and boundaries before asking users to share their life stories. This approach prioritizes user safety, trust, and meaningful storytelling over technical configuration.

## Philosophy

A professional ghostwriter would never start with questions. They would start with a conversation about purpose. This flow reframes the beginning from "setup" to "orientation" — making it feel like a quiet conversation rather than configuration.

## The Six-Step Journey

### Step 1: Introduction
**Purpose**: Set expectations and build trust

**Content**:
- Explains this is a conversation, not configuration
- Reassures users about the process
- Establishes that choices can be changed at any time

**Key Message**: "Let's have a quiet conversation about the kind of book you want to create."

### Step 2: Audience Selection
**Question**: "Who is this book for?"

**Purpose**: Governs tone and topic selection throughout the memoir

**Options** (multi-select):
- ☐ My children
- ☐ My grandchildren
- ☐ Extended family
- ☐ One specific person
- ☐ Anyone in the future who wants to know me

**Why This Matters**: The intended audience fundamentally shapes how stories are told and which details are included.

### Step 3: Openness Level
**Question**: "How open do you want to be?"

**Purpose**: Handles sensitive topics ethically without asking about them directly

**Options** (single select):
- **Family-safe**: Appropriate for all ages. Some topics are summarized gently or omitted.
- **Honest but thoughtful**: Life is shared truthfully, with care for the reader.
- **Fully open**: Nothing is off-limits. This book is an honest record.

**Key Principle**: We don't ask "Did you cheat?" or "Did you experience trauma?" — we ask about openness boundaries.

**Reassurance**: "You can change this at any time."

### Step 4: Sensitive Topics
**Question**: "Are there topics you want handled carefully?"

**Purpose**: Ethical handling of trauma and difficult experiences

**Topics** (optional checkboxes):
- ☐ Relationships outside of marriage
- ☐ Loss or grief
- ☐ Illness or disability
- ☐ Conflict with family
- ☐ Mental health struggles
- ☐ Other difficult experiences

**For Each Selected Topic**:
- ○ Include fully
- ○ Include gently
- ○ Keep private (not in the book)

**Why This Works**: This is not intrusive — it's respectful. Users only specify handling for topics they want to address.

### Step 5: Reader Takeaway
**Question**: "What do you hope this book gives the reader?"

**Purpose**: Anchors meaning and becomes the emotional compass

**Format**: Open-ended text area

**Example Prompt**: "When someone finishes this book, what do you hope they understand about you?"

**This Answer Becomes**:
- The emotional compass for the entire memoir
- The tone guide for AI-generated content
- The seed for the closing chapter

**Why Ghostwriters Always Ask This**: It transforms a collection of memories into a purposeful narrative.

### Step 6: Process Explanation + Basic Info
**Purpose**: Reduce fear and collect essential project details

**Process Explanation**:
> "We'll guide you through your life in stages — beginning with where you came from, and gradually moving forward.
>
> You won't be asked to write chapters or long essays. Instead, we'll ask thoughtful questions, one at a time.
>
> As you share memories, we carefully shape them into chapters. You'll always be able to review, revise, or remove anything.
>
> This is your story. We're here to help you tell it."

**Basic Information Collected**:
- Title (required)
- Subtitle (optional)

## Technical Implementation

### Component Structure

```
ProjectOrientationFlow.tsx
├── Main wizard component with step management
├── IntroStep
├── AudienceStep
├── OpennessStep
├── SensitiveTopicsStep
├── ReaderTakeawayStep
└── ProcessExplanationStep
```

### Data Storage

All orientation preferences are stored in the `projects.metadata` JSONB column:

```json
{
  "orientation": {
    "audiences": ["children", "grandchildren"],
    "opennessLevel": "honest_thoughtful",
    "sensitiveTopics": {
      "loss_grief": "include_gently",
      "family_conflict": "keep_private",
      "relationships_outside_marriage": null,
      "illness_disability": null,
      "mental_health": null,
      "other_difficult": null
    },
    "readerTakeaway": "I hope they understand the values that guided my life and the love I had for my family..."
  }
}
```

### Integration Points

1. **CreateProjectModal**: Now uses [`ProjectOrientationFlow`](../frontend/src/components/ProjectOrientationFlow.tsx) component
2. **Database**: [`projects.metadata`](../supabase/migrations/20251220_add_project_orientation.sql) JSONB column stores all preferences
3. **Navigation**: After completion, users are directed to [`/ghostwriter/profile-setup/:projectId`](../frontend/src/pages/ghostwriter/ProfileSetupPage.tsx)

## User Experience Benefits

### Prevents Harm
- **Accidental oversharing**: Users consciously choose their boundaries
- **Family harm**: Sensitive topics are handled with explicit consent
- **Regret**: Clear expectations prevent mid-project abandonment

### Builds Trust
- **Feels protective, not extractive**: Users feel safe, not exposed
- **Respects dignity**: Especially important for elderly users
- **Professional approach**: Mirrors how real ghostwriters work

### Improves Content Quality
- **Better material**: Users share more when they feel safe
- **Purposeful narrative**: The reader takeaway guides the entire story
- **Appropriate tone**: Audience selection ensures proper voice

## Design Principles

### Language
- **Plain, conversational**: No jargon or technical terms
- **Calm and reassuring**: Reduces anxiety about the process
- **No pressure**: All choices are optional and changeable

### Visual Design
- **Progress indicator**: Shows step X of 6
- **Warm colors**: Uses amber/warm tones from design system
- **Generous spacing**: Easy to read and interact with
- **Large touch targets**: Accessible for older users

### Interaction
- **One question at a time**: Prevents overwhelm
- **Clear navigation**: Back and Continue buttons
- **Validation**: Gentle prompts for required fields
- **No dead ends**: Always a path forward

## Future Enhancements

### Potential Additions
1. **Voice input**: Allow users to speak their reader takeaway
2. **Example stories**: Show how different openness levels affect content
3. **Preview mode**: Let users see sample questions based on their choices
4. **Save and resume**: Allow users to complete orientation over multiple sessions
5. **Family input**: Let family members provide input on sensitive topics

### AI Integration
The orientation data can be used to:
- **Prompt engineering**: Adjust AI tone based on openness level
- **Content filtering**: Automatically handle sensitive topics per user preferences
- **Quality scoring**: Evaluate if generated content matches intended audience
- **Chapter synthesis**: Use reader takeaway to guide narrative arc

## Accessibility

- **Keyboard navigation**: Full keyboard support
- **Screen reader friendly**: Proper ARIA labels and semantic HTML
- **High contrast**: Meets WCAG AA standards
- **Large text**: Readable for users with vision impairment
- **Mobile responsive**: Works on tablets and phones

## Analytics Considerations

Track (anonymously):
- **Completion rate**: How many users finish all 6 steps
- **Drop-off points**: Where users abandon the flow
- **Time per step**: Which steps take longest
- **Openness distribution**: Most common openness levels chosen
- **Topic selection**: Which sensitive topics are most commonly specified

## Related Documentation

- [User Workflows](./USER_WORKFLOWS.md) - Overall user journey
- [Ghostwriter Architecture](./GHOSTWRITER_ARCHITECTURE.md) - AI-assisted memoir creation
- [Data Model](./DATA_MODEL.md) - Database schema
- [UI Design System](./UI_DESIGN_SYSTEM.md) - Visual design principles

## Conclusion

The Project Orientation Flow transforms memoir creation from a technical task into a human conversation. By establishing intent, audience, and boundaries first, we create a foundation of trust that enables users to share their stories authentically and safely.

This is not just better UX — it's ethical design that respects the vulnerability inherent in sharing one's life story.
