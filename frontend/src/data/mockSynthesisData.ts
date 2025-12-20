/**
 * Mock Synthesis Data for Testing
 * This provides realistic chapter synthesis data for development and testing
 */

export interface SynthesisData {
  id: string
  sectionId: string
  sectionTitle: string
  chapterNumber: number
  previewContent: string
  wordCount: number
  qualityScore: number
  qualityChecks: {
    sensoryRichness: { score: number; passed: boolean; details: string }
    emotionalDepth: { score: number; passed: boolean; details: string }
    narrativeFlow: { score: number; passed: boolean; details: string }
    voiceConsistency: { score: number; passed: boolean; details: string }
    characterDevelopment: { score: number; passed: boolean; details: string }
  }
  recommendations: Array<{
    type: string
    priority: string
    message: string
    suggestedAction?: string
    suggestedPrompt?: string
  }>
  userApproved: boolean
  createdAt: string
}

export const mockChapter1Synthesis: SynthesisData = {
  id: 'mock-synthesis-001',
  sectionId: 'origins',
  sectionTitle: 'Origins',
  chapterNumber: 1,
  previewContent: `# Chapter 1: Where It All Started

Looking back now, I can see how much that small brick house on Maple Street shaped who I would become. It wasn't grand or remarkable to anyone else, but to me, it was the whole world.

I was born there in 1952, in the front bedroom where my mother had hung yellow curtains she'd sewn herself. The house had a green door that she painted every spring without fail. I can still smell that fresh paint mixing with the scent of her rose bushes that lined the front walk. My father had built those flower beds himself, working every evening after his shift at the factory, his hands still stained with the day's work.

My mother was a quiet woman with strong hands—hands that could coax a garden to bloom or thread the finest needle. She worked as a seamstress from home, and I would fall asleep most nights to the gentle hum of her sewing machine in the next room. That sound became a lullaby to me. She made all my clothes until I was twelve, each stitch a small act of love I didn't fully appreciate until much later. I remember her measuring tape always draped around her neck like a scarf, ready at a moment's notice.

Dad worked at the steel mill for thirty years. Every evening he would come home with his lunch pail empty and his hands darkened with grease. But I never once heard him complain. He saved his words for what mattered. On Saturdays, he would take me fishing at Miller's Pond, and those were the times he talked the most. Sitting on that bank with our lines in the water, he taught me about patience, about the importance of being quiet when you need to think, about how sometimes the best thing you can do is just be present.

That house, those people, that life—it was simple, but it was solid. It gave me roots I didn't know I was growing until years later when I needed them most. The green door, the sewing machine's hum, the Saturday mornings at the pond—these weren't just memories. They were the foundation of everything that came after.`,
  wordCount: 2150,
  qualityScore: 0.92,
  qualityChecks: {
    sensoryRichness: {
      score: 0.95,
      passed: true,
      details: 'Excellent use of sensory details: visual (green door, yellow curtains), auditory (sewing machine hum), olfactory (paint, roses)'
    },
    emotionalDepth: {
      score: 0.88,
      passed: true,
      details: 'Strong emotional resonance with reflective framing and authentic sentiment'
    },
    narrativeFlow: {
      score: 0.94,
      passed: true,
      details: 'Smooth transitions between memories, good pacing, natural progression'
    },
    voiceConsistency: {
      score: 0.91,
      passed: true,
      details: 'Consistent warm, reflective tone throughout'
    },
    characterDevelopment: {
      score: 0.89,
      passed: true,
      details: 'Parents well-characterized through specific details and actions'
    }
  },
  recommendations: [
    {
      type: 'enhancement',
      priority: 'low',
      message: 'Consider adding a photo of the house or family from this era',
      suggestedAction: 'Upload a photo to enhance visual connection'
    },
    {
      type: 'expansion',
      priority: 'low',
      message: 'You could expand on siblings or other family members if relevant',
      suggestedPrompt: 'Did you have brothers or sisters? What were they like?'
    }
  ],
  userApproved: true,
  createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
}

export const mockSynthesisData: Record<string, SynthesisData> = {
  'origins': mockChapter1Synthesis,
  'chapter-1': mockChapter1Synthesis
}

/**
 * Get mock synthesis data for a section or chapter
 */
export function getMockSynthesis(sectionKey: string): SynthesisData | null {
  return mockSynthesisData[sectionKey] || null
}

/**
 * Check if mock data exists for a section
 */
export function hasMockSynthesis(sectionKey: string): boolean {
  return sectionKey in mockSynthesisData
}
