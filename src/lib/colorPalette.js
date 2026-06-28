import chroma from 'chroma-js'

/**
 * Generate a COMPLETE brand identity palette from base colors.
 * Returns shades 50-950 for each color, plus full semantic/UI tokens.
 */
export function generatePalette(colors) {
  const {
    primary, secondary, accent,
    success, warning, danger, info,
    navbar, sidebar, card,
  } = colors

  const p = chroma(primary)
  const s = chroma(secondary)
  const a = chroma(accent)
  const su = chroma(success || '#16a34a')
  const w = chroma(warning || '#d97706')
  const d = chroma(danger || '#dc2626')
  const i = chroma(info || '#2563eb')
  const nb = chroma(navbar || primary)
  const sb = chroma(sidebar || primary)
  const c = chroma(card || '#ffffff')

  return {
    primary: generateShades(p),
    secondary: generateShades(s),
    accent: generateShades(a),
    success: generateShades(su),
    warning: generateShades(w),
    danger: generateShades(d),
    info: generateShades(i),
    navbar: generateShades(nb),
    sidebar: generateShades(sb),
    card: generateShades(c),
    semantic: computeSemanticTokens(p, s, a, nb),
    buttons: computeButtonTokens(p, s, a),
    badges: computeBadgeTokens(su, w, d, i),
  }
}

/**
 * Generate 11 shades (50→950) from a base color.
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
 * Compute full semantic tokens.
 */
