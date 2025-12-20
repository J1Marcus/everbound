# Digital Memoir Platform - Print Production Specifications

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document defines the complete print production specifications for the Digital Memoir Platform, ensuring all manuscripts are designed explicitly for physical print and meet professional printing standards.

---

## 1. Print-First Philosophy

### 1.1 Core Principle

**The hardcover book is the primary artifact. The digital experience exists solely to enable the creation of that artifact.**

Any feature or workflow that does not contribute directly to narrative quality or print outcome is considered out of scope.

### 1.2 Print-Ready Definition

A manuscript is considered print-ready when:
- All quality gates passed
- Print specifications validated
- Photos meet resolution requirements
- Typography professionally formatted
- PDF passes print service validation
- Cover design finalized
- ISBN and copyright page complete

**A manuscript that cannot be printed cleanly is considered incomplete.**

---

## 2. Supported Trim Sizes

### 2.1 Standard Trim Sizes

#### 6" × 9" (Standard Memoir)
**Specifications:**
- **Dimensions:** 6 inches wide × 9 inches tall
- **Use Case:** Standard memoir, autobiography
- **Page Count Range:** 100-600 pages
- **Spine Width:** Calculated based on page count and paper type
- **Recommended For:** Most everbound

**Advantages:**
- Industry standard for everbound
- Cost-effective printing
- Comfortable reading size
- Wide printer support

#### 7" × 10" (Large Format)
**Specifications:**
- **Dimensions:** 7 inches wide × 10 inches tall
- **Use Case:** Photo-heavy everbound, family histories
- **Page Count Range:** 100-400 pages
- **Spine Width:** Calculated based on page count and paper type
- **Recommended For:** everbound with many photos

**Advantages:**
- More space for photos
- Premium feel
- Better photo display
- Suitable for coffee table books

#### 8.5" × 11" (Premium)
**Specifications:**
- **Dimensions:** 8.5 inches wide × 11 inches tall
- **Use Case:** Comprehensive family histories, photo albums
- **Page Count Range:** 50-300 pages
- **Spine Width:** Calculated based on page count and paper type
- **Recommended For:** Photo-centric everbound

**Advantages:**
- Maximum photo size
- Premium presentation
- Ideal for family archives
- Coffee table book format

### 2.2 Trim Size Selection

**Factors to Consider:**
- Photo quantity and importance
- Target page count
- Budget constraints
- Intended use (personal reading vs. display)
- Printing costs

**Recommendations:**
- **Text-Heavy Memoir:** 6" × 9"
- **Balanced Text/Photos:** 7" × 10"
- **Photo-Centric:** 8.5" × 11"

---

## 3. Page Layout Specifications

### 3.1 Margins

#### 6" × 9" Margins
```
Inside Margin (Gutter): 0.875" (22mm)
Outside Margin: 0.625" (16mm)
Top Margin: 0.75" (19mm)
Bottom Margin: 0.875" (22mm)

Rationale:
- Larger inside margin for binding
- Comfortable reading space
- Professional appearance
```

#### 7" × 10" Margins
```
Inside Margin (Gutter): 1.0" (25mm)
Outside Margin: 0.75" (19mm)
Top Margin: 0.875" (22mm)
Bottom Margin: 1.0" (25mm)

Rationale:
- Proportionally larger margins
- More white space for premium feel
- Better photo framing
```

#### 8.5" × 11" Margins
```
Inside Margin (Gutter): 1.25" (32mm)
Outside Margin: 1.0" (25mm)
Top Margin: 1.0" (25mm)
Bottom Margin: 1.25" (32mm)

Rationale:
- Generous margins for premium look
- Ample space for photos
- Coffee table book aesthetic
```

### 3.2 Text Area Calculations

**6" × 9" Text Area:**
```
Width: 6" - 0.875" - 0.625" = 4.5"
Height: 9" - 0.75" - 0.875" = 7.375"
Text Area: 4.5" × 7.375" = 33.19 sq in
```

