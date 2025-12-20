# OpenAI Title Suggestions Setup Guide

## Overview

The memoir title suggestion feature uses OpenAI's GPT-4o-mini model to generate high-quality, contextually appropriate memoir titles based on the user's reader takeaway and orientation preferences.

## Architecture

```
Frontend (ProjectOrientationFlow)
    ↓
Supabase Edge Function (suggest-memoir-title)
    ↓
OpenAI API (GPT-4o-mini)
    ↓
Returns 3 title suggestions
```

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

### 2. Add API Key to Supabase

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click on **Secrets**
4. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
5. Save

#### Option B: Using Supabase CLI

```bash
# Set the secret
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here

# Verify it was set
supabase secrets list
```

### 3. Deploy the Edge Function

```bash
# Deploy the suggest-memoir-title function
supabase functions deploy suggest-memoir-title

# Verify deployment
supabase functions list
```

### 4. Test the Function

```bash
# Test locally (requires Docker)
supabase functions serve suggest-memoir-title

# In another terminal, test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/suggest-memoir-title' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"readerTakeaway":"I hope they understand the love I had for my family","audiences":["children","grandchildren"],"opennessLevel":"honest_thoughtful"}'
```

## How It Works

### 1. User Interaction

1. User completes Step 5 (Reader Takeaway)
2. User navigates to Step 6 (Title)
3. User clicks "✨ Suggest titles" button

### 2. API Call

The frontend calls the Supabase Edge Function with:
```typescript
{
  readerTakeaway: string,  // User's answer from Step 5
  audiences: string[],     // Selected audiences from Step 2
  opennessLevel: string    // Selected openness from Step 3
}
```

### 3. OpenAI Processing

The Edge Function sends a carefully crafted prompt to OpenAI:

```
System: You are a professional memoir title consultant...

User: Generate 3 memoir title suggestions based on:
- Reader's hope: "I hope they understand..."
- Intended for: children, grandchildren
- Tone: honest but thoughtful
```

### 4. Response

OpenAI returns 3 titles as a JSON array:
```json
{
  "suggestions": [
    "A Life of Love and Family",
    "Memories for My Children",
    "The Heart of Home"
  ]
}
```

### 5. Display

The frontend displays the suggestions as clickable buttons. User can:
- Click any suggestion to use it
- Click "Suggest titles" again for new suggestions
- Manually type their own title

## Cost Considerations

### OpenAI Pricing (as of 2024)

**GPT-4o-mini**:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

### Estimated Costs Per Request

- Average input: ~200 tokens (system prompt + user context)
- Average output: ~50 tokens (3 titles)
- **Cost per request: ~$0.00006** (less than 1 cent per 100 requests)

### Monthly Estimates

- 1,000 users × 3 suggestions each = 3,000 requests
- **Monthly cost: ~$0.18**

Very affordable for this use case!

## Fallback Behavior

If the OpenAI API fails for any reason:

1. **Network Error**: Falls back to local algorithm
2. **API Key Missing**: Falls back to local algorithm
3. **Rate Limit**: Falls back to local algorithm
4. **Invalid Response**: Uses safe defaults

The local fallback algorithm provides grammatically correct suggestions, ensuring the feature always works.

## Monitoring

### Check Function Logs

```bash
# View recent logs
supabase functions logs suggest-memoir-title

# Follow logs in real-time
supabase functions logs suggest-memoir-title --follow
```

### Common Issues

**"AI service not configured"**
- OpenAI API key not set in Supabase secrets
- Solution: Follow Step 2 above

**"Failed to generate suggestions"**
- OpenAI API error (rate limit, invalid key, etc.)
- Check function logs for details
- Verify API key is valid and has credits

**"No suggestions generated"**
- OpenAI returned empty response
- Usually means the prompt was too vague
- Fallback will activate automatically

## Customization

### Adjust Model

In [`suggest-memoir-title/index.ts`](../supabase/functions/suggest-memoir-title/index.ts), change:

```typescript
model: 'gpt-4o-mini', // Fast and cheap
// OR
model: 'gpt-4o',      // Higher quality, more expensive
```

### Adjust Temperature

```typescript
temperature: 0.8, // Current: Creative but controlled
// Lower (0.3-0.5): More consistent, less varied
// Higher (0.9-1.0): More creative, more varied
```

### Adjust Number of Suggestions

```typescript
// In the system prompt, change:
"Generate 3 compelling..." 
// to
"Generate 5 compelling..."

// And update the slice:
.slice(0, 5)
```

## Security

✅ **API Key Security**
- API key stored in Supabase secrets (server-side)
- Never exposed to frontend
- Not in version control

✅ **Rate Limiting**
- Supabase Edge Functions have built-in rate limiting
- OpenAI has per-account rate limits

✅ **Input Validation**
- Reader takeaway is required
- Maximum length enforced
- Sanitized before sending to OpenAI

## Testing

### Manual Testing

1. Create a new project in the app
2. Complete steps 1-5
3. On step 6, click "✨ Suggest titles"
4. Verify 3 suggestions appear
5. Click "Suggest titles" again
6. Verify NEW suggestions appear
7. Click a suggestion to use it

### Automated Testing

```bash
# Run the test script
cd supabase/functions/suggest-memoir-title
deno test
```

## Troubleshooting

### Function not found

```bash
# Redeploy
supabase functions deploy suggest-memoir-title
```

### CORS errors

The function includes CORS headers. If you still see errors:
- Check Supabase project URL is correct
- Verify anon key is valid

### Always getting fallback suggestions

- Check function logs: `supabase functions logs suggest-memoir-title`
- Verify OpenAI API key is set: `supabase secrets list`
- Test OpenAI key directly: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

## Related Files

- Frontend: [`ProjectOrientationFlow.tsx`](../frontend/src/components/ProjectOrientationFlow.tsx)
- Edge Function: [`suggest-memoir-title/index.ts`](../supabase/functions/suggest-memoir-title/index.ts)
- Documentation: [`PROJECT_ORIENTATION_FLOW.md`](./PROJECT_ORIENTATION_FLOW.md)

## Future Enhancements

- Cache suggestions to reduce API calls
- Add user feedback (thumbs up/down on suggestions)
- Use feedback to improve prompts over time
- Support multiple languages
- Generate subtitle suggestions too