function computeSemanticTokens(primary, secondary, accent, navbar) {
  const bgColor = chroma('#f5f0e8')
  const surfaceColor = chroma('#ffffff')

  const textPrimary = ensureContrast(chroma('#1a1a2e'), bgColor, 7)
  const textSecondary = ensureContrast(chroma('#4a4a5e'), bgColor, 4.5)

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
 * Compute button-specific tokens — ensures buttons always look consistent.
 */
function computeButtonTokens(primary, secondary, accent) {
  // Primary button: use primary-600 as bg, white text, darker on hover
  const pBg = primary.set('lch.l', 0.42).set('lch.c', 0.12)
  const pHover = primary.set('lch.l', 0.35).set('lch.c', 0.13)
  const pActive = primary.set('lch.l', 0.28).set('lch.c', 0.14)
  const pText = chroma.white
  const pDisabled = primary.set('lch.l', 0.82).set('lch.c', 0.04)

  // Secondary button: use secondary-500 as bg
  const sBg = secondary.set('lch.l', 0.55).set('lch.c', 0.08)
  const sHover = secondary.set('lch.l', 0.48).set('lch.c', 0.09)
  const sActive = secondary.set('lch.l', 0.40).set('lch.c', 0.10)
  const sText = ensureContrast(chroma.white, sBg, 4.5)
  const sDisabled = secondary.set('lch.l', 0.85).set('lch.c', 0.03)

  // Outline button: transparent bg, primary border + text
  const oBg = 'transparent'
  const oBorder = primary.set('lch.l', 0.50).set('lch.c', 0.10)
  const oText = primary.set('lch.l', 0.40).set('lch.c', 0.11)
  const oHover = primary.set('lch.l', 0.95).set('lch.c', 0.03)
  const oActive = primary.set('lch.l', 0.90).set('lch.c', 0.05)

  // Accent button
  const aBg = accent.set('lch.l', 0.62).set('lch.c', 0.09)
  const aHover = accent.set('lch.l', 0.55).set('lch.c', 0.10)
  const aActive = accent.set('lch.l', 0.48).set('lch.c', 0.11)
  const aText = ensureContrast(chroma.white, aBg, 4.5)

  // Ghost button
  const gBg = 'transparent'
  const gText = primary.set('lch.l', 0.40).set('lch.c', 0.11)
  const gHover = primary.set('lch.l', 0.95).set('lch.c', 0.03)
  const gActive = primary.set('lch.l', 0.90).set('lch.c', 0.05)

  return {
    'btn-primary-bg': pBg.hex(),
    'btn-primary-bg-hover': pHover.hex(),
    'btn-primary-bg-active': pActive.hex(),
    'btn-primary-text': pText.hex(),
    'btn-primary-disabled': pDisabled.hex(),

    'btn-secondary-bg': sBg.hex(),
    'btn-secondary-bg-hover': sHover.hex(),
    'btn-secondary-bg-active': sActive.hex(),
    'btn-secondary-text': sText.hex(),
    'btn-secondary-disabled': sDisabled.hex(),

    'btn-outline-bg': oBg,
    'btn-outline-border': oBorder.hex(),
    'btn-outline-text': oText.hex(),
    'btn-outline-bg-hover': oHover.hex(),
    'btn-outline-bg-active': oActive.hex(),

    'btn-accent-bg': aBg.hex(),
    'btn-accent-bg-hover': aHover.hex(),
    'btn-accent-bg-active': aActive.hex(),
    'btn-accent-text': aText.hex(),

    'btn-ghost-bg': gBg,
    'btn-ghost-text': gText.hex(),
    'btn-ghost-bg-hover': gHover.hex(),
    'btn-ghost-bg-active': gActive.hex(),
  }
}

/**
 * Compute badge/status tokens.
 */
function computeBadgeTokens(success, warning, danger, info) {
  return {
    'badge-success-bg': success.set('lch.l', 0.93).set('lch.c', 0.04).hex(),
    'badge-success-text': success.set('lch.l', 0.35).set('lch.c', 0.12).hex(),
    'badge-warning-bg': warning.set('lch.l', 0.93).set('lch.c', 0.04).hex(),
    'badge-warning-text': warning.set('lch.l', 0.40).set('lch.c', 0.12).hex(),
    'badge-danger-bg': danger.set('lch.l', 0.93).set('lch.c', 0.04).hex(),
    'badge-danger-text': danger.set('lch.l', 0.38).set('lch.c', 0.14).hex(),
    'badge-info-bg': info.set('lch.l', 0.93).set('lch.c', 0.04).hex(),
    'badge-info-text': info.set('lch.l', 0.40).set('lch.c', 0.12).hex(),
  }
}

function ensureContrast(fg, bg, minRatio) {
  let color = chroma(fg)
  let ratio = chroma.contrast(color, bg)
  if (ratio >= minRatio) return color
  for (let i = 0; i < 20; i++) {
    color = color.darken(0.1)
    if (chroma.contrast(color, bg) >= minRatio) return color
  }
  return chroma(fg).darken(1)
}

/**
 * FULL brand identity presets — each has ALL color slots filled.
 */
export const THEME_PRESETS = {
  forest: {
    name: 'غابة عربية',
    nameEn: 'Arabic Forest',
    primary: '#2d6a4f',
    secondary: '#8a7850',
    accent: '#d4a843',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb',
    navbar: '#1a2e1a',
    sidebar: '#2d6a4f',
    card: '#ffffff',
  },
  desertGold: {
    name: 'صحراء ذهبية',
    nameEn: 'Desert Gold',
    primary: '#92702a',
    secondary: '#c4956a',
    accent: '#e8a849',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#b91c1c',
    info: '#0369a1',
    navbar: '#3d2e10',
    sidebar: '#92702a',
    card: '#fffdf5',
  },
  warmCafe: {
    name: 'قهوة دافئة',
    nameEn: 'Warm Cafe',
    primary: '#6b3a2a',
    secondary: '#c4956a',
    accent: '#e8a849',
    success: '#15803d',
    warning: '#b45309',
    danger: '#b91c1c',
    info: '#1d4ed8',
    navbar: '#3b1f15',
    sidebar: '#6b3a2a',
    card: '#fffdf8',
  },
  darkElegance: {
    name: 'أناقة داكنة',
    nameEn: 'Dark Elegance',
    primary: '#1a1a2e',
    secondary: '#c9a96e',
    accent: '#e2c541',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    navbar: '#0f0f1a',
    sidebar: '#1a1a2e',
    card: '#ffffff',
  },
  ocean: {
    name: 'محيط',
    nameEn: 'Ocean',
    primary: '#1a5276',
    secondary: '#2e86c1',
    accent: '#48c9b0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    navbar: '#0c2d48',
    sidebar: '#1a5276',
    card: '#f0f9ff',
  },
  sunset: {
    name: 'غروب',
    nameEn: 'Sunset',
    primary: '#922b21',
    secondary: '#e67e22',
    accent: '#f1c40f',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#b91c1c',
    info: '#7c3aed',
    navbar: '#4a1510',
    sidebar: '#922b21',
    card: '#fffdf5',
  },
  minimal: {
    name: 'بسيط',
    nameEn: 'Minimal',
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    accent: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#3498db',
    navbar: '#1a252f',
    sidebar: '#2c3e50',
    card: '#ffffff',
  },
  lavender: {
    name: 'لافندر',
    nameEn: 'Lavender',
    primary: '#5b2c6f',
    secondary: '#a569bd',
    accent: '#f0b27a',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#c0392b',
    info: '#8e44ad',
    navbar: '#2e1440',
    sidebar: '#5b2c6f',
    card: '#fdf5ff',
  },
  sage: {
    name: 'ساج',
    nameEn: 'Sage',
    primary: '#5d7a5e',
    secondary: '#a3b18a',
    accent: '#dad7cd',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    navbar: '#2d3a2e',
    sidebar: '#5d7a5e',
    card: '#f8faf5',
  },
  royal: {
    name: 'ملكي',
    nameEn: 'Royal',
    primary: '#1e3a5f',
    secondary: '#c9a96e',
    accent: '#d4af37',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#b91c1c',
    info: '#2563eb',
    navbar: '#0f1f33',
    sidebar: '#1e3a5f',
    card: '#fffdf5',
  },
  roseGold: {
    name: 'وردي ذهبي',
    nameEn: 'Rose Gold',
    primary: '#8b4557',
    secondary: '#c9a0a0',
    accent: '#d4a843',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#7c3aed',
    navbar: '#4a2030',
    sidebar: '#8b4557',
    card: '#fff8f8',
  },
  turquoise: {
    name: 'فيروزي',
    nameEn: 'Turquoise',
    primary: '#0d9488',
    secondary: '#5eead4',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    navbar: '#042f2e',
    sidebar: '#0d9488',
    card: '#f0fdfa',
  },
  mocha: {
    name: 'موكا',
    nameEn: 'Mocha',
    primary: '#4a3728',
    secondary: '#a0845c',
    accent: '#d4a843',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#b91c1c',
    info: '#0369a1',
    navbar: '#2a1f18',
    sidebar: '#4a3728',
    card: '#fffdf5',
  },
}

/**
 * Convert a full palette object to CSS custom properties.
 */
export function paletteToCSS(palette) {
  const lines = []
  const colorGroups = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'navbar', 'sidebar', 'card']

  for (const group of colorGroups) {
    if (palette[group]) {
      for (const [shade, value] of Object.entries(palette[group])) {
        lines.push(`  --color-${group}-${shade}: ${value};`)
      }
    }
  }

  if (palette.semantic) {
    for (const [token, value] of Object.entries(palette.semantic)) {
      lines.push(`  --${token}: ${value};`)
    }
  }

  if (palette.buttons) {
    for (const [token, value] of Object.entries(palette.buttons)) {
      lines.push(`  --${token}: ${value};`)
    }
  }

  if (palette.badges) {
    for (const [token, value] of Object.entries(palette.badges)) {
      lines.push(`  --${token}: ${value};`)
    }
  }

  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * Apply palette to document.
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
