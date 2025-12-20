/**
 * Photo Intelligence Edge Function
 * Handles photo analysis, memory enhancement, and photo-specific prompts
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  createAuthenticatedClient,
  getAuthenticatedUser,
  verifyProjectAccess,
  jsonResponse,
  errorResponse,
} from '../_shared/db.ts'
import {
  analyzePhoto,
  enhanceMemoryWithPhoto,
  generatePhotoPrompts,
} from '../_shared/openai.ts'
import {
  calculateQualityScores,
} from '../_shared/quality-scoring.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createAuthenticatedClient(authHeader)
    const user = await getAuthenticatedUser(supabase)

    const url = new URL(req.url)
    const method = req.method
    const pathname = url.pathname

    // POST /photo-intelligence/analyze - Analyze photo with GPT-4 Vision
    if (method === 'POST' && pathname.includes('/analyze')) {
      const body = await req.json()
      const { photo_id, photo_url, user_context, project_id } = body

      if (!photo_url || !project_id) {
        return errorResponse('photo_url and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Analyze photo with GPT-4 Vision
      console.log('Analyzing photo:', photo_url)
      const analysis = await analyzePhoto(photo_url, user_context)

      // If photo_id provided, update media_files record
      if (photo_id) {
        const { error: updateError } = await supabase
          .from('media_files')
          .update({
            ai_analysis: analysis,
            user_context: user_context || null,
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', photo_id)

        if (updateError) {
          console.error('Error updating media file:', updateError)
        }
      }

      return jsonResponse({
        analysis,
        message: 'Photo analyzed successfully'
      })
    }

    // POST /photo-intelligence/enhance-memory - Enhance memory text with photo analysis
    if (method === 'POST' && pathname.includes('/enhance-memory')) {
      const body = await req.json()
      const { 
        fragment_id,
        original_text, 
        photo_id, 
        project_id 
      } = body

      if (!original_text || !photo_id || !project_id) {
        return errorResponse('original_text, photo_id, and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get photo analysis
      const { data: photo, error: photoError } = await supabase
        .from('media_files')
        .select('ai_analysis')
        .eq('id', photo_id)
        .single()

      if (photoError || !photo || !photo.ai_analysis) {
        return errorResponse('Photo not found or not analyzed yet', 404)
      }

      // Get voice profile if available
      const { data: voiceProfile } = await supabase
        .from('voice_profiles')
        .select('characteristics, constraints')
        .eq('narrator_id', user.id)
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Enhance memory with photo analysis
      console.log('Enhancing memory with photo analysis')
      const enhancement = await enhanceMemoryWithPhoto(
        original_text,
        photo.ai_analysis,
        voiceProfile
      )

      // Calculate quality scores for enhanced content
      const qualityScores = calculateQualityScores(enhancement.enhanced_content)

      // If fragment_id provided, update memory fragment
      if (fragment_id) {
        const { error: updateError } = await supabase
          .from('memory_fragments')
          .update({
            ai_enhanced_content: enhancement.enhanced_content,
            photo_id: photo_id,
            sensory_richness_score: qualityScores.sensory_richness_score,
            emotional_depth_score: qualityScores.emotional_depth_score,
            word_count: qualityScores.word_count,
          })
          .eq('id', fragment_id)

        if (updateError) {
          console.error('Error updating fragment:', updateError)
        }
      }

      return jsonResponse({
        enhanced_content: enhancement.enhanced_content,
        improvements: enhancement.improvements,
        sensory_details_added: enhancement.sensory_details_added,
        emotional_depth_added: enhancement.emotional_depth_added,
        quality_scores: qualityScores,
        message: 'Memory enhanced successfully'
      })
    }

    // GET /photo-intelligence/prompts?photoId=xxx - Generate photo-specific prompts
    if (method === 'GET' && pathname.includes('/prompts')) {
      const photoId = url.searchParams.get('photoId')
      const sectionContext = url.searchParams.get('sectionContext')
      
      if (!photoId) {
        return errorResponse('photoId query parameter required', 400)
      }

      // Get photo and verify access
      const { data: photo, error: photoError } = await supabase
        .from('media_files')
        .select('ai_analysis, project_id')
        .eq('id', photoId)
        .single()

      if (photoError || !photo) {
        return errorResponse('Photo not found', 404)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, photo.project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      if (!photo.ai_analysis) {
        return errorResponse('Photo has not been analyzed yet', 400)
      }

      // Generate photo-specific prompts
      console.log('Generating photo-specific prompts')
      const prompts = await generatePhotoPrompts(
        photo.ai_analysis,
        sectionContext || undefined
      )

      return jsonResponse({ prompts })
    }

    // POST /photo-intelligence/batch-analyze - Analyze multiple photos
    if (method === 'POST' && pathname.includes('/batch-analyze')) {
      const body = await req.json()
      const { photos, project_id } = body

      if (!photos || !Array.isArray(photos) || !project_id) {
        return errorResponse('photos array and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Analyze each photo
      const results = []
      for (const photo of photos) {
        try {
          const analysis = await analyzePhoto(photo.url, photo.context)
          
          // Update database if photo_id provided
          if (photo.id) {
            await supabase
              .from('media_files')
              .update({
                ai_analysis: analysis,
                analyzed_at: new Date().toISOString(),
              })
              .eq('id', photo.id)
          }

          results.push({
            photo_id: photo.id,
            photo_url: photo.url,
            analysis,
            success: true,
          })
        } catch (error) {
          console.error(`Error analyzing photo ${photo.id}:`, error)
          results.push({
            photo_id: photo.id,
            photo_url: photo.url,
            error: error instanceof Error ? error.message : 'Analysis failed',
            success: false,
          })
        }
      }

      return jsonResponse({
        results,
        total: photos.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      })
    }

    return errorResponse('Method not allowed or invalid endpoint', 405)

  } catch (error) {
    console.error('Photo intelligence error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
})
