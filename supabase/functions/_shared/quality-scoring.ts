/**
 * Quality Scoring Utilities
 * Calculate sensory richness and emotional depth scores for memories
 */

export interface QualityScores {
  sensory_richness_score: number
  emotional_depth_score: number
  word_count: number
  detail_score: number
  overall_quality: number
}

export interface QualityAnalysis {
  scores: QualityScores
  feedback: {
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  }
}

// Sensory word lists
const VISUAL_WORDS = [
  'see', 'saw', 'look', 'watch', 'color', 'bright', 'dark', 'light', 'shadow',
  'red', 'blue', 'green', 'yellow', 'white', 'black', 'golden', 'silver',
  'shine', 'glow', 'sparkle', 'dim', 'vivid', 'pale', 'faded'
]

const SOUND_WORDS = [
  'hear', 'heard', 'sound', 'noise', 'voice', 'whisper', 'shout', 'scream',
  'laugh', 'cry', 'music', 'song', 'melody', 'rhythm', 'loud', 'quiet',
  'silent', 'echo', 'ring', 'buzz', 'hum', 'crackle', 'rustle'
]

const SMELL_WORDS = [
  'smell', 'scent', 'aroma', 'fragrance', 'odor', 'perfume', 'fresh',
  'stale', 'musty', 'sweet', 'sour', 'bitter', 'pungent', 'smoky'
]

const TOUCH_WORDS = [
  'feel', 'felt', 'touch', 'soft', 'hard', 'rough', 'smooth', 'warm',
  'cold', 'hot', 'cool', 'wet', 'dry', 'sticky', 'slippery', 'sharp',
  'dull', 'heavy', 'light', 'texture', 'grasp', 'hold'
]

const TASTE_WORDS = [
  'taste', 'flavor', 'sweet', 'salty', 'sour', 'bitter', 'savory',
  'delicious', 'bland', 'spicy', 'tangy', 'rich', 'creamy'
]

// Emotional word lists
const EMOTION_WORDS = [
  'happy', 'sad', 'angry', 'afraid', 'scared', 'excited', 'nervous',
  'anxious', 'worried', 'proud', 'ashamed', 'guilty', 'grateful',
  'thankful', 'love', 'loved', 'hate', 'hated', 'joy', 'sorrow',
  'grief', 'pain', 'hurt', 'comfort', 'peace', 'calm', 'tense',
  'relaxed', 'stressed', 'content', 'satisfied', 'disappointed',
  'frustrated', 'confused', 'surprised', 'shocked', 'amazed'
]

const REFLECTION_WORDS = [
  'realize', 'realized', 'understand', 'understood', 'learn', 'learned',
  'discover', 'discovered', 'remember', 'remembered', 'forget', 'forgot',
  'think', 'thought', 'believe', 'believed', 'wonder', 'wondered',
  'imagine', 'imagined', 'wish', 'wished', 'hope', 'hoped', 'regret',
  'regretted', 'appreciate', 'appreciated', 'value', 'valued'
]

/**
 * Calculate sensory richness score (0-1)
 */
export function calculateSensoryRichness(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = words.length
  
  if (wordCount === 0) return 0

  // Count sensory words by category
  const visualCount = countWords(words, VISUAL_WORDS)
  const soundCount = countWords(words, SOUND_WORDS)
  const smellCount = countWords(words, SMELL_WORDS)
  const touchCount = countWords(words, TOUCH_WORDS)
  const tasteCount = countWords(words, TASTE_WORDS)

  // Visual details (0.3 max)
  const visualScore = Math.min(visualCount / 10, 0.3)

  // Other senses (0.4 max)
  const otherSensesCount = soundCount + smellCount + touchCount + tasteCount
  const otherSensesScore = Math.min(otherSensesCount / 8, 0.4)

  // Specificity (0.3 max) - based on proper nouns, numbers, specific details
  const specificityScore = calculateSpecificity(text)

  return Math.min(visualScore + otherSensesScore + specificityScore, 1.0)
}

/**
 * Calculate emotional depth score (0-1)
 */
export function calculateEmotionalDepth(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = words.length
  
  if (wordCount === 0) return 0

  // Emotional words (0.3 max)
  const emotionCount = countWords(words, EMOTION_WORDS)
  const emotionScore = Math.min(emotionCount / 5, 0.3)

  // Reflection/meaning (0.4 max)
  const reflectionCount = countWords(words, REFLECTION_WORDS)
  const reflectionScore = Math.min(reflectionCount / 5, 0.4)

  // Personal pronouns indicate personal connection (0.3 max)
  const personalScore = calculatePersonalConnection(words)

  return Math.min(emotionScore + reflectionScore + personalScore, 1.0)
}

