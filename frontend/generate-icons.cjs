#!/usr/bin/env node

/**
 * PWA Icon Generator (Node.js version)
 * Generates placeholder icons or uses sharp if available
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Everbound PWA Icon Generator');
console.log('================================\n');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
  console.log('✓ Using sharp for high-quality icon generation\n');
} catch (e) {
  console.log('⚠️  Sharp not installed - will create placeholder icons');
  console.log('   For better quality, install sharp: npm install sharp\n');
}

const SOURCE = path.join(__dirname, 'public/images/logo.png');
const OUTPUT_DIR = path.join(__dirname, 'public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BACKGROUND = '#FAF8F5';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if source exists
if (!fs.existsSync(SOURCE)) {
  console.log('❌ Source logo not found at:', SOURCE);
  console.log('\nPlease ensure your logo exists at:');
  console.log('  frontend/public/images/logo.png\n');
  console.log('Alternative: Use online tool to generate icons:');
  console.log('  → https://www.pwabuilder.com/imageGenerator');
  console.log('  → https://realfavicongenerator.net/\n');
  process.exit(1);
}

async function generateWithSharp() {
  console.log('📦 Generating icons from:', SOURCE, '\n');
  
  for (const size of SIZES) {
    const output = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: BACKGROUND
        })
        .png()
        .toFile(output);
      
      console.log(`  ✓ Generated ${size}x${size}`);
    } catch (error) {
      console.error(`  ✗ Failed to generate ${size}x${size}:`, error.message);
    }
  }
}

function generatePlaceholders() {
  console.log('📦 Creating placeholder icons\n');
  console.log('⚠️  These are temporary placeholders!');
  console.log('   Replace with actual icons using one of these methods:\n');
  console.log('   1. Install ImageMagick and run: ./generate-icons.sh');
  console.log('   2. Install sharp: npm install sharp && node generate-icons.js');
  console.log('   3. Use online tool: https://www.pwabuilder.com/imageGenerator\n');
  
  // Copy source logo to all sizes (not ideal but works)
  for (const size of SIZES) {
    const output = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      fs.copyFileSync(SOURCE, output);
      console.log(`  ✓ Created placeholder ${size}x${size}`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${size}x${size}:`, error.message);
    }
  }
}

async function main() {
  try {
    if (sharp) {
      await generateWithSharp();
    } else {
      generatePlaceholders();
    }
    
    console.log('\n✅ Icon generation complete!');
    console.log('\n📁 Icons saved to:', OUTPUT_DIR);
    console.log('\nNext steps:');
    console.log('  1. Review generated icons in frontend/public/icons/');
    console.log('  2. Test PWA installation:');
    console.log('     npm run build && npm run preview');
    console.log('  3. Open Chrome DevTools → Application → Manifest');
    console.log('  4. Click install button in address bar\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
