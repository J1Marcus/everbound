/**
 * Decorative SVG Elements for Book-Like Design
 * Pure code-based graphics - no external images needed
 */

// Corner Flourish - Vintage Book Ornament
export const CornerFlourish = ({ className = "", style = {} }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0 Q 25 25, 50 0 T 100 0"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.3"
    />
    <path
      d="M0 0 Q 25 25, 0 50 T 0 100"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.3"
    />
    <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.3" />
    <circle cx="35" cy="35" r="1.5" fill="currentColor" opacity="0.3" />
  </svg>
);

// Section Divider - Elegant Horizontal Rule
export const SectionDivider = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 200 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="0" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <circle cx="100" cy="10" r="4" fill="currentColor" opacity="0.4" />
    <circle cx="100" cy="10" r="2" fill="currentColor" opacity="0.6" />
    <line x1="120" y1="10" x2="200" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </svg>
);

// Book Icon - For Journey Steps
export const BookIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="12" y="8" width="40" height="48" rx="2" stroke="currentColor" strokeWidth="2.5" />
    <path d="M12 12 L52 12" stroke="currentColor" strokeWidth="2" />
    <path d="M12 52 L52 52" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <line x1="20" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <path d="M8 8 L12 8 L12 56 L8 56 Q6 56, 6 54 L6 10 Q6 8, 8 8" fill="currentColor" opacity="0.3" />
  </svg>
);

// Microphone Icon - For Voice Calibration
export const MicrophoneIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="24" y="12" width="16" height="24" rx="8" stroke="currentColor" strokeWidth="2.5" />
    <path d="M16 32 Q16 44, 32 44 Q48 44, 48 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="44" x2="32" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="52" x2="40" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="20" x2="28" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="32" y1="20" x2="32" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="36" y1="20" x2="36" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

// Pen Icon - For Writing/Memory Capture
export const PenIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 48 L12 52 L16 52 L20 48 L48 20 L44 16 L16 44 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M44 16 L48 20 L52 16 L48 12 Z" fill="currentColor" opacity="0.3" />
    <line x1="20" y1="44" x2="24" y2="48" stroke="currentColor" strokeWidth="2" />
    <path d="M14 50 L12 52" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

// Package Icon - For Delivery
export const PackageIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M32 12 L52 22 L52 42 L32 52 L12 42 L12 22 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M32 12 L32 32" stroke="currentColor" strokeWidth="2" />
    <path d="M12 22 L32 32 L52 22" stroke="currentColor" strokeWidth="2" />
    <path d="M22 17 L32 22 L42 17" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

// Decorative Quote Mark
export const QuoteMark = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 60 Q20 30, 40 20 L40 30 Q30 35, 30 50 Q30 60, 40 60 Q50 60, 50 50 Q50 40, 40 40 Q30 40, 30 50 Q30 60, 40 70 L30 70 Q20 70, 20 60 Z"
      opacity="0.15"
    />
  </svg>
);

// Paper Texture Pattern (for CSS background)
export const PaperTexture = () => (
  <svg width="0" height="0">
    <defs>
      <pattern id="paper-texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="#FAF8F5" />
        <circle cx="10" cy="10" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="30" cy="25" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="50" cy="15" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="70" cy="35" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="20" cy="50" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="60" cy="60" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="40" cy="75" r="0.5" fill="#6B6660" opacity="0.02" />
        <circle cx="80" cy="80" r="0.5" fill="#6B6660" opacity="0.02" />
      </pattern>
    </defs>
  </svg>
);

// Ornamental Frame
export const OrnamentalFrame = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 400 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top border */}
    <path d="M20 20 L380 20" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <path d="M20 22 L380 22" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    
    {/* Bottom border */}
    <path d="M20 280 L380 280" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <path d="M20 278 L380 278" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    
    {/* Left border */}
    <path d="M20 20 L20 280" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <path d="M22 20 L22 280" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    
    {/* Right border */}
    <path d="M380 20 L380 280" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <path d="M378 20 L378 280" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    
    {/* Corner ornaments */}
    <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.2" />
    <circle cx="380" cy="20" r="3" fill="currentColor" opacity="0.2" />
    <circle cx="20" cy="280" r="3" fill="currentColor" opacity="0.2" />
    <circle cx="380" cy="280" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);

// 3D Book Illustration
export const Book3D = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 200 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Book spine (left side) */}
    <path
      d="M10 10 L10 270 L20 280 L20 20 Z"
      fill="url(#spine-gradient)"
      stroke="#2B2826"
      strokeWidth="1"
    />
    
    {/* Book cover (front) */}
    <rect
      x="20"
      y="20"
      width="170"
      height="250"
      rx="4"
      fill="url(#cover-gradient)"
      stroke="#2B2826"
      strokeWidth="1.5"
    />
    
    {/* Inner border */}
    <rect
      x="30"
      y="30"
      width="150"
      height="230"
      rx="2"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="0.5"
      opacity="0.3"
    />
    
    {/* Title placeholder */}
    <text
      x="105"
      y="140"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="20"
      fontFamily="serif"
      fontWeight="600"
    >
      Your Story
    </text>
    
    {/* Decorative elements on cover */}
    <circle cx="105" cy="100" r="2" fill="#FFFFFF" opacity="0.4" />
    <circle cx="105" cy="180" r="2" fill="#FFFFFF" opacity="0.4" />
    
    {/* Gradients */}
    <defs>
      <linearGradient id="spine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#9A5F2E" />
        <stop offset="100%" stopColor="#2B2826" />
      </linearGradient>
      <linearGradient id="cover-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9A5F2E" />
        <stop offset="100%" stopColor="#C17A3A" />
      </linearGradient>
    </defs>
  </svg>
);

export default {
  CornerFlourish,
  SectionDivider,
  BookIcon,
  MicrophoneIcon,
  PenIcon,
  PackageIcon,
  QuoteMark,
  PaperTexture,
  OrnamentalFrame,
  Book3D,
};
