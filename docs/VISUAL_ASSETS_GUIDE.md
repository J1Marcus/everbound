# Visual Assets Guide for Digital Memoir Platform

## Overview

This guide specifies the visual assets needed to complete the book-like, emotionally resonant design of the Digital Memoir Platform.

---

## Required Images

### 1. Hero Section Background Image
**Location:** Hero section background  
**Purpose:** Set warm, inviting tone immediately

**Specifications:**
- **Dimensions:** 1920×1080px minimum
- **Format:** WebP (with JPG fallback)
- **File size:** < 200KB (optimized)
- **Style:** Soft-focus, warm-toned

**Suggested Imagery:**
- Hardcover book on wooden desk with soft natural light
- Vintage writing desk with leather-bound journal
- Stack of old family photo albums
- Warm library setting with books and soft lighting

**Color Palette:**
- Warm browns, ambers, cream tones
- Soft, diffused lighting
- No harsh shadows or bright whites

**Where to Source:**
- Unsplash: Search "vintage books", "writing desk", "family photos"
- Pexels: Search "memoir", "old books", "wooden desk"
- Custom photography: Styled product shot of hardcover book

---

### 2. Book Cover Mockup
**Location:** "What you'll create" section  
**Purpose:** Show tangible end product

**Specifications:**
- **Dimensions:** 800×1120px (book cover ratio)
- **Format:** PNG with transparency
- **Style:** 3D rendered or photographed hardcover book

**Details:**
- Hardcover with visible texture (linen or leather)
- Dust jacket with subtle sheen
- Spine visible at angle
- Warm color (amber, burgundy, forest green)
- Gold or embossed title placeholder

**Where to Source:**
- Placeit.net: Book mockup generator
- Smartmockups.com: 3D book renders
- Custom: Commission 3D render or photograph actual book

---

### 3. Decorative Elements

#### Corner Flourishes
**Purpose:** Frame sections with book-like ornamentation

**Specifications:**
- **Format:** SVG (scalable, crisp)
- **Style:** Vintage book corner ornaments
- **Color:** Single color (will be tinted via CSS)

**Suggested Designs:**
- Art Nouveau corner flourishes
- Vintage book plate borders
- Subtle filigree patterns
- Classical typographic ornaments

**Where to Source:**
- The Noun Project: Search "corner ornament", "flourish"
- Freepik: Vintage ornament vectors
- Custom: Simple SVG paths

#### Divider Elements
**Purpose:** Separate sections elegantly

**Specifications:**
- **Format:** SVG
- **Dimensions:** 200×20px
- **Style:** Horizontal ornamental divider

**Suggested Designs:**
- Simple line with center ornament
- Vintage typographic rule
- Subtle wave or scroll pattern

---

### 4. Icon Set
**Purpose:** Visual cues for journey steps

**Specifications:**
- **Format:** SVG
- **Style:** Outlined, 2px stroke
- **Size:** 64×64px
- **Color:** Single color (CSS-tinted)

**Required Icons:**
- **Voice/Microphone:** For voice calibration step
- **Pen/Writing:** For memory capture step
- **Book/Pages:** For chapter assembly step
- **Package/Gift:** For final book delivery

**Where to Source:**
- Heroicons: Free, outlined style
- Lucide Icons: Clean, consistent
- Feather Icons: Minimal, elegant

---

### 5. Texture Overlays

#### Paper Texture
**Purpose:** Subtle background texture throughout site

**Specifications:**
- **Dimensions:** 512×512px (tileable)
- **Format:** PNG with transparency
- **Opacity:** 3-5% when applied
- **Style:** Subtle paper grain

**Where to Source:**
- Subtle Patterns: Free tileable textures
- TextureKing: Paper textures
- Custom: Scan actual paper, desaturate

#### Linen/Fabric Texture
**Purpose:** Card backgrounds, elevated surfaces

**Specifications:**
- **Dimensions:** 512×512px (tileable)
- **Format:** PNG
- **Style:** Fine linen or canvas weave
- **Color:** Neutral (will be tinted)

---

## Implementation Guide

