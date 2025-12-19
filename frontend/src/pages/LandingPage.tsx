import { Link } from 'react-router-dom'
import './LandingPage.css'
import {
  CornerFlourish,
  SectionDivider,
  MicrophoneIcon,
  PenIcon,
  BookIcon,
  Book3D
} from '../components/DecorativeElements'

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section - Book Opening Experience */}
      <section className="hero">
        {/* Decorative corner flourishes */}
        <CornerFlourish className="corner-flourish top-left" style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '150px', color: 'var(--color-amber)', opacity: 0.15 }} />
        <CornerFlourish className="corner-flourish bottom-right" style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', color: 'var(--color-amber)', opacity: 0.15, transform: 'rotate(180deg)' }} />
        
        <div className="hero-content">
          <h1 className="hero-title">your memories, shaped into a book your family will treasure</h1>
          <p className="hero-subtitle">
            We'll help you create a beautiful book of your memories
          </p>
          
          <div className="hero-quote">
            <p className="quote-text">
              "Not a journal. Not transcription. A real book that feels intentionally 
              authored, preserves your voice, and becomes a treasured family artifact."
            </p>
          </div>

          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">
              Begin your memoir
            </Link>
            <Link to="/signin" className="btn-text">
              I already have an account
            </Link>
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
              <PenIcon className="step-icon" />
              <h3 className="step-title">We learn your writing style</h3>
              <p className="step-description">
                Write a short memory in your own words. We'll learn how you naturally
                express yourself—your tone, your rhythm, your way of telling a story—so
                your book reads authentically in your voice.
              </p>
            </div>

            <div className="journey-step">
              <BookIcon className="step-icon" />
              <h3 className="step-title">We guide you through your memories</h3>
              <p className="step-description">
                Through thoughtful questions and gentle prompts, we'll help you explore
                the moments that shaped you. Like a conversation with a caring interviewer,
                we'll ask about the details that bring your stories to life—the sights,
                sounds, and feelings that make your memories vivid and meaningful.
              </p>
            </div>

            <div className="journey-step">
              <BookIcon className="step-icon" />
              <h3 className="step-title">We craft your chapters</h3>
              <p className="step-description">
                Your memories become beautifully written chapters. You'll review each one,
                and we'll revise until it feels right. When you're ready, we'll create your book.
              </p>
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
              <li>A book your family will treasure</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Gentle CTA */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to begin?</h2>
          <p className="cta-text">
            Join others who are preserving their life stories for future generations.
            Take all the time you need—your memories aren't going anywhere.
          </p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Start your memoir
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © 2025 Digital Memoir Platform. Your memories, your voice, your legacy.
        </p>
      </footer>
    </div>
  )
}
