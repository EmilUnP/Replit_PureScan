"use client"

import React, { Suspense, lazy, ComponentType } from 'react'
import { useLazyLoad } from '@/lib/hooks/use-lazy-load'
import { Skeleton } from './skeleton'

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  children: React.ReactNode
}

export function LazyComponent({
  fallback = <Skeleton className="h-20 w-full" />,
  className = "",
  threshold = 0.1,
  rootMargin = "50px",
  children
}: LazyComponentProps) {
  const { ref, isIntersecting } = useLazyLoad({
    threshold,
    rootMargin,
  })

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  )
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyWrapper = (props: P) => {
    return (
      <LazyComponent fallback={fallback}>
        <Component {...props} />
      </LazyComponent>
    )
  }

  LazyWrapper.displayName = `LazyLoaded(${Component.displayName || Component.name})`
  return LazyWrapper
}

// Dynamic import wrapper with error boundary
interface DynamicComponentProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  className?: string
  [key: string]: any
}

export function DynamicComponent({
  importFunc,
  fallback = <Skeleton className="h-20 w-full" />,
  errorFallback = <div className="text-red-500">Failed to load component</div>,
  className = "",
  ...props
}: DynamicComponentProps) {
  const LazyComponent = lazy(importFunc)

  return (
    <div className={className}>
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Pre-built lazy components for common use cases
export const LazyImage = withLazyLoading(
  ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  ),
  <Skeleton className="h-48 w-full" />
)

export const LazyVideo = withLazyLoading(
  ({ src, className, ...props }: React.VideoHTMLAttributes<HTMLVideoElement>) => (
    <video 
      src={src} 
      className={className}
      preload="none"
      {...props}
    />
  ),
  <Skeleton className="h-48 w-full" />
)

// Intersection observer image with loading states
interface LazyImageWithStatesProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export function LazyImageWithStates({
  src,
  alt,
  className,
  fallback = <Skeleton className="h-48 w-full" />,
  errorFallback = <div className="flex items-center justify-center h-48 bg-gray-100 text-gray-500">Failed to load image</div>,
  ...props
}: LazyImageWithStatesProps) {
  const { ref, isIntersecting } = useLazyLoad()
  const [imageState, setImageState] = React.useState<'loading' | 'loaded' | 'error'>('loading')

  const handleLoad = () => setImageState('loaded')
  const handleError = () => setImageState('error')

  if (!isIntersecting) {
    return <div ref={ref} className={className}>{fallback}</div>
  }

  if (imageState === 'error') {
    return <div className={className}>{errorFallback}</div>
  }

  return (
    <div ref={ref} className={className}>
      {imageState === 'loading' && fallback}
      <img
        src={src}
        alt={alt}
        className={imageState === 'loaded' ? 'block' : 'hidden'}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  )
} 