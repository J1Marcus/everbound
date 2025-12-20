# Digital Memoir Platform - Technical Implementation Guide

**Version:** 2.0
**Last Updated:** 2025-12-19
**Status:** Current Implementation

> **✅ CURRENT IMPLEMENTATION:** This project uses **Supabase** with a **Progressive Web App (PWA)** frontend.
>
> **Architecture Overview:**
> - **Frontend**: React + TypeScript + Vite (Progressive Web App)
> - **Database**: PostgreSQL with RLS policies (Supabase)
> - **API**: PostgREST auto-generated + Edge Functions
> - **Auth**: GoTrue built-in (Supabase Auth)
> - **Storage**: Supabase Storage API
> - **Platform**: PWA (installable on mobile and desktop)
>
> **Key Implementation Approach:**
> - Business logic in Edge Functions (Deno/TypeScript)
> - Database functions and triggers for automated workflows
> - RLS policies for security at database level
> - Frontend uses Supabase client for direct database access
> - Mobile-first responsive design
> - Offline capability via service workers
>
> **Related Documentation:**
> - [`SUPABASE_ARCHITECTURE.md`](SUPABASE_ARCHITECTURE.md) - Backend architecture
> - [`PWA_IMPLEMENTATION.md`](PWA_IMPLEMENTATION.md) - PWA features and setup
> - [`MOBILE_OPTIMIZATION.md`](MOBILE_OPTIMIZATION.md) - Mobile UI optimizations

## Document Purpose

This document provides technical implementation guidance for the Digital Memoir Platform, focusing on the Progressive Web App frontend and Supabase backend integration. For detailed backend architecture, see [`SUPABASE_ARCHITECTURE.md`](SUPABASE_ARCHITECTURE.md).

---

## 1. Implementation Overview

### 1.1 Development Principles

1. **Print-First Implementation:** Every feature must support print outcome
2. **Mobile-First Design:** Optimized for mobile devices, enhanced for desktop
3. **Progressive Enhancement:** Core features work everywhere, enhanced features where supported
4. **Quality-First Development:** Never compromise narrative quality for speed
5. **Voice Preservation:** Maintain narrator authenticity throughout
6. **Assembly-Based Architecture:** Build systems for component assembly, not direct generation
7. **Blocking Quality Gates:** Enforce quality standards without bypass options

### 1.2 Technology Stack

**Frontend (Progressive Web App):**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite 5+
- **UI Library:** Tailwind CSS with custom design system
- **State Management:** Zustand
- **Supabase Client:** @supabase/supabase-js
- **PWA Features:**
  - Service Worker for offline support
  - Web App Manifest for installation
  - Cache API for asset caching
  - IndexedDB for offline data storage

**Backend (Supabase):**
- **Database:** PostgreSQL 15+ (via Supabase)
- **API:** PostgREST (auto-generated from schema)
- **Auth:** GoTrue (built into Supabase)
- **Functions:** Edge Functions (Deno/TypeScript)
- **Storage:** Supabase Storage (S3-compatible)
- **Real-time:** Supabase Realtime

**AI/ML (in Edge Functions):**
- **LLM:** OpenAI GPT-4, Anthropic Claude
- **NLP:** Call external APIs from Edge Functions
- **Speech-to-Text:** OpenAI Whisper API

**Infrastructure:**
- **Development:** Local Supabase via Docker Compose
- **Production:** Supabase Cloud or self-hosted
- **Deployment:** Vercel, Netlify, or static hosting with HTTPS
- **Monitoring:** Supabase Analytics + custom logging

### 1.3 Progressive Web App Features

**Implemented:**
- ✅ Web App Manifest with 8 icon sizes
- ✅ Service Worker with offline support
- ✅ Install prompt component
- ✅ Mobile-first responsive design
- ✅ Touch-optimized interactions
- ✅ Bottom sheet modals for mobile
- ✅ Mobile bottom navigation

**Planned:**
- 🔄 Push notifications
- 🔄 Background sync
- 🔄 Advanced offline editing
- 🔄 Share target API
- 🔄 App shortcuts

**See:** [`PWA_IMPLEMENTATION.md`](PWA_IMPLEMENTATION.md) for complete PWA documentation

---

## 2. Database Implementation

### 2.1 Schema Setup

**PostgreSQL Extensions:**
```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable JSONB operations
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

**Indexes for Performance:**
```sql
-- Memory fragments
CREATE INDEX idx_memory_fragments_project_narrator 
ON memory_fragments(project_id, narrator_id);