**7" × 10" Text Area:**
```
Width: 7" - 1.0" - 0.75" = 5.25"
Height: 10" - 0.875" - 1.0" = 8.125"
Text Area: 5.25" × 8.125" = 42.66 sq in
```

**8.5" × 11" Text Area:**
```
Width: 8.5" - 1.25" - 1.0" = 6.25"
Height: 11" - 1.0" - 1.25" = 8.75"
Text Area: 6.25" × 8.75" = 54.69 sq in
```

### 3.3 Bleed Specifications

**Bleed:** 0.125" (3mm) on all sides

**Purpose:**
- Ensures no white edges after trimming
- Required for full-bleed photos
- Professional print quality

**Implementation:**
- Document size: Trim size + 0.25" (0.125" on each side)
- Example for 6" × 9": 6.25" × 9.25"
- Content must extend into bleed area
- Critical content must stay within margins

---

## 4. Typography Specifications

### 4.1 Body Text

**Font Selection:**
- **Primary Options:** Garamond, Baskerville, Caslon, Minion Pro
- **Font Type:** Serif (for readability)
- **Font Size:** 10-12pt (11pt recommended)
- **Line Spacing:** 1.3-1.5 (1.4 recommended)
- **Alignment:** Justified with hyphenation
- **Paragraph Spacing:** 0pt before, 6-8pt after
- **First Line Indent:** 0.25" (except first paragraph of chapter)

**Example Specification:**
```
Font: Garamond
Size: 11pt
Leading: 15.4pt (1.4 × 11pt)
Alignment: Justified
Hyphenation: Enabled
Paragraph Indent: 0.25"
```

### 4.2 Chapter Titles

**Specifications:**
- **Font:** Same as body or complementary serif
- **Size:** 18-24pt (20pt recommended)
- **Weight:** Bold or Regular
- **Alignment:** Left or Center
- **Space Before:** 1.5-2 inches from top
- **Space After:** 0.5-0.75 inches before body text
- **Case:** Title Case or ALL CAPS

**Example:**
```
Font: Garamond Bold
Size: 20pt
Alignment: Center
Space Before: 1.75"
Space After: 0.625"
Case: Title Case
```

### 4.3 Chapter Numbers

**Specifications:**
- **Format:** "Chapter 1" or "1" or "One"
- **Font:** Same as chapter title
- **Size:** 14-16pt
- **Placement:** Above chapter title
- **Space After:** 0.25-0.5 inches

### 4.4 Headers and Footers

**Running Headers:**
- **Font:** Same as body, smaller size (9-10pt)
- **Content:** 
  - Verso (left page): Book title or author name
  - Recto (right page): Chapter title
- **Placement:** 0.5" from top edge
- **Alignment:** Verso left, Recto right

**Page Numbers:**
- **Font:** Same as body, smaller size (9-10pt)
- **Placement:** Bottom center or bottom outside corner
- **Distance from Bottom:** 0.5" from bottom edge
- **Format:** Arabic numerals (1, 2, 3...)
- **Front Matter:** Roman numerals (i, ii, iii...)

**Example:**
```
Header Font: Garamond
Header Size: 9pt
Header Placement: 0.5" from top

Page Number Font: Garamond
Page Number Size: 10pt
Page Number Placement: Bottom center, 0.5" from bottom
```

### 4.5 Special Text Elements

**Pull Quotes:**
- Font: Italic or different weight
- Size: 12-14pt
- Indentation: 0.5" from both sides
- Space: 12pt before and after

**Emphasis:**
- Italic for emphasis
- Bold for strong emphasis (sparingly)
- No underlining

**Dialogue:**
- Standard quotation marks
- New paragraph for each speaker
- Proper punctuation inside quotes

---

## 5. Photo Specifications

### 5.1 Resolution Requirements

**Minimum Resolution:** 300 DPI at print size

