"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Base skeleton component
const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-slate-100 dark:bg-slate-800",
        card: "bg-white dark:bg-slate-900 shadow-sm border",
        text: "bg-slate-200 dark:bg-slate-700",
        avatar: "rounded-full bg-slate-200 dark:bg-slate-700",
        button: "bg-slate-200 dark:bg-slate-700 rounded-lg",
      },
      size: {
        sm: "h-4",
        default: "h-6", 
        lg: "h-8",
        xl: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Specialized skeleton components
interface CardSkeletonProps {
  showImage?: boolean
  lines?: number
  className?: string
}

function CardSkeleton({ showImage = true, lines = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-4 p-6 border rounded-lg", className)}>
      {showImage && (
        <Skeleton variant="default" className="h-[200px] w-full" />
      )}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-3 w-full" />
        ))}
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function ScanResultSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-start space-x-4">
          <Skeleton variant="avatar" className="w-16 h-16" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            <div className="flex space-x-2">
              <Skeleton variant="button" className="h-6 w-20" />
              <Skeleton variant="button" className="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Analysis results skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} showImage={false} lines={2} />
        ))}
      </div>

      {/* Recommendations skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 border rounded-lg">
              <Skeleton variant="avatar" className="w-8 h-8" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-3 w-full" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScanListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton variant="avatar" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-1/3" />
            <Skeleton variant="text" className="h-3 w-full" />
            <Skeleton variant="text" className="h-3 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="button" className="h-6 w-16" />
            <Skeleton variant="text" className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center space-x-6 p-6 border rounded-lg">
        <Skeleton variant="avatar" className="w-24 h-24" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-4 w-64" />
          <div className="flex space-x-2">
            <Skeleton variant="button" className="h-8 w-24" />
            <Skeleton variant="button" className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg text-center space-y-2">
            <Skeleton variant="text" className="h-8 w-16 mx-auto" />
            <Skeleton variant="text" className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-32" />
        <ScanListSkeleton count={3} />
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex space-x-4 p-3 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton 
                variant="text" 
                className={cn(
                  "h-3",
                  colIndex === 0 && "w-3/4", // First column shorter
                  colIndex === cols - 1 && "w-1/2" // Last column shorter
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  skeletonVariants,
  CardSkeleton,
  ScanResultSkeleton,
  ScanListSkeleton,
  ProfileSkeleton,
  TableSkeleton,
  type SkeletonProps 
} 