/**
 * Section Synthesis Edge Function
 * Generates chapter previews from memories and handles section approval
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  createAuthenticatedClient,
  getAuthenticatedUser,
  verifyProjectAccess,
  getSectionFragments,
  jsonResponse,
  errorResponse,
} from '../_shared/db.ts'
import {
  synthesizeSection,
} from '../_shared/openai.ts'
import {
  analyzeQuality,
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

    // POST /section-synthesis/generate - Generate chapter preview from memories
    if (method === 'POST' && pathname.includes('/generate')) {
      const body = await req.json()
      const { section_id, project_id } = body

      if (!section_id || !project_id) {
        return errorResponse('section_id and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get section details
      const { data: section, error: sectionError } = await supabase
        .from('memoir_sections')
        .select('*')
        .eq('id', section_id)
        .single()

      if (sectionError || !section) {
        return errorResponse('Section not found', 404)
      }

      // Get memory fragments for section
      const fragments = await getSectionFragments(supabase, section_id)

      if (fragments.length === 0) {
        return errorResponse('No memories found for this section', 400)
      }

      // Get photos associated with fragments
      const photoIds = fragments
        .map(f => f.photo_id)
        .filter(id => id !== null)

      let photos = []
      if (photoIds.length > 0) {
        const { data: photoData } = await supabase
          .from('media_files')
          .select('*')
          .in('id', photoIds)

        photos = photoData || []
      }

      // Get voice profile
      const { data: voiceProfile } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('narrator_id', user.id)
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!voiceProfile) {
        return errorResponse('Voice profile not found. Please complete voice calibration first.', 400)
      }

      // Synthesize section into chapter preview
      console.log(`Synthesizing section: ${section.section_title}`)
      const synthesis = await synthesizeSection(
        fragments,
        photos,
        voiceProfile,
        section.section_title
      )

      // Calculate overall quality score
      const qualityAnalysis = analyzeQuality(synthesis.preview_content)

      // Store synthesis in database
      const { data: synthData, error: synthError } = await supabase
        .from('section_synthesis')
        .upsert({
          section_id: section_id,
          project_id: project_id,
          preview_content: synthesis.preview_content,
          preview_word_count: synthesis.word_count,
          fragment_ids: fragments.map(f => f.id),
          photo_ids: photoIds,
          quality_score: qualityAnalysis.scores.overall_quality,
          quality_checks: {
            sensory_richness: qualityAnalysis.scores.sensory_richness_score,
            emotional_depth: qualityAnalysis.scores.emotional_depth_score,
            detail_score: qualityAnalysis.scores.detail_score,
          },
          recommendations: synthesis.quality_feedback,
          generation_model: 'gpt-4-turbo-preview',
          generation_parameters: {
            temperature: 0.7,
            max_tokens: 3000,
          },
        }, {
          onConflict: 'section_id',
        })
        .select()
        .single()

      if (synthError) {
        console.error('Error storing synthesis:', synthError)
        return errorResponse('Failed to store synthesis', 500, synthError)
      }

      return jsonResponse({
        synthesis: synthData,
        quality_analysis: qualityAnalysis,
        message: 'Chapter preview generated successfully'
      })
    }

    // GET /section-synthesis/preview?sectionId=xxx - Get chapter preview
    if (method === 'GET' && pathname.includes('/preview')) {
      const sectionId = url.searchParams.get('sectionId')
      
      if (!sectionId) {
        return errorResponse('sectionId query parameter required', 400)
      }

      // Get section to verify project access
      const { data: section, error: sectionError } = await supabase
        .from('memoir_sections')
        .select('project_id')
        .eq('id', sectionId)
        .single()

      if (sectionError || !section) {
        return errorResponse('Section not found', 404)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, section.project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get synthesis
      const { data: synthesis, error: synthError } = await supabase
        .from('section_synthesis')
        .select('*')
        .eq('section_id', sectionId)
        .maybeSingle()

      if (synthError) {
        return errorResponse('Failed to fetch synthesis', 500, synthError)
      }

      if (!synthesis) {
        return jsonResponse({
          synthesis: null,
          message: 'No preview generated yet for this section'
        })
      }

      return jsonResponse({ synthesis })
    }

    // POST /section-synthesis/approve - Mark section as complete and approve synthesis
    if (method === 'POST' && pathname.includes('/approve')) {
      const body = await req.json()
      const { section_id, project_id, user_feedback } = body

      if (!section_id || !project_id) {
        return errorResponse('section_id and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Update synthesis approval
      const { error: synthError } = await supabase
        .from('section_synthesis')
        .update({
          user_approved: true,
          user_feedback: user_feedback || null,
          approved_at: new Date().toISOString(),
        })
        .eq('section_id', section_id)

      if (synthError) {
        console.error('Error approving synthesis:', synthError)
        return errorResponse('Failed to approve synthesis', 500, synthError)
      }

      // Mark section as completed
      const { error: sectionError } = await supabase
        .from('memoir_sections')
        .update({
          is_completed: true,
        })
        .eq('id', section_id)

      if (sectionError) {
        console.error('Error completing section:', sectionError)
        return errorResponse('Failed to complete section', 500, sectionError)
      }

      return jsonResponse({
        success: true,
        message: 'Section approved and marked as complete'
      })
    }

    // POST /section-synthesis/regenerate - Regenerate synthesis with user feedback
    if (method === 'POST' && pathname.includes('/regenerate')) {
      const body = await req.json()
      const { section_id, project_id, feedback } = body

      if (!section_id || !project_id) {
        return errorResponse('section_id and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Store feedback and trigger regeneration
      // This would call the same synthesis logic but with user feedback incorporated
      return jsonResponse({
        message: 'Regeneration requested. This feature will incorporate your feedback.',
        status: 'pending'
      })
    }

    return errorResponse('Method not allowed or invalid endpoint', 405)

  } catch (error) {
    console.error('Section synthesis error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
})
