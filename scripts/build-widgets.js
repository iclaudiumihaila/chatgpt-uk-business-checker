/**
 * Widget Builder Script
 * Copies widget HTML files from src/widgets to public directory
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const widgets = [
  {
    source: 'src/widgets/search-carousel/index.html',
    dest: 'public/search-carousel.html'
  },
  {
    source: 'src/widgets/company-card/index.html',
    dest: 'public/company-card.html'
  }
];

console.log('🔨 Building widgets...\n');

// Ensure public directory exists
const publicDir = join(projectRoot, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public/ directory');
}

// Copy widget files
widgets.forEach(({ source, dest }) => {
  const sourcePath = join(projectRoot, source);
  const destPath = join(projectRoot, dest);

  try {
    copyFileSync(sourcePath, destPath);
    console.log(`✅ Built: ${source} → ${dest}`);
  } catch (error) {
    console.error(`❌ Failed to build ${source}:`, error.message);
    process.exit(1);
  }
});

console.log('\n✨ Widget build complete!\n');
