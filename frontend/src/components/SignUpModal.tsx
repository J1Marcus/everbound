import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from './LoadingSpinner'
import './SignUpModal.css'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { signUp, loading } = useAuthStore()
  const navigate = useNavigate()

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
    }
  }, [isOpen])

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

    // Validation
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
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
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
            <h2 className="text-3xl font-serif text-warm-900 mb-2">Create an account to begin</h2>
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
                    placeholder="At least 6 characters"
                    className="input"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

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
              </div>

            </form>

            <div style={{ marginTop: '32px' }}>
              <button
                onClick={handleSubmit}
                type="button"
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
            </>
          )}

          <div className="mt-6" style={{ textAlign: 'center' }}>
            <p className="text-warm-500" style={{ fontSize: '13px', margin: 0 }}>
              Already have an account?{' '}
              <button
                onClick={() => {
                  onClose()
                  navigate('/signin')
                }}
                className="text-primary-600 hover:text-primary-700"
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
