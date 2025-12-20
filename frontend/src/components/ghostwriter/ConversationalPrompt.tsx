/**
 * ConversationalPrompt Component
 * AI-guided conversational memory capture interface
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material'
import {
  Send as SendIcon,
  Mic as MicIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface ConversationalPromptProps {
  prompt: {
    id: string
    scene: string
  }
  sectionContext?: string
  onComplete: (transcript: string) => void
  onBack: () => void
  onVoiceRecord?: () => void
}

export const ConversationalPrompt: React.FC<ConversationalPromptProps> = ({
  prompt,
  sectionContext: _sectionContext,
  onComplete,
  onBack,
  onVoiceRecord,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startConversation = async () => {
    setConversationStarted(true)
    setIsLoading(true)

    // Initial AI greeting
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Let's explore this memory together: "${prompt.scene}". To start, what comes to mind when you think about this moment? It could be a feeling, a person, a place—whatever feels most vivid to you.`,
      timestamp: new Date(),
    }

    setMessages([initialMessage])
    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    // Simulate AI response (replace with actual OpenAI API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(userInput, messages.length)
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (_userInput: string, messageCount: number): string => {
    // Demo responses - replace with actual OpenAI integration
    const responses = [
      "That's a wonderful detail. Can you tell me more about what you were feeling in that moment?",
      "I can sense how meaningful this was. Who else was there with you, and what role did they play?",
      "That's really interesting. What made this moment stand out from other similar experiences?",
      "Thank you for sharing that. How did this experience change you or influence what came next?",
      "This is coming together beautifully. Looking back now, what does this memory mean to you?",
      "You've shared some rich details. Is there anything else about this moment that feels important to capture?",
    ]

    if (messageCount >= 10) {
      return "You've shared a beautiful, detailed memory. Would you like to save this and move on, or is there more you'd like to add?"
    }

    return responses[Math.min(Math.floor(messageCount / 2), responses.length - 1)]
  }

  const handleComplete = () => {
    // Compile all user messages into a transcript
    const transcript = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n\n')
    onComplete(transcript)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!conversationStarted) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', p: { xs: 3, md: 4 } }}>
        <IconButton
          onClick={onBack}
          sx={{
            mb: 3,
            color: 'var(--color-amber)',
            '&:hover': { backgroundColor: 'var(--color-linen)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            backgroundColor: 'var(--color-parchment)',
            border: '2px solid var(--color-amber)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 2,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            {prompt.scene}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-slate)',
              mb: 4,
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            I'll guide you through this memory with thoughtful questions, one at a time. 
            We'll explore the details together at your own pace.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={startConversation}
            sx={{
              backgroundColor: 'var(--color-amber)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'var(--color-amber-dark)',
              },
            }}
          >
            Start Conversation
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            color: 'var(--color-amber)',
            '&:hover': { backgroundColor: 'var(--color-linen)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography
          variant="body2"
          sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
        >
          {messages.filter((m) => m.role === 'user').length} responses
        </Typography>

        <Button
          variant="text"
          onClick={handleComplete}
          disabled={messages.filter((m) => m.role === 'user').length < 3}
          sx={{
            textTransform: 'none',
            color: 'var(--color-amber)',
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: 'var(--color-linen)' },
          }}
        >
          Complete
        </Button>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          mb: 3,
          maxHeight: '60vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Paper
            key={message.id}
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor:
                message.role === 'assistant' ? 'var(--color-parchment)' : 'var(--color-linen)',
              border: `1px solid ${
                message.role === 'assistant' ? 'var(--color-stone)' : 'var(--color-amber-light)'
              }`,
              borderRadius: '12px',
              alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-ink)',
                fontSize: '1rem',
                lineHeight: 1.6,
                fontFamily: message.role === 'user' ? 'var(--font-serif)' : 'inherit',
              }}
            >
              {message.content}
            </Typography>
          </Paper>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
            <CircularProgress size={16} sx={{ color: 'var(--color-amber)' }} />
            <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
              Thinking...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your thoughts..."
          disabled={isLoading}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '1rem',
              lineHeight: 1.6,
              fontFamily: 'var(--font-serif)',
              paddingRight: '100px',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: 'var(--color-amber-light)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-amber)',
              },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            onClick={onVoiceRecord || (() => alert('Voice recording will be implemented soon'))}
            sx={{
              color: 'var(--color-amber)',
              backgroundColor: 'var(--color-linen)',
              '&:hover': {
                backgroundColor: 'var(--color-amber)',
                color: 'white',
              },
            }}
            title="Record voice"
          >
            <MicIcon />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            sx={{
              color: 'white',
              backgroundColor: 'var(--color-amber)',
              '&:hover': {
                backgroundColor: 'var(--color-amber-dark)',
              },
              '&:disabled': {
                backgroundColor: 'var(--color-stone)',
                opacity: 0.5,
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'var(--color-slate)',
          mt: 2,
          fontSize: '0.875rem',
        }}
      >
        Press Enter to send • Shift+Enter for new line
      </Typography>
    </Box>
  )
}
