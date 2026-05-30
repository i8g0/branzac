import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { springSoft } from '../../lib/motion'
import { BLUR_PLACEHOLDER } from '../../lib/imagePlaceholder'

/**
 * Blur-up image with reserved aspect box — zero layout shift on load.
 */
export default function PremiumImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  aspectRatio = '4/3',
  priority = false,
  placeholderSrc = BLUR_PLACEHOLDER,
}) {
  const [loaded, setLoaded] = useState(false)

  const onLoad = useCallback(() => setLoaded(true), [])

  return (
    <div
      className={`premium-image ${loaded ? 'premium-image--loaded' : ''} ${wrapperClassName}`}
      style={{ aspectRatio }}
      aria-busy={!loaded}
    >
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="premium-image__placeholder"
          decoding="async"
        />
      )}
      {!loaded && <div className="premium-image__shimmer" aria-hidden="true" />}
      <motion.img
        src={src}
        alt={alt}
        className={`premium-image__img ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={onLoad}
        initial={false}
        animate={{
          opacity: loaded ? 1 : 0,
          filter: loaded ? 'blur(0px)' : 'blur(12px)',
          scale: loaded ? 1 : 1.03,
        }}
        transition={springSoft}
      />
    </div>
  )
}
