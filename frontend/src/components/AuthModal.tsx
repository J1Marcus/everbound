import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from './LoadingSpinner'
import './SignUpModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signup' | 'signin'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { signUp, signIn, demoLogin, loading } = useAuthStore()
  const navigate = useNavigate()

  // Reset form when modal closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
    }
  }, [isOpen])

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    setError('')
  }, [mode])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      // Sign up validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      const { error: signUpError } = await signUp(email, password, name)
      if (signUpError) {
        setError(signUpError.message)
      } else {
        onClose()
        navigate('/dashboard')
      }
    } else {
      // Sign in validation
      if (!email || !password) {
        setError('Please enter both email and password')
        return
      }

      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      } else {
        onClose()
        navigate('/dashboard')
      }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup')
    setError('')
  }

  const handleDemoLogin = async () => {
    setError('')
    const { error: demoError } = await demoLogin()
    if (demoError) {
      setError(demoError.message)
    } else {
      onClose()
      navigate('/dashboard')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="modal-content">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-warm-900 mb-2">
              {mode === 'signup' ? 'Create an account to begin' : 'Welcome back'}
            </h2>
            {mode === 'signin' && (
              <p className="text-warm-600" style={{ fontSize: '15px' }}>
                Sign in to continue your memoir
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '17px' }}>
                  {mode === 'signup' && (
                    <div>
                      <label htmlFor="modal-name" className="block text-sm font-medium text-warm-700 mb-2" style={{ fontSize: '13px' }}>
                        Full Name
                      </label>
                      <input
                        id="modal-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        className="input"
                        autoComplete="name"
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="modal-email" className="block text-sm font-medium text-warm-700 mb-2" style={{ fontSize: '13px' }}>
                      Email
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="input"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-password" className="block text-sm font-medium text-warm-700 mb-2" style={{ fontSize: '13px' }}>
                      Password
                    </label>
                    <input
                      id="modal-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                      className="input"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      disabled={loading}
                    />
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-warm-700 mb-2" style={{ fontSize: '13px' }}>
                        Confirm Password
                      </label>
                      <input
                        id="modal-confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="input"
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '32px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '56px',
                      borderRadius: '8px'
                    }}
                  >
                    {loading
                      ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
                      : (mode === 'signup' ? 'Create Account' : 'Sign In')
                    }
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '56px',
                    borderRadius: '8px'
                  }}
                >
                  Demo Login (No Backend Required)
                </button>
              </div>
            </>
          )}

          <div className="mt-6" style={{ textAlign: 'center' }}>
            <p className="text-warm-500" style={{ fontSize: '13px', margin: 0 }}>
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="text-primary-600 hover:text-primary-700"
                style={{ 
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
