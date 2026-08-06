import { useState, useCallback, useEffect, useRef } from 'react'
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
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [src])

  const onLoad = useCallback(() => setLoaded(true), [])

  return (
    <div
      className={`premium-image ${loaded ? 'premium-image--loaded' : ''} ${wrapperClassName}`}
      style={{ aspectRatio }}
      aria-busy={!loaded}
    >
      {placeholderSrc && !loaded && (
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
        ref={imgRef}
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
          filter: loaded ? 'blur(0px)' : 'blur(10px)',
          scale: loaded ? 1 : 1.02,
        }}
        transition={springSoft}
      />
    </div>
  )
}

