import { useState } from 'react'
import './LandingPage.css'
import {
  CornerFlourish,
  MicrophoneIcon,
  LightbulbIcon,
  BookIcon
} from '../components/DecorativeElements'
import AuthModal from '../components/AuthModal'

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')

  return (
    <div className="landing">
      {/* Hero Section - Book Opening Experience */}
      <section className="hero">
        {/* Decorative corner flourishes */}
        <CornerFlourish className="corner-flourish top-left" style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '150px', color: 'var(--color-amber)', opacity: 0.15 }} />
        <CornerFlourish className="corner-flourish bottom-right" style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', color: 'var(--color-amber)', opacity: 0.15, transform: 'rotate(180deg)' }} />
        
        <div className="hero-content">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
            <img
              src="/images/logo.png"
              alt="Everbound Logo"
              style={{ height: '80px', width: 'auto' }}
            />
          </div>
          <h1 className="hero-title">YOUR MEMORIES, shaped into a book your family will treasure</h1>
          <p className="hero-subtitle">
            We shape your story into a beautifully written book
          </p>
          
          <div className="hero-quote">
            <p className="quote-text">
              "Not a journal. Not transcription. A real book that feels intentionally 
              authored, preserves your voice, and becomes a treasured family artifact."
            </p>
          </div>

          <div className="hero-actions">
            <button
              onClick={() => {
                setAuthMode('signup')
                setIsAuthModalOpen(true)
              }}
              className="btn btn-primary"
            >
              Let's get started
            </button>
            <button
              onClick={() => {
                setAuthMode('signin')
                setIsAuthModalOpen(true)
              }}
              className="btn-text"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Reassurance Section - Not "How It Works" */}
      <section className="reassurance">
        <div className="reassurance-content">
          <h2 className="section-title">You'll be guided every step of the way</h2>
          <p className="section-intro">
            Creating your memoir is a gentle, thoughtful process. 
            There's no rush, no pressure, and you can't do it wrong.
          </p>

          <div className="journey-steps">
            <div className="journey-step">
              <LightbulbIcon className="step-icon" />
              <div className="step-content">
                <h3 className="step-title">Start your project</h3>
                <p className="step-description">
                  Choose what kind of memoir you want to create—your personal story or a
                  family memoir with multiple voices. Set your vision for the book, and
                  we'll guide you from there.
                </p>
              </div>
            </div>

            <div className="journey-step">
              <MicrophoneIcon className="step-icon" />
              <div className="step-content">
                <h3 className="step-title">Share your memories</h3>
                <p className="step-description">
                  Through thoughtful questions and gentle prompts, we'll help you explore
                  the moments that shaped you. Add photos, write or speak your stories, and
                  share the details that bring your memories to life—the sights, sounds, and
                  feelings that make them vivid and meaningful.
                </p>
              </div>
            </div>

            <div className="journey-step">
              <BookIcon className="step-icon" />
              <div className="step-content">
                <h3 className="step-title">Review & print</h3>
                <p className="step-description">
                  Your memories become beautifully written chapters in your authentic voice.
                  You'll review each one, and we'll revise until it feels right. When you're
                  ready, we'll create your professionally printed hardcover book.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Create Section */}
      <section className="outcome">
        <div className="outcome-content">
          <h2 className="section-title">What you'll create</h2>
          
          <div className="outcome-visual">
            <img
              src="/book.png"
              alt="Your finished memoir - a beautiful hardcover book"
              className="book-preview-image"
            />
          </div>

          <div className="outcome-details">
            <p className="outcome-description">
              A professionally printed hardcover book, beautifully designed, 
              with your memories preserved in your voice.
            </p>
            
            <ul className="outcome-features">
              <li>Hardcover binding with dust jacket</li>
              <li>Cream, acid-free paper</li>
              <li>Professional typography</li>
              <li>Your photos woven throughout</li>
              <li>A book your loved ones will treasure</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © 2025 Everbound. Your memories, your voice, your legacy.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  )
}