CREATE INDEX idx_memory_fragments_tags_gin 
ON memory_fragments USING GIN (tags);

CREATE INDEX idx_memory_fragments_life_stage 
ON memory_fragments ((tags->>'life_stage'));

CREATE INDEX idx_memory_fragments_status 
ON memory_fragments(status) WHERE status IN ('processed', 'validated');

-- Chapters
CREATE INDEX idx_chapters_project_status 
ON chapters(project_id, status);

CREATE INDEX idx_chapters_manuscript 
ON chapters(manuscript_id) WHERE manuscript_id IS NOT NULL;

-- Full-text search on content
CREATE INDEX idx_memory_fragments_content_fts 
ON memory_fragments USING GIN (to_tsvector('english', processed_content));
```

### 2.2 Data Partitioning

**For Large Deployments:**
```sql
-- Partition memory_fragments by project_id
CREATE TABLE memory_fragments (
    id UUID DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    -- other columns
) PARTITION BY HASH (project_id);

-- Create partitions
CREATE TABLE memory_fragments_p0 PARTITION OF memory_fragments
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE memory_fragments_p1 PARTITION OF memory_fragments
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE memory_fragments_p2 PARTITION OF memory_fragments
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE memory_fragments_p3 PARTITION OF memory_fragments
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

### 2.3 Database Migrations

**Migration Strategy:**
- Use Alembic (Python) or TypeORM (Node.js)
- Version control all migrations
- Test migrations on staging before production
- Maintain rollback scripts

**Example Migration:**
```python
# alembic/versions/001_create_projects.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

def upgrade():
    op.create_table(
        'projects',
        sa.Column('id', UUID, primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('owner_id', UUID, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('book_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='setup'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now())
    )
    
    op.create_index('idx_projects_owner_id', 'projects', ['owner_id'])
    op.create_index('idx_projects_status', 'projects', ['status'])

def downgrade():
    op.drop_table('projects')
```

---

## 3. API Implementation

### 3.1 API Structure

**FastAPI Example:**
```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="Digital Memoir Platform API", version="1.0")
security = HTTPBearer()

# Models
class ProjectCreate(BaseModel):
    book_type: str
    title: str
    subtitle: Optional[str] = None
    target_page_count: int = 300
    target_chapter_count: int = 20
    trim_size: str = "6x9"

class ProjectResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    book_type: str
    title: str
    status: str
    created_at: str

# Dependencies
async def get_current_user(token: str = Depends(security)):
    # Verify JWT token and return user
    user = verify_token(token.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user

# Endpoints
@app.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(
    project: ProjectCreate,
    current_user = Depends(get_current_user)
):
    # Validate book type
    if project.book_type not in ['individual_memoir', 'family_memoir']:
        raise HTTPException(status_code=400, detail="Invalid book type")
    
    # Create project
    new_project = await db.projects.create({
        "owner_id": current_user.id,
        "book_type": project.book_type,
        "title": project.title,
        "subtitle": project.subtitle,
        "status": "setup",
        "target_page_count": project.target_page_count,
        "target_chapter_count": project.target_chapter_count,
        "trim_size": project.trim_size
    })
    
    return new_project
```

### 3.2 Authentication Implementation

**JWT Token Generation:**
```python
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key"  # Use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
```

### 3.3 Error Handling

**Standardized Error Responses:**
```python
from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: dict = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": request.state.request_id
            }
        }
    )

# Usage
if not project:
    raise AppException(
        code="PROJECT_NOT_FOUND",
        message="Project not found",
        status_code=404,
        details={"project_id": project_id}
    )
```

---

## 4. Voice Profile Implementation

### 4.1 Voice Analysis Service