**Calculation:**
```
Required Pixels = Print Width (inches) × 300 DPI × Print Height (inches) × 300 DPI

Example for 4" × 6" photo:
Width: 4" × 300 = 1200 pixels
Height: 6" × 300 = 1800 pixels
Minimum: 1200 × 1800 pixels (2.16 megapixels)
```

**Recommended Resolution:** 600 DPI for archival quality

### 5.2 Photo Sizes

**6" × 9" Book:**
- **Full Page:** 4.5" × 7.375" (1350 × 2213 pixels @ 300 DPI)
- **Half Page:** 4.5" × 3.5" (1350 × 1050 pixels @ 300 DPI)
- **Quarter Page:** 2.125" × 3.5" (638 × 1050 pixels @ 300 DPI)

**7" × 10" Book:**
- **Full Page:** 5.25" × 8.125" (1575 × 2438 pixels @ 300 DPI)
- **Half Page:** 5.25" × 4" (1575 × 1200 pixels @ 300 DPI)
- **Quarter Page:** 2.5" × 4" (750 × 1200 pixels @ 300 DPI)

**8.5" × 11" Book:**
- **Full Page:** 6.25" × 8.75" (1875 × 2625 pixels @ 300 DPI)
- **Half Page:** 6.25" × 4.25" (1875 × 1275 pixels @ 300 DPI)
- **Quarter Page:** 3" × 4.25" (900 × 1275 pixels @ 300 DPI)

### 5.3 Photo Placement Rules

**Placement Options:**
- **Full Page:** Dedicated page for photo
- **Inline:** Within text flow
- **Wrapped:** Text wraps around photo
- **Gallery:** Multiple photos on single page

**Spacing:**
- Minimum 0.125" between photo and text
- Minimum 0.25" between multiple photos
- Photos should not cross gutter (center binding)

**Captions:**
- Font: Same as body, italic, 9-10pt
- Placement: Below photo
- Alignment: Left or center
- Space: 6pt between photo and caption

**Example Caption:**
```
Font: Garamond Italic
Size: 9pt
Placement: Below photo, 6pt space
Alignment: Center
Content: "Family gathering at Grandma's house, Christmas 1985"
```

### 5.4 Photo Quality Validation

**Automated Checks:**
```python
def validate_photo_quality(photo, print_size):
    """
    Validate photo meets print requirements
    """
    # Calculate required pixels
    required_width = print_size.width_inches * 300
    required_height = print_size.height_inches * 300
    
    # Check resolution
    if photo.width < required_width or photo.height < required_height:
        return {
            "passed": False,
            "message": f"Photo resolution too low. Required: {required_width}×{required_height}, Actual: {photo.width}×{photo.height}",
            "recommendation": "Upload higher resolution image or reduce print size"
        }
    
    # Check DPI
    if photo.dpi < 300:
        return {
            "passed": False,
            "message": f"Photo DPI too low. Required: 300 DPI, Actual: {photo.dpi} DPI",
            "recommendation": "Re-scan or re-export photo at 300 DPI"
        }
    
    # Check file format
    if photo.format not in ['JPEG', 'PNG', 'TIFF']:
        return {
            "passed": False,
            "message": f"Unsupported format: {photo.format}",
            "recommendation": "Convert to JPEG, PNG, or TIFF"
        }
    
    return {
        "passed": True,
        "message": "Photo meets print requirements"
    }
```

### 5.5 Color Management

**Color Space:**
- **Preferred:** CMYK (for print)
- **Acceptable:** sRGB (will be converted)
- **Avoid:** Adobe RGB (unless properly managed)

**Color Profile:**
- **CMYK:** US Web Coated (SWOP) v2 or ISO Coated v2
- **RGB:** sRGB IEC61966-2.1

**Conversion:**
- System automatically converts RGB to CMYK
- Preserves color accuracy as much as possible
- User notified of significant color shifts

---

## 6. Paper and Binding Specifications

### 6.1 Paper Types

