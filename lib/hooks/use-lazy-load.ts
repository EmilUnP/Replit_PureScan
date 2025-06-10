import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

export function useLazyLoad({
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true
}: UseLazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || hasIntersected) return

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          setHasIntersected(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, enabled, hasIntersected])

  return {
    ref,
    isIntersecting: hasIntersected || isIntersecting,
    hasIntersected,
  }
} 