**Voice Characteristic Extraction:**
```python
import spacy
from collections import Counter
import numpy as np

nlp = spacy.load("en_core_web_lg")

class VoiceAnalyzer:
    def analyze_writing_sample(self, text: str) -> dict:
        """
        Analyze writing sample to extract voice characteristics
        """
        doc = nlp(text)
        
        # Sentence analysis
        sentences = list(doc.sents)
        sentence_lengths = [len(sent) for sent in sentences]
        
        # Calculate sentence statistics
        avg_sentence_length = np.mean(sentence_lengths)
        sentence_complexity = self._analyze_complexity(sentences)
        
        # Vocabulary analysis
        words = [token.text.lower() for token in doc if token.is_alpha]
        unique_words = set(words)
        vocabulary_range = len(unique_words) / len(words) if words else 0
        
        # Formality analysis
        formality_level = self._analyze_formality(doc)
        
        # Emotional expression
        emotional_expression = self._analyze_emotion(doc)
        
        # Punctuation patterns
        punctuation_patterns = self._analyze_punctuation(text)
        
        return {
            "avg_sentence_length": avg_sentence_length,
            "sentence_complexity": sentence_complexity,
            "formality_level": formality_level,
            "emotional_expression": emotional_expression,
            "vocabulary_range": vocabulary_range,
            "punctuation_patterns": punctuation_patterns
        }
    
    def _analyze_complexity(self, sentences) -> str:
        """
        Determine sentence complexity (simple, compound, complex)
        """
        complexity_scores = []
        for sent in sentences:
            # Count clauses, conjunctions, subordinating conjunctions
            clauses = len([token for token in sent if token.dep_ == "ROOT"])
            conjunctions = len([token for token in sent if token.pos_ in ["CCONJ", "SCONJ"]])
            score = clauses + conjunctions
            complexity_scores.append(score)
        
        avg_complexity = np.mean(complexity_scores)
        
        if avg_complexity < 1.5:
            return "simple"
        elif avg_complexity < 2.5:
            return "moderate"
        else:
            return "complex"
    
    def _analyze_formality(self, doc) -> str:
        """
        Determine formality level
        """
        # Check for contractions, colloquialisms, formal vocabulary
        contractions = len([token for token in doc if "'" in token.text])
        formal_words = len([token for token in doc if token.text.lower() in FORMAL_VOCABULARY])
        
        formality_score = (formal_words - contractions) / len(doc)
        
        if formality_score < -0.1:
            return "casual"
        elif formality_score < 0.1:
            return "conversational"
        else:
            return "formal"
    
    def _analyze_emotion(self, doc) -> str:
        """
        Analyze emotional expression level
        """
        # Use sentiment analysis or emotion detection model
        # Placeholder implementation
        emotional_words = len([token for token in doc if token.text.lower() in EMOTIONAL_VOCABULARY])
        emotion_score = emotional_words / len(doc)
        
        if emotion_score < 0.05:
            return "reserved"
        elif emotion_score < 0.15:
            return "moderate"
        else:
            return "expressive"
    
    def _analyze_punctuation(self, text: str) -> dict:
        """
        Analyze punctuation usage patterns
        """
        punctuation_counts = Counter(char for char in text if char in ",.!?;:-—")
        total_sentences = text.count('.') + text.count('!') + text.count('?')
        
        return {
            "comma_frequency": punctuation_counts[','] / total_sentences if total_sentences else 0,
            "dash_usage": (punctuation_counts['-'] + punctuation_counts['—']) / total_sentences if total_sentences else 0,
            "exclamation_usage": punctuation_counts['!'] / total_sentences if total_sentences else 0
        }
```

### 4.2 Voice Constraint Application

**Constrained Generation:**
```python
class VoiceConstrainedGenerator:
    def __init__(self, voice_profile: dict, llm_client):
        self.voice_profile = voice_profile
        self.llm = llm_client
    
    def generate_prose(self, fragments: list, component_type: str) -> str:
        """
        Generate prose constrained by voice profile
        """
        # Build prompt with voice constraints
        prompt = self._build_constrained_prompt(fragments, component_type)
        
        # Generate with LLM
        response = self.llm.generate(
            prompt=prompt,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Validate voice consistency
        generated_text = response.text
        if not self._validate_voice_consistency(generated_text):
            # Regenerate with stricter constraints
            generated_text = self._regenerate_with_stricter_constraints(fragments, component_type)
        
        return generated_text
    
    def _build_constrained_prompt(self, fragments: list, component_type: str) -> str:
        """
        Build prompt with voice constraints
        """
        voice_instructions = self._voice_profile_to_instructions()
        
        prompt = f"""
You are writing a {component_type} for a memoir. The narrator has a specific voice that must be preserved.

Voice Characteristics:
{voice_instructions}

Source Memories:
{self._format_fragments(fragments)}

Write a {component_type} that:
1. Maintains the narrator's voice characteristics
2. Uses the narrator's typical sentence length and complexity
3. Matches the narrator's formality level
4. Reflects the narrator's emotional expression style
5. Incorporates sensory details from the memories
6. Feels authentic to the narrator

{component_type.title()}:
"""
        return prompt
    
    def _voice_profile_to_instructions(self) -> str:
        """
        Convert voice profile to natural language instructions
        """
        vp = self.voice_profile
        
        instructions = []
        
        # Sentence length
        if vp['avg_sentence_length'] < 15:
            instructions.append("- Use short, concise sentences (average 10-15 words)")
        elif vp['avg_sentence_length'] < 25:
            instructions.append("- Use moderate-length sentences (average 15-25 words)")
        else:
            instructions.append("- Use longer, more elaborate sentences (average 25+ words)")
        
        # Complexity
        instructions.append(f"- Sentence complexity: {vp['sentence_complexity']}")
        
        # Formality
        instructions.append(f"- Formality level: {vp['formality_level']}")
        
        # Emotional expression
        instructions.append(f"- Emotional expression: {vp['emotional_expression']}")
        
        return "\n".join(instructions)
    
    def _validate_voice_consistency(self, text: str) -> bool:
        """
        Validate generated text matches voice profile
        """
        analyzer = VoiceAnalyzer()
        generated_characteristics = analyzer.analyze_writing_sample(text)
        
        # Check sentence length
        length_diff = abs(generated_characteristics['avg_sentence_length'] - 
                         self.voice_profile['avg_sentence_length'])
        if length_diff > 5:  # Allow 5-word variance
            return False
        
        # Check complexity
        if generated_characteristics['sentence_complexity'] != self.voice_profile['sentence_complexity']:
            return False
        
        # Check formality
        if generated_characteristics['formality_level'] != self.voice_profile['formality_level']:
            return False
        
        return True
```

