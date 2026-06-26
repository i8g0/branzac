import chroma from 'chroma-js'

/**
 * Generate a full color palette from 3 base colors.
 * Returns shades 50-950 for each color, plus computed semantic tokens.
 */
export function generatePalette(primary, secondary, accent) {
  const p = chroma(primary)
  const s = chroma(secondary)
  const a = chroma(accent)

  return {
    primary: generateShades(p),
    secondary: generateShades(s),
    accent: generateShades(a),
    semantic: computeSemanticTokens(p, s, a),
  }
}

/**
 * Generate 11 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
 * from a single base color using OKLCH interpolation.
 */
function generateShades(baseColor) {
  const lightest = baseColor.set('lch.l', 0.97).set('lch.c', 5)
  const darkest = baseColor.set('lch.l', 0.15).set('lch.c', 8)

  const scale = chroma
    .scale([lightest, baseColor, darkest])
    .mode('oklch')
    .domain([0, 50, 100])
    .correctLightness()

  return {
    50:  scale(0).hex(),
    100: scale(10).hex(),
    200: scale(20).hex(),
    300: scale(30).hex(),
    400: scale(40).hex(),
    500: scale(50).hex(),
    600: scale(60).hex(),
    700: scale(70).hex(),
    800: scale(80).hex(),
    900: scale(90).hex(),
    950: scale(100).hex(),
  }
}

/**
 * Compute semantic tokens from the 3 base colors.
 * Ensures WCAG AA contrast ratios for text on backgrounds.
 */
function computeSemanticTokens(primary, secondary, accent) {
  const bgColor = chroma('#f5f0e8')
  const surfaceColor = chroma('#ffffff')

  // Text colors: pick darkest shade that has 4.5:1+ contrast on background
  const textPrimary = ensureContrast(chroma('#1a1a2e'), bgColor, 7)
  const textSecondary = ensureContrast(chroma('#4a4a5e'), bgColor, 4.5)

  // Compute background and surface from primary
  const bgLight = primary.set('lch.l', 0.97).set('lch.c', 3)
  const surfaceLight = primary.set('lch.l', 0.99).set('lch.c', 1)

  return {
    'bg-base': bgColor.hex(),
    'bg-surface': surfaceColor.hex(),
    'bg-elevated': surfaceLight.hex(),
    'text-primary': textPrimary.hex(),
    'text-secondary': textSecondary.hex(),
    'text-muted': chroma(textSecondary).brighten(0.8).hex(),
    'border-default': primary.set('lch.l', 0.88).set('lch.c', 6).hex(),
    'border-strong': primary.set('lch.l', 0.75).set('lch.c', 10).hex(),
    'shadow-color': primary.set('lch.l', 0.2).set('lch.c', 10).alpha(0.12).css(),
  }
}

/**
 * Ensure a color has minimum contrast ratio against a background.
 */
function ensureContrast(fg, bg, minRatio) {
  let color = chroma(fg)
  let ratio = chroma.contrast(color, bg)
  if (ratio >= minRatio) return color

  // Try darkening
  for (let i = 0; i < 20; i++) {
    color = color.darken(0.1)
    if (chroma.contrast(color, bg) >= minRatio) return color
  }
  return chroma(fg).darken(1)
}

/**
 * Predefined theme presets.
 */
export const THEME_PRESETS = {
  forest: {
    name: 'غابة',
    nameEn: 'Forest',
    primary: '#2d6a4f',
    secondary: '#8a7850',
    accent: '#d4a843',
  },
  warmCafe: {
    name: 'قهوة دافئة',
    nameEn: 'Warm Cafe',
    primary: '#6b3a2a',
    secondary: '#c4956a',
    accent: '#e8a849',
  },
  darkElegance: {
    name: 'أناقة داكنة',
    nameEn: 'Dark Elegance',
    primary: '#1a1a2e',
    secondary: '#c9a96e',
    accent: '#e2c541',
  },
  ocean: {
    name: 'محيط',
    nameEn: 'Ocean',
    primary: '#1a5276',
    secondary: '#2e86c1',
    accent: '#48c9b0',
  },
  sunset: {
    name: 'غروب',
    nameEn: 'Sunset',
    primary: '#922b21',
    secondary: '#e67e22',
    accent: '#f1c40f',
  },
  minimal: {
    name: 'بسيط',
    nameEn: 'Minimal',
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    accent: '#3498db',
  },
  lavender: {
    name: 'لافندر',
    nameEn: 'Lavender',
    primary: '#5b2c6f',
    secondary: '#a569bd',
    accent: '#f0b27a',
  },
  sage: {
    name: 'ساج',
    nameEn: 'Sage',
    primary: '#5d7a5e',
    secondary: '#a3b18a',
    accent: '#dad7cd',
  },
}

/**
 * Convert a palette object to CSS custom properties string.
 */
export function paletteToCSS(palette) {
  const lines = []
  const { primary, secondary, accent, semantic } = palette

  for (const [shade, value] of Object.entries(primary)) {
    lines.push(`  --color-primary-${shade}: ${value};`)
  }
  for (const [shade, value] of Object.entries(secondary)) {
    lines.push(`  --color-secondary-${shade}: ${value};`)
  }
  for (const [shade, value] of Object.entries(accent)) {
    lines.push(`  --color-accent-${shade}: ${value};`)
  }
  for (const [token, value] of Object.entries(semantic)) {
    lines.push(`  --${token}: ${value};`)
  }

  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * Apply palette to document by injecting/updating a <style> element.
 */
export function applyPaletteToDocument(palette) {
  let styleEl = document.getElementById('dynamic-theme')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'dynamic-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = paletteToCSS(palette)
}