/**
 * Calculate specificity score
 */
function calculateSpecificity(text: string): number {
  let score = 0

  // Proper nouns (capitalized words mid-sentence)
  const properNouns = text.match(/\s[A-Z][a-z]+/g) || []
  score += Math.min(properNouns.length / 10, 0.1)

  // Numbers and dates
  const numbers = text.match(/\d+/g) || []
  score += Math.min(numbers.length / 5, 0.1)

  // Specific details (quotes, specific times, places)
  if (text.includes('"') || text.includes("'")) score += 0.05
  if (/\d{1,2}:\d{2}/.test(text)) score += 0.05 // Time mentions

  return Math.min(score, 0.3)
}

/**
 * Calculate personal connection score
 */
function calculatePersonalConnection(words: string[]): number {
  const personalPronouns = ['i', 'me', 'my', 'mine', 'we', 'us', 'our']
  const count = words.filter(w => personalPronouns.includes(w)).length
  return Math.min(count / 20, 0.3)
}

/**
 * Count occurrences of words from a list
 */
function countWords(words: string[], wordList: string[]): number {
  return words.filter(w => wordList.includes(w)).length
}

/**
 * Calculate detail score based on word count and sentence structure
 */
export function calculateDetailScore(text: string): number {
  const wordCount = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Word count score (0-0.5)
  let wordScore = 0
  if (wordCount >= 200) wordScore = 0.5
  else if (wordCount >= 100) wordScore = 0.3
  else if (wordCount >= 50) wordScore = 0.2
  else wordScore = wordCount / 100

  // Sentence variety score (0-0.5)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1)
  const varietyScore = avgWordsPerSentence > 10 && avgWordsPerSentence < 30 ? 0.5 : 0.3

  return Math.min(wordScore + varietyScore, 1.0)
}

/**
 * Calculate overall quality scores for text
 */
export function calculateQualityScores(text: string): QualityScores {
  const wordCount = text.split(/\s+/).length
  const sensoryRichness = calculateSensoryRichness(text)
  const emotionalDepth = calculateEmotionalDepth(text)
  const detailScore = calculateDetailScore(text)
  
  // Overall quality is weighted average
  const overallQuality = (
    sensoryRichness * 0.35 +
    emotionalDepth * 0.35 +
    detailScore * 0.30
  )

  return {
    sensory_richness_score: Math.round(sensoryRichness * 100) / 100,
    emotional_depth_score: Math.round(emotionalDepth * 100) / 100,
    word_count: wordCount,
    detail_score: Math.round(detailScore * 100) / 100,
    overall_quality: Math.round(overallQuality * 100) / 100,
  }
}

/**
 * Generate quality feedback based on scores
 */
export function generateQualityFeedback(
  scores: QualityScores,
  text: string
): QualityAnalysis['feedback'] {
  const strengths: string[] = []
  const improvements: string[] = []
  const suggestions: string[] = []

  // Analyze sensory richness
  if (scores.sensory_richness_score >= 0.7) {
    strengths.push('Rich sensory details bring the memory to life')
  } else if (scores.sensory_richness_score < 0.4) {
    improvements.push('Add more sensory details (what you saw, heard, smelled)')
    suggestions.push('Describe the setting: What did it look like? What sounds do you remember?')
  }

  // Analyze emotional depth
  if (scores.emotional_depth_score >= 0.7) {
    strengths.push('Strong emotional connection and personal reflection')
  } else if (scores.emotional_depth_score < 0.4) {
    improvements.push('Share more about how you felt and what it meant to you')
    suggestions.push('How did this moment make you feel? What did you learn from it?')
  }

  // Analyze word count
  if (scores.word_count >= 200) {
    strengths.push('Good level of detail and depth')
  } else if (scores.word_count < 100) {
    improvements.push('Expand with more details and context')
    suggestions.push('Tell us more: What happened before? What happened after?')
  }

  // Check for specific elements
  const hasDialogue = text.includes('"') || text.includes("'")
  const hasNames = /[A-Z][a-z]+/.test(text)
  
  if (hasDialogue) {
    strengths.push('Dialogue adds authenticity and brings people to life')
  } else {
    suggestions.push('Consider adding dialogue: What did people say?')
  }

  if (!hasNames && scores.word_count > 50) {
    suggestions.push('Include names of people and places to add specificity')
  }

  return { strengths, improvements, suggestions }
}

/**
 * Analyze quality and provide comprehensive feedback
 */
export function analyzeQuality(text: string): QualityAnalysis {
  const scores = calculateQualityScores(text)
  const feedback = generateQualityFeedback(scores, text)

  return { scores, feedback }
}