---

## 5. Memory Fragment Processing

### 5.1 Tagging Engine Implementation

**Automatic Tagging:**
```python
from transformers import pipeline
import spacy

class MemoryTagger:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_lg")
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.emotion_classifier = pipeline("text-classification", 
                                          model="j-hartmann/emotion-english-distilroberta-base")
    
    async def tag_memory(self, fragment: dict) -> dict:
        """
        Automatically tag memory fragment
        """
        content = fragment['processed_content']
        doc = self.nlp(content)
        
        tags = {
            "life_stage": self._detect_life_stage(content, fragment.get('metadata', {})),
            "themes": self._extract_themes(doc),
            "emotional_tone": self._analyze_emotional_tone(content),
            "key_people": self._extract_people(doc),
            "timeline_confidence": self._assess_timeline_confidence(fragment.get('metadata', {})),
            "narrative_potential": self._assess_narrative_potential(content)
        }
        
        return tags
    
    def _detect_life_stage(self, content: str, metadata: dict) -> str:
        """
        Detect life stage from content and metadata
        """
        # Check metadata first
        if 'timeline_anchor' in metadata:
            anchor = metadata['timeline_anchor']
            if anchor.get('type') == 'life_stage':
                return anchor['value']
            elif anchor.get('type') == 'date':
                # Calculate age from date and birth year
                # Return appropriate life stage
                pass
        
        # Analyze content for life stage indicators
        life_stage_keywords = {
            "childhood": ["child", "kid", "elementary", "playground", "toys"],
            "adolescence": ["teenager", "high school", "puberty", "dating"],
            "young_adult": ["college", "university", "first job", "apartment"],
            "adult": ["career", "marriage", "children", "mortgage"],
            "middle_age": ["midlife", "teenagers", "aging parents"],
            "senior": ["retirement", "grandchildren", "golden years"]
        }
        
        content_lower = content.lower()
        scores = {}
        for stage, keywords in life_stage_keywords.items():
            scores[stage] = sum(1 for keyword in keywords if keyword in content_lower)
        
        return max(scores, key=scores.get) if max(scores.values()) > 0 else "unknown"
    
    def _extract_themes(self, doc) -> list:
        """
        Extract themes from content
        """
        theme_keywords = {
            "family": ["family", "mother", "father", "sibling", "parent", "child"],
            "career": ["job", "work", "career", "profession", "business"],
            "relationships": ["love", "friend", "relationship", "marriage", "partner"],
            "challenges": ["difficult", "struggle", "challenge", "overcome", "hardship"],
            "achievements": ["success", "achievement", "accomplish", "proud", "win"],
            "loss": ["loss", "death", "grief", "mourning", "passed away"],
            "joy": ["happy", "joy", "celebration", "laughter", "fun"],
            "home": ["house", "home", "neighborhood", "town", "city"],
            "travel": ["travel", "trip", "journey", "vacation", "visit"]
        }
        
        content_lower = doc.text.lower()
        detected_themes = []
        
        for theme, keywords in theme_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                detected_themes.append(theme)
        
        return detected_themes[:5]  # Return top 5 themes
    
    def _analyze_emotional_tone(self, content: str) -> str:
        """
        Analyze emotional tone of content
        """
        # Use emotion classification model
        emotions = self.emotion_classifier(content[:512])  # Limit to 512 tokens
        top_emotion = max(emotions, key=lambda x: x['score'])
        
        # Map to simplified emotional tones
        emotion_mapping = {
            "joy": "positive",
            "sadness": "negative",
            "anger": "negative",
            "fear": "negative",
            "surprise": "mixed",
            "neutral": "neutral"
        }
        
        return emotion_mapping.get(top_emotion['label'].lower(), "neutral")
    
    def _extract_people(self, doc) -> list:
        """
        Extract key people mentioned
        """
        people = []
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                people.append(ent.text)
        
        # Also check for family relationship terms
        family_terms = ["mom", "dad", "mother", "father", "sister", "brother", 
                       "grandmother", "grandfather", "aunt", "uncle", "cousin"]
        for token in doc:
            if token.text.lower() in family_terms:
                people.append(token.text)
        
        return list(set(people))[:10]  # Return up to 10 unique people
    
    def _assess_timeline_confidence(self, metadata: dict) -> str:
        """
        Assess confidence in timeline placement
        """
        if 'timeline_anchor' not in metadata:
            return "low"
        
        anchor = metadata['timeline_anchor']
        if anchor.get('type') == 'date' and anchor.get('confidence') == 'high':
            return "high"
        elif anchor.get('type') == 'life_stage':
            return "medium"
        else:
            return "low"
    
    def _assess_narrative_potential(self, content: str) -> str:
        """
        Assess narrative potential of fragment
        """
        # Check for sensory details
        sensory_words = ["saw", "heard", "smelled", "felt", "tasted", "looked", "sounded"]
        sensory_count = sum(1 for word in sensory_words if word in content.lower())
        
        # Check for specific details
        word_count = len(content.split())
        
        # Check for emotional content
        emotional_words = ["felt", "emotion", "happy", "sad", "angry", "scared", "excited"]
        emotional_count = sum(1 for word in emotional_words if word in content.lower())
        
        score = (sensory_count * 2) + (word_count / 50) + (emotional_count * 1.5)
        
        if score > 10:
            return "high"
        elif score > 5:
            return "medium"
        else:
            return "low"
```