#### Cream Paper
**Specifications:**
- **Color:** Off-white, warm tone
- **Weight:** 60-70 lb (90-105 gsm)
- **Finish:** Uncoated, matte
- **Opacity:** High (minimal show-through)

**Advantages:**
- Easier on eyes for extended reading
- Traditional memoir aesthetic
- Reduces glare
- Ages well

**Recommended For:** Text-heavy everbound

#### White Paper
**Specifications:**
- **Color:** Bright white
- **Weight:** 60-70 lb (90-105 gsm)
- **Finish:** Uncoated or coated
- **Opacity:** High

**Advantages:**
- Better photo reproduction
- Modern, clean look
- Higher contrast for text
- Professional appearance

**Recommended For:** Photo-heavy everbound

### 6.2 Binding Types

#### Hardcover (Casebound)
**Specifications:**
- **Cover:** Rigid board wrapped in cloth or paper
- **Spine:** Sewn or perfect bound
- **Endpapers:** Colored or patterned
- **Dust Jacket:** Optional

**Advantages:**
- Premium quality
- Durable and long-lasting
- Heirloom quality
- Professional appearance

**Recommended For:** All everbound (default)

#### Paperback (Perfect Bound)
**Specifications:**
- **Cover:** Heavy cardstock (10-12pt)
- **Spine:** Glued
- **Finish:** Matte or glossy

**Advantages:**
- Lower cost
- Lighter weight
- Easier to hold
- More portable

**Recommended For:** Budget-conscious projects, multiple copies

### 6.3 Cover Finishes

**Matte Finish:**
- Non-reflective surface
- Elegant, sophisticated look
- Fingerprint resistant
- Recommended for most everbound

**Glossy Finish:**
- Reflective surface
- Vibrant colors
- Photo-friendly
- Modern appearance

**Linen or Cloth:**
- Textured surface
- Premium feel
- Traditional binding
- Heirloom quality

---

## 7. Front Matter

### 7.1 Required Pages

#### Title Page
**Content:**
- Book title (large, centered)
- Subtitle (if applicable)
- Author name
- Optional: Small decorative element

**Placement:** Right-hand page (recto), typically page 1 or 3

#### Copyright Page
**Content:**
- Copyright notice: "Copyright © [Year] by [Author Name]"
- All rights reserved statement
- ISBN (if applicable)
- Publisher information (if applicable)
- Printing information
- Optional: Library of Congress data

**Placement:** Verso (back) of title page

**Example:**
```
Copyright © 2025 by John Doe
All rights reserved.

No part of this book may be reproduced in any form without 
written permission from the author.

ISBN: 978-1-234567-89-0

Printed in the United States of America
First Edition

Published by [Publisher Name]
[City, State]
```

### 7.2 Optional Pages

#### Dedication
**Content:**
- Short dedication (1-3 lines)
- Centered on page

**Placement:** Right-hand page after copyright

**Example:**
```
For my family,
who made this story possible
```

#### Table of Contents
**Content:**
- Chapter numbers and titles
- Page numbers
- Optional: Part divisions

**Placement:** Right-hand page, typically after dedication

**Example:**
```
Contents

Chapter 1: Beginnings ........................... 1
Chapter 2: Growing Up .......................... 15
Chapter 3: Finding My Way ...................... 32
Chapter 4: Love and Loss ....................... 48
...
```

#### Foreword
**Content:**
- Written by someone other than author
- 500-1500 words
- Provides context or perspective

**Placement:** Right-hand page after table of contents

#### Preface or Introduction
**Content:**
- Written by author
- Explains purpose or approach
- 500-2000 words

**Placement:** Right-hand page after foreword (if present)

---

## 8. Back Matter

### 8.1 Optional Pages

#### Afterword
**Content:**
- Closing thoughts
- Reflections on writing process
- Updates since main narrative
- 500-2000 words

**Placement:** After final chapter

#### Acknowledgments
**Content:**
- Thanks to contributors
- Recognition of support
- 200-1000 words

