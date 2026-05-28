/**
 * Helper to strip emojis from a string.
 */
export const stripEmojis = (str) => {
  if (!str) return ''
  return str.replace(/[\u2600-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF]/g, '').trim()
}