### File Structure
```
frontend/public/images/
├── hero/
│   ├── hero-background.webp
│   └── hero-background.jpg (fallback)
├── book/
│   ├── book-mockup-3d.png
│   └── book-cover-template.png
├── decorative/
│   ├── corner-flourish-tl.svg
│   ├── corner-flourish-br.svg
│   ├── section-divider.svg
│   └── ornament-center.svg
├── icons/
│   ├── voice-icon.svg
│   ├── writing-icon.svg
│   ├── book-icon.svg
│   └── delivery-icon.svg
└── textures/
    ├── paper-texture.png
    └── linen-texture.png
```

### CSS Integration Examples

#### Hero Background Image
```css
.hero {
  background-image: 
    linear-gradient(
      180deg,
      rgba(250, 248, 245, 0.95) 0%,
      rgba(250, 248, 245, 0.98) 100%
    ),
    url('/images/hero/hero-background.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

#### Corner Flourishes
```css
.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
  height: 150px;
  background-image: url('/images/decorative/corner-flourish-tl.svg');
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.15;
}
```

#### Book Mockup
```css
.book-preview {
  background-image: url('/images/book/book-mockup-3d.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

---

## Temporary Placeholders

Until custom assets are created, use these CSS-based graphics:

### Gradient Book Cover
```css
.book-cover {
  background: linear-gradient(135deg, #9A5F2E 0%, #C17A3A 100%);
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.3),
    inset 0 0 0 2px rgba(255,255,255,0.1);
}
```

### SVG Corner Ornament (Inline)
```html
<svg class="corner-ornament" viewBox="0 0 100 100">
  <path d="M0,0 Q50,50 100,0" stroke="currentColor" fill="none"/>
  <circle cx="50" cy="50" r="5" fill="currentColor"/>
</svg>
```

---

## Design Principles for All Assets

1. **Warm Color Palette**
   - Ambers, creams, warm browns
   - Avoid cool blues, grays, stark whites

2. **Soft, Natural Lighting**
   - Diffused, not harsh
   - Golden hour quality
   - Gentle shadows

3. **Timeless, Not Trendy**
   - Classic typography
   - Traditional book aesthetics
   - Avoid modern minimalism

4. **Texture Over Flatness**
   - Visible paper grain
   - Fabric weaves
   - Natural materials

5. **Subtle, Not Loud**
   - Decorative elements support, don't dominate
   - Opacity 10-20% for ornaments
   - Let content breathe

---

## Priority Order

### Phase 1 (Immediate Impact)
1. Hero background image
2. Book mockup 3D render
3. Corner flourishes (SVG)

### Phase 2 (Polish)
4. Icon set for journey steps
5. Section dividers
6. Paper texture overlay

### Phase 3 (Enhancement)
7. Linen texture for cards
8. Additional ornamental elements
9. Animated subtle effects

---

## Budget-Friendly Options

### Free Resources
- **Unsplash** - High-quality photos (free, no attribution required)
- **Pexels** - Stock photos and videos
- **The Noun Project** - Icons (free with attribution)
- **Subtle Patterns** - Tileable textures

### Low-Cost Options
- **Placeit** - $29/month for unlimited mockups
- **Envato Elements** - $16.50/month for all assets
- **Freepik Premium** - $9.99/month for vectors

### Custom Creation
- **Canva Pro** - $12.99/month for design tools
- **Figma** - Free for individual use
- **Blender** - Free 3D rendering software

---

## Accessibility Considerations

1. **Alt Text Required**
   - Describe decorative images as "decorative"
   - Describe functional images meaningfully

2. **Contrast**
   - Ensure text over images meets WCAG AAA (7:1)
   - Use overlay gradients if needed

3. **Performance**
   - Optimize all images (WebP format)
   - Lazy load below-fold images
   - Provide appropriate sizes for responsive

4. **Reduced Motion**
   - No auto-playing animations
   - Respect `prefers-reduced-motion`

---

## Next Steps

1. **Audit Current State**
   - Identify which placeholders are most visible
   - Prioritize based on user impact

2. **Source or Create Assets**
   - Start with hero image (biggest impact)
   - Add book mockup next
   - Layer in decorative elements

3. **Implement and Test**
   - Add images to public folder
   - Update CSS with image paths
   - Test on multiple devices/browsers

4. **Optimize**
   - Compress images
   - Generate WebP versions
   - Implement lazy loading

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2024  
**Status:** Implementation Guide