**Placement:** After afterword or final chapter

#### About the Author
**Content:**
- Brief biography
- Photo (optional)
- 100-300 words

**Placement:** Final page or back cover

#### Photo Credits
**Content:**
- Attribution for photos
- Photographer credits
- Archive sources

**Placement:** After acknowledgments

---

## 9. PDF Generation

### 9.1 PDF Standards

**PDF/X-1a Compliance:**
- Industry standard for print
- Ensures color accuracy
- Embeds all fonts
- Flattens transparency
- No RGB colors (CMYK only)

**PDF/X-4 (Alternative):**
- Supports transparency
- Allows RGB and CMYK
- More flexible
- Requires printer support

### 9.2 PDF Settings

**General Settings:**
```
Standard: PDF/X-1a:2001
Compatibility: Acrobat 4.0 (PDF 1.3)
Color Conversion: Convert to CMYK
Color Profile: US Web Coated (SWOP) v2
Embed Fonts: All fonts
Subset Fonts: 100%
Compression: JPEG, Maximum quality
Resolution: 300 DPI
```

**Bleed and Trim:**
```
Bleed: 0.125" all sides
Trim Marks: Enabled
Registration Marks: Enabled
Color Bars: Enabled
Page Information: Enabled
```

### 9.3 PDF Validation

**Automated Checks:**
```python
def validate_print_pdf(pdf_file):
    """
    Validate PDF meets print requirements
    """
    checks = {
        "pdf_standard": check_pdf_standard(pdf_file),  # PDF/X-1a
        "fonts_embedded": check_fonts_embedded(pdf_file),  # All fonts
        "color_space": check_color_space(pdf_file),  # CMYK only
        "resolution": check_resolution(pdf_file),  # 300 DPI minimum
        "bleed": check_bleed(pdf_file),  # 0.125" all sides
        "page_size": check_page_size(pdf_file),  # Correct trim size
        "page_count": check_page_count(pdf_file)  # Within range
    }
    
    passed = all(check["passed"] for check in checks.values())
    
    return {
        "passed": passed,
        "checks": checks,
        "message": "PDF ready for print" if passed else "PDF has issues"
    }
```

**Manual Validation:**
- Visual inspection of PDF
- Check page order
- Verify photo placement
- Confirm text readability
- Review headers and footers

---

## 10. Print Service Integration

### 10.1 Supported Print Services

#### Blurb
**Specifications:**
- Trim sizes: 6×9, 7×10, 8×11
- Binding: Hardcover, softcover
- Paper: White, cream
- Minimum pages: 20
- Maximum pages: 440 (hardcover), 480 (softcover)

**File Requirements:**
- PDF/X-1a or PDF/X-3
- 300 DPI minimum
- CMYK color space
- Fonts embedded

#### Lulu
**Specifications:**
- Trim sizes: Multiple options including 6×9, 7×10, 8.5×11
- Binding: Hardcover, softcover, coil
- Paper: White, cream
- Minimum pages: 24
- Maximum pages: 800

**File Requirements:**
- PDF format
- 300 DPI minimum
- RGB or CMYK
- Fonts embedded

#### IngramSpark
**Specifications:**
- Trim sizes: Industry standard sizes
- Binding: Hardcover, softcover
- Paper: Multiple options
- Minimum pages: 24
- Maximum pages: 828 (hardcover), 828 (softcover)

**File Requirements:**
- PDF/X-1a or PDF/X-3
- 300 DPI minimum
- CMYK color space
- Fonts embedded
- Bleed required

### 10.2 Print Job Workflow

**Process:**
```
1. User completes manuscript
2. Runs quality check (passes)
3. Selects print specifications
4. System generates print PDF
5. PDF validated automatically
6. User reviews PDF
7. User approves PDF
8. User selects print service
9. User enters shipping details
10. System submits order to print service
11. Print service processes order
12. Book printed and shipped
13. User receives book
14. Project marked as completed
```

