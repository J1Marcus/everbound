import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { readerTakeaway, audiences, opennessLevel } = await req.json()

    if (!readerTakeaway || !readerTakeaway.trim()) {
      return new Response(
        JSON.stringify({ error: 'Reader takeaway is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build context for better suggestions
    const audienceContext = audiences && audiences.length > 0 
      ? `The memoir is intended for: ${audiences.join(', ')}.` 
      : ''
    
    const opennessContext = opennessLevel 
      ? `The tone should be ${opennessLevel.replace('_', ' ')}.` 
      : ''

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model, good for this task
        messages: [
          {
            role: 'system',
            content: `You are a professional memoir title consultant. Generate 3 compelling, dignified memoir titles that:
- Are 2-7 words long
- Capture the essence and emotional core of the story
- Are appropriate for the intended audience
- Feel timeless and meaningful
- Avoid clichés and overly dramatic language
- Use proper grammar and punctuation
- Sound like real published memoir titles

Return ONLY a JSON array of 3 title strings, nothing else. Example format: ["Title One", "Title Two", "Title Three"]`
          },
          {
            role: 'user',
            content: `Generate 3 memoir title suggestions based on this context:

Reader's hope for the book: "${readerTakeaway}"
${audienceContext}
${opennessContext}

Return only the JSON array of 3 titles.`
          }
        ],
        temperature: 1.0, // Maximum creativity for varied suggestions each time
        max_tokens: 150,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No suggestions generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the JSON array from OpenAI response
    let suggestions: string[]
    try {
      suggestions = JSON.parse(content)
      
      // Validate suggestions
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid suggestions format')
      }

      // Basic validation: ensure each suggestion is a reasonable title
      suggestions = suggestions
        .filter(s => typeof s === 'string' && s.length > 0 && s.length < 100)
        .slice(0, 3) // Ensure max 3 suggestions

      if (suggestions.length === 0) {
        throw new Error('No valid suggestions')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content, parseError)
      // Fallback to safe defaults
      suggestions = [
        'My Life Story',
        'A Journey Worth Sharing',
        'Memories for Tomorrow'
      ]
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in suggest-memoir-title function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
