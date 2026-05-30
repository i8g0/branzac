/** Tiny earth-tone SVG — instant blur-up while full image loads */
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 6">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e8e4dc"/>
          <stop offset="100%" stop-color="#d4cfc4"/>
        </linearGradient>
      </defs>
      <rect width="8" height="6" fill="url(#g)"/>
    </svg>`
  )