### 10.3 Cost Estimation

**Factors:**
- Trim size
- Page count
- Binding type
- Paper type
- Cover finish
- Quantity
- Shipping

**Example Calculation:**
```
6" × 9" Hardcover
300 pages
Cream paper
Matte finish
Quantity: 1

Base Cost: $25.00
Per-Page Cost: $0.05 × 300 = $15.00
Shipping: $5.99
Total: $45.99
```

---

## 11. Quality Assurance

### 11.1 Pre-Print Checklist

**Content:**
- [ ] All chapters approved
- [ ] Quality gates passed
- [ ] Front matter complete
- [ ] Back matter complete (if applicable)
- [ ] Table of contents accurate
- [ ] Page numbers correct

**Photos:**
- [ ] All photos meet resolution requirements
- [ ] Photo placement finalized
- [ ] Captions complete and accurate
- [ ] Photo credits included (if needed)

**Typography:**
- [ ] Consistent font usage
- [ ] No orphans or widows
- [ ] Proper hyphenation
- [ ] Headers and footers correct

**PDF:**
- [ ] PDF/X-1a compliant
- [ ] All fonts embedded
- [ ] CMYK color space
- [ ] 300 DPI resolution
- [ ] Correct trim size
- [ ] Bleed included
- [ ] Trim marks present

**Legal:**
- [ ] Copyright page complete
- [ ] ISBN assigned (if applicable)
- [ ] Permissions obtained for quoted material
- [ ] Photo rights confirmed

### 11.2 Proof Copy Review

**Recommended:**
- Order proof copy before final print run
- Review physical book for:
  - Print quality
  - Color accuracy
  - Binding quality
  - Page alignment
  - Photo reproduction
  - Overall appearance

**Corrections:**
- Make any necessary corrections
- Regenerate PDF
- Re-validate
- Order new proof if significant changes

---

## 12. Print Production Timeline

### 12.1 Typical Timeline

**Manuscript Completion to Print-Ready:**
- Quality check: 1-2 hours
- PDF generation: 30-60 minutes
- User review: 1-7 days
- Revisions (if needed): 1-3 days

**Print Production:**
- Order submission: Immediate
- Print service processing: 1-3 days
- Printing: 3-7 days
- Shipping: 3-10 days (depending on location)

**Total Timeline:** 2-4 weeks from manuscript completion to book delivery

### 12.2 Rush Options

**Expedited Printing:**
- Some print services offer rush printing
- Additional cost
- Reduced timeline to 1-2 weeks

**Digital Proof:**
- PDF review instead of physical proof
- Saves 1-2 weeks
- Higher risk of print surprises

---

## 13. Post-Print

### 13.1 Reprint Process

**For Additional Copies:**
```
1. User logs into platform
2. Navigates to completed project
3. Clicks "Order Additional Copies"
4. Selects quantity
5. Confirms shipping address
6. Places order
7. Print service fulfills order
```

**No Regeneration Needed:**
- Original print PDF stored
- Same specifications used
- Consistent quality across prints

### 13.2 Revisions

**For Updated Editions:**
```
1. User unlocks manuscript
2. Makes necessary changes
3. Re-runs quality check
4. Regenerates PDF
5. Creates new version (e.g., "Second Edition")
6. Orders new print run
```

**Version Control:**
- Each version tracked separately
- Original version preserved
- Clear version labeling

---

## Document Authority

This print production documentation is derived from and subordinate to:
1. [`Digital_Memoir_Platform_Concept_and_Scope.pdf`](Digital_Memoir_Platform_Concept_and_Scope.pdf) (authoritative vision)
2. [`Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf`](Digital_Memoir_Platform_Non_Goals_and_Exclusions.pdf) (authoritative exclusions)
3. [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md) (project scope)

**Core Principle:** All manuscripts are designed explicitly for physical print. A manuscript that cannot be printed cleanly is considered incomplete.
