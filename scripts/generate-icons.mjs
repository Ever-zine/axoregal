/**
 * Génère les icônes PNG PWA depuis public/icons/icon.svg
 * Usage : pnpm icons
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dirname, '../public/icons/icon.svg')
const svgBuffer = readFileSync(svgPath)

const targets = [
  { file: 'icon-192.png',        size: 192 },
  { file: 'icon-512.png',        size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32.png',      size: 32  },
]

for (const { file, size } of targets) {
  const out = resolve(__dirname, `../public/icons/${file}`)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(out)
  console.log(`✓ ${file} (${size}x${size})`)
}

console.log('\nIcônes générées dans public/icons/')
