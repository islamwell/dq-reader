#!/usr/bin/env node

/**
 * Convert Palm Tree SVG to PNG Icon
 *
 * This script converts the palm tree SVG to a 1024x1024 PNG for icon generation
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public', 'icons', 'palmtree-madinah.svg');
const outputPath = join(projectRoot, 'resources', 'icon.png');

console.log('🌴 Converting palm tree SVG to PNG icon...');

try {
  const svgBuffer = readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(outputPath);

  console.log('✅ Icon created successfully at:', outputPath);
  console.log('📱 You can now run: npm run generate:icons');
} catch (error) {
  console.error('❌ Error converting SVG to PNG:', error);
  process.exit(1);
}
