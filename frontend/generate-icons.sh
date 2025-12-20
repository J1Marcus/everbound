#!/bin/bash

# PWA Icon Generator Script
# Generates all required icon sizes from a source logo

set -e

echo "🎨 Everbound PWA Icon Generator"
echo "================================"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick:"
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    echo ""
    echo "Or use the online tool: https://www.pwabuilder.com/imageGenerator"
    exit 1
fi

# Source image
SOURCE="public/images/logo.png"

if [ ! -f "$SOURCE" ]; then
    echo "❌ Source logo not found at: $SOURCE"
    echo "Please ensure your logo exists at frontend/public/images/logo.png"
    exit 1
fi

# Create icons directory
mkdir -p public/icons

echo "📦 Generating icons from: $SOURCE"
echo ""

# Icon sizes needed for PWA
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
    output="public/icons/icon-${size}x${size}.png"
    echo "  ✓ Generating ${size}x${size}..."
    
    convert "$SOURCE" \
        -resize ${size}x${size} \
        -background "#FAF8F5" \
        -gravity center \
        -extent ${size}x${size} \
        "$output"
done

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "📁 Icons saved to: frontend/public/icons/"
echo ""
echo "Next steps:"
echo "  1. Review generated icons"
echo "  2. Test PWA installation"
echo "  3. Run: npm run build && npm run preview"
echo "  4. Open Chrome DevTools → Application → Manifest"
echo ""
