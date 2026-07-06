/**
 * Input sanitization utilities for user-facing forms and DB-sourced content.
 */

/**
 * Sanitize a URL intended for use in CSS background-image or img src.
 * Only allows http:, https:, and data: protocols.
 */
export function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) return ''
    // Strip CSS-injection characters
    return url.replace(/['"()\\]/g, '')
  } catch {
    return ''
  }
}

/**
 * Strip HTML tags and limit length for text inputs.
 */
export function sanitizeText(str, maxLength = 500) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength).replace(/<[^>]*>/g, '')
}

/**
 * Allow only digits, +, -, (), and spaces for phone numbers.
 */
export function sanitizePhone(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().replace(/[^\d+\-() ]/g, '').slice(0, 20)
}