---

## 6. Chapter Generation Implementation

### 6.1 Chapter Readiness Check

**Readiness Assessment:**
```python
class ChapterReadinessChecker:
    MINIMUM_FRAGMENTS = 5
    REQUIRED_ELEMENTS = ["scene_setting", "narrative_moment", "reflection"]
    
    async def check_readiness(self, chapter_number: int, project_id: str) -> dict:
        """
        Check if chapter is ready for generation
        """
        # Get fragments for this chapter's life stage/theme
        fragments = await self._get_relevant_fragments(chapter_number, project_id)
        
        # Check minimum fragment count
        if len(fragments) < self.MINIMUM_FRAGMENTS:
            return {
                "ready": False,
                "fragments_available": len(fragments),
                "fragments_required": self.MINIMUM_FRAGMENTS,
                "missing_elements": self._identify_missing_elements(fragments),
                "recommendations": self._generate_recommendations(fragments, chapter_number)
            }
        
        # Check for required narrative elements
        missing_elements = self._identify_missing_elements(fragments)
        
        if missing_elements:
            return {
                "ready": False,
                "fragments_available": len(fragments),
                "fragments_required": self.MINIMUM_FRAGMENTS,
                "missing_elements": missing_elements,
                "recommendations": self._generate_recommendations(fragments, chapter_number)
            }
        
        return {
            "ready": True,
            "fragments_available": len(fragments),
            "fragments_required": self.MINIMUM_FRAGMENTS,
            "missing_elements": [],
            "recommendations": ["Sufficient fragments available for generation"]
        }
    
    def _identify_missing_elements(self, fragments: list) -> list:
        """
        Identify missing narrative elements
        """
        missing = []
        
        # Check for scene-setting details
        has_scene_setting = any(
            f.get('tags', {}).get('narrative_potential') == 'high' and
            any(theme in ['home', 'location'] for theme in f.get('tags', {}).get('themes', []))
            for f in fragments
        )
        if not has_scene_setting:
            missing.append("scene_setting")
        
        # Check for specific narrative moments
        has_moments = len([f for f in fragments if f.get('tags', {}).get('narrative_potential') in ['high', 'medium']]) >= 3
        if not has_moments:
            missing.append("narrative_moments")
        
        # Check for reflective content
        has_reflection = any(
            'reflection' in f.get('processed_content', '').lower() or
            'looking back' in f.get('processed_content', '').lower()
            for f in fragments
        )
        if not has_reflection:
            missing.append("reflection")
        
        return missing
    
    def _generate_recommendations(self, fragments: list, chapter_number: int) -> list:
        """
        Generate specific recommendations for improvement
        """
        recommendations = []
        
        if len(fragments) < self.MINIMUM_FRAGMENTS:
            needed = self.MINIMUM_FRAGMENTS - len(fragments)
            recommendations.append(f"Add {needed} more memory fragments for this chapter")
        
        missing_elements = self._identify_missing_elements(fragments)
        
        if "scene_setting" in missing_elements:
            recommendations.append("Add memories with sensory details about the setting (sights, sounds, smells)")
        
        if "narrative_moments" in missing_elements:
            recommendations.append("Add specific moments or events from this period")
        
        if "reflection" in missing_elements:
            recommendations.append("Add reflective thoughts about this period from your current perspective")
        
        return recommendations
```

