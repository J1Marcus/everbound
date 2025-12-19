#!/bin/bash

# Download Images Script for Digital Memoir Platform
# Downloads free, high-quality images from Unsplash

# Create images directory
mkdir -p frontend/public/images/hero
mkdir -p frontend/public/images/family
mkdir -p frontend/public/images/book

echo "Downloading images from Unsplash..."

# Hero Background - Grandparent and grandchild reading together
# https://unsplash.com/photos/grandparent-and-grandchild-reading
curl -L "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1920&q=80" \
  -o frontend/public/images/hero/grandparent-grandchild.jpg

# Alternative: Elderly hands holding photo album
curl -L "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1920&q=80" \
  -o frontend/public/images/hero/photo-album-hands.jpg

# Family gathering - Multi-generational
curl -L "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80" \
  -o frontend/public/images/family/family-gathering.jpg

# Vintage family photos
curl -L "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80" \
  -o frontend/public/images/family/vintage-photos.jpg

# Hardcover book on wooden desk
curl -L "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80" \
  -o frontend/public/images/book/hardcover-desk.jpg

# Stack of old books
curl -L "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&q=80" \
  -o frontend/public/images/book/book-stack.jpg

# Writing desk with journal
curl -L "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80" \
  -o frontend/public/images/hero/writing-desk.jpg

# Elderly person writing
curl -L "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1200&q=80" \
  -o frontend/public/images/family/elderly-writing.jpg

echo "✓ Images downloaded successfully!"
echo ""
echo "Images saved to:"
echo "  - frontend/public/images/hero/"
echo "  - frontend/public/images/family/"
echo "  - frontend/public/images/book/"
echo ""
echo "Next step: Run the frontend to see the images in action"
