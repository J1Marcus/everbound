/**
 * OpenAI Client Utilities
 * GPT-4 and GPT-4 Vision integration for Edge Functions
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | MessageContent[]
}

export interface MessageContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
    detail?: 'low' | 'high' | 'auto'
  }
}

export interface OpenAIOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' | 'text' }
}

export interface PhotoAnalysis {
  people_detected: Array<{
    position: string
    estimated_age?: string
    gender?: string
    description: string
    user_identified_as?: string
  }>
  setting: {
    type: string
    location_type?: string
    time_period?: string
    season?: string
    weather?: string
  }
  objects: string[]
  mood: string
  emotions: string[]
  time_period_indicators: string[]
  suggestions: string[]
}

export interface MemoryEnhancement {
  enhanced_content: string
  improvements: string[]
  sensory_details_added: string[]
  emotional_depth_added: string[]
}

export interface SectionSynthesis {
  preview_content: string
  word_count: number
  quality_feedback: {
    strengths: string[]
    suggestions: string[]
    missing_elements: string[]
  }
  photo_placements: Array<{
    photo_id: string
    suggested_position: string
    caption_suggestion: string
  }>
}

/**
 * Call OpenAI Chat Completion API
 */
export async function callOpenAI(
  messages: OpenAIMessage[],
  options: OpenAIOptions = {}
): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      response_format: options.response_format,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Analyze photo with GPT-4 Vision
 */
export async function analyzePhoto(
  photoUrl: string,
  userContext?: string
): Promise<PhotoAnalysis> {
  const systemPrompt = `You are an expert photo analyst helping to create a memoir. Analyze photos to extract:
1. People in the photo (position, age, appearance, expressions)
2. Setting and environment (indoor/outdoor, location type, time period)
3. Objects and items visible
4. Mood and emotional tone
5. Time period indicators (clothing, cars, architecture, photo quality)
6. Suggestions for memory prompts based on what you see

Return your analysis as valid JSON matching this structure:
{
  "people_detected": [{"position": "center", "estimated_age": "30-35", "gender": "female", "description": "..."}],
  "setting": {"type": "outdoor", "location_type": "beach", "time_period": "1970s", "season": "summer", "weather": "sunny"},
  "objects": ["beach umbrella", "picnic basket"],
  "mood": "joyful, relaxed",
  "emotions": ["happiness", "contentment"],
  "time_period_indicators": ["vintage clothing", "photo quality"],
  "suggestions": ["Ask about this day at the beach", "Who took this photo?"]
}`

  const userPrompt = userContext 
    ? `Analyze this photo. User context: ${userContext}`
    : 'Analyze this photo in detail.'

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: photoUrl, detail: 'high' } }
      ]
    }
  ]

  const result = await callOpenAI(messages, {
    model: 'gpt-4-vision-preview',
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  })

  return JSON.parse(result)
}

/**
 * Enhance memory text with photo analysis
 */
export async function enhanceMemoryWithPhoto(
  originalText: string,
  photoAnalysis: PhotoAnalysis,
  voiceProfile?: any
): Promise<MemoryEnhancement> {
  const systemPrompt = `You are a professional ghostwriter helping enhance memoir text. 
Given the user's original memory text and photo analysis, enrich the text with:
1. Visual details from the photo (what people looked like, what they wore)
2. Sensory details (implied sounds, smells, textures)
3. Emotional depth (feelings suggested by expressions and context)
4. Specific details over generic descriptions

CRITICAL: Maintain the user's voice and perspective. Only add details that are:
- Visible in the photo or reasonably inferred
- Consistent with the user's original tone
- Factually grounded (no invented facts)

${voiceProfile ? `User's voice characteristics: ${JSON.stringify(voiceProfile.characteristics)}` : ''}

Return JSON:
{
  "enhanced_content": "The enriched text...",
  "improvements": ["Added visual detail about mother's dress", "Included sensory detail about ocean breeze"],
  "sensory_details_added": ["visual: floral dress", "sound: waves crashing"],
  "emotional_depth_added": ["warmth in mother's smile", "contentment in the moment"]
}`

  const userPrompt = `Original text: "${originalText}"

Photo analysis: ${JSON.stringify(photoAnalysis)}

Enhance this memory while preserving the user's voice.`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const result = await callOpenAI(messages, {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  })

  return JSON.parse(result)
}

/**
 * Generate photo-specific prompts
 */
export async function generatePhotoPrompts(
  photoAnalysis: PhotoAnalysis,
  sectionContext?: string
): Promise<string[]> {
  const systemPrompt = `You are a professional ghostwriter creating interview questions.
Based on photo analysis, generate 3-5 specific, sensory-rich prompts that will help the user:
1. Describe what's in the photo with rich detail
2. Share the story behind the moment
3. Reflect on the significance

Make prompts conversational and specific to what you see in the photo.`

  const userPrompt = `Photo analysis: ${JSON.stringify(photoAnalysis)}
${sectionContext ? `Section context: ${sectionContext}` : ''}

Generate 3-5 prompts as a JSON array of strings.`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const result = await callOpenAI(messages, {
    model: 'gpt-4-turbo-preview',
    temperature: 0.8,
    max_tokens: 500,
    response_format: { type: 'json_object' }
  })

  const parsed = JSON.parse(result)
  return parsed.prompts || []
}

/**
 * Synthesize section into chapter preview
 */
export async function synthesizeSection(
  fragments: any[],
  photos: any[],
  voiceProfile: any,
  sectionTitle: string
): Promise<SectionSynthesis> {
  const systemPrompt = `You are a professional ghostwriter creating a memoir chapter preview.

Given memory fragments and photos, synthesize them into cohesive, book-quality prose that:
1. Maintains chronological or thematic flow
2. Preserves the narrator's voice (characteristics: ${JSON.stringify(voiceProfile.characteristics)})
3. Integrates visual details from photos naturally
4. Uses sensory-rich, specific language
5. Balances narrative with reflection
6. Maintains factual accuracy (no invented details)

Also provide:
- Quality feedback (strengths, suggestions, missing elements)
- Photo placement suggestions with captions

Return JSON:
{
  "preview_content": "The chapter text...",
  "word_count": 1500,
  "quality_feedback": {
    "strengths": ["Strong sensory details", "Good emotional arc"],
    "suggestions": ["Add more about the setting", "Expand on the relationship"],
    "missing_elements": ["Transition between scenes", "Reflection on significance"]
  },
  "photo_placements": [
    {"photo_id": "uuid", "suggested_position": "opening", "caption_suggestion": "..."}
  ]
}`

  const fragmentsText = fragments
    .map((f, i) => `Fragment ${i + 1}: ${f.ai_enhanced_content || f.raw_content}`)
    .join('\n\n')

  const photosText = photos
    .map((p, i) => `Photo ${i + 1} (${p.id}): ${JSON.stringify(p.ai_analysis)}`)
    .join('\n\n')

  const userPrompt = `Section: ${sectionTitle}

Memory Fragments:
${fragmentsText}

Photos:
${photosText}

Synthesize into a chapter preview.`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const result = await callOpenAI(messages, {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  })

  return JSON.parse(result)
}