### 6.2 Chapter Assembly

**Assembly Process:**
```python
class ChapterAssembler:
    def __init__(self, voice_generator, quality_validator):
        self.voice_generator = voice_generator
        self.quality_validator = quality_validator
    
    async def assemble_chapter(
        self,
        chapter_id: str,
        fragment_ids: list,
        voice_profile_id: str
    ) -> dict:
        """
        Assemble chapter from fragments
        """
        # Load fragments and voice profile
        fragments = await db.memory_fragments.find_many(id__in=fragment_ids)
        voice_profile = await db.voice_profiles.find_one(id=voice_profile_id)
        
        # Generate narrative components
        components = []
        
        # 1. Scene-setting
        scene_setting = await self.voice_generator.generate_prose(
            fragments=self._filter_fragments_for_scene_setting(fragments),
            component_type="scene_setting",
            voice_profile=voice_profile
        )
        components.append({
            "type": "scene_setting",
            "content": scene_setting,
            "source_fragments": [f.id for f in fragments]
        })
        
        # 2. Narrative moments
        moment_fragments = self._filter_fragments_for_moments(fragments)
        for moment_group in self._group_moments(moment_fragments):
            moment = await self.voice_generator.generate_prose(
                fragments=moment_group,
                component_type="narrative_moment",
                voice_profile=voice_profile
            )
            components.append({
                "type": "narrative_moment",
                "content": moment,
                "source_fragments": [f.id for f in moment_group]
            })
        
        # 3. Reflection
        reflection = await self.voice_generator.generate_prose(
            fragments=self._filter_fragments_for_reflection(fragments),
            component_type="reflection",
            voice_profile=voice_profile
        )
        components.append({
            "type": "reflection",
            "content": reflection,
            "source_fragments": [f.id for f in fragments]
        })
        
        # 4. Optional lessons/values
        if self._should_include_lessons(fragments):
            lessons = await self.voice_generator.generate_prose(
                fragments=fragments,
                component_type="lesson",
                voice_profile=voice_profile
            )
            components.append({
                "type": "lesson",
                "content": lessons,
                "source_fragments": [f.id for f in fragments]
            })
        
        # Assemble full chapter
        chapter_content = self._assemble_components(components)
        
        # Validate quality
        quality_result = await self.quality_validator.validate_chapter(chapter_content)
        
        # Save chapter
        chapter = await db.chapters.update(
            id=chapter_id,
            content=chapter_content,
            component_ids=[c['id'] for c in components],
            word_count=len(chapter_content.split()),
            status="draft",
            quality_score=quality_result['score'],
            quality_issues=quality_result['issues']
        )
        
        return chapter
    
    def _assemble_components(self, components: list) -> str:
        """
        Assemble components into cohesive chapter
        """
        chapter_parts = []
        
        for component in components:
            # Add appropriate spacing and transitions
            if component['type'] == "scene_setting":
                chapter_parts.append(component['content'])
            elif component['type'] == "narrative_moment":
                # Add transition if needed
                chapter_parts.append("\n\n" + component['content'])
            elif component['type'] == "reflection":
                # Add reflective transition
                chapter_parts.append("\n\nLooking back, " + component['content'])
            elif component['type'] == "lesson":
                chapter_parts.append("\n\n" + component['content'])
        
        return "".join(chapter_parts)
```

---

## 7. Quality Gates Implementation

### 7.1 Repetition Detection

**Implementation:**