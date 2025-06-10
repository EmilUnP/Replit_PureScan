import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-solid border-transparent",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-2",
        "2xl": "h-16 w-16 border-4",
      },
      variant: {
        default: "border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30",
        secondary: "border-t-secondary-foreground border-r-secondary-foreground/30 border-b-secondary-foreground/30 border-l-secondary-foreground/30",
        white: "border-t-white border-r-white/30 border-b-white/30 border-l-white/30",
        muted: "border-t-muted-foreground border-r-muted-foreground/30 border-b-muted-foreground/30 border-l-muted-foreground/30",
        success: "border-t-green-600 border-r-green-600/30 border-b-green-600/30 border-l-green-600/30",
        warning: "border-t-yellow-500 border-r-yellow-500/30 border-b-yellow-500/30 border-l-yellow-500/30",
        destructive: "border-t-destructive border-r-destructive/30 border-b-destructive/30 border-l-destructive/30",
        gradient: "border-t-purple-600 border-r-purple-600/30 border-b-blue-600/30 border-l-blue-600",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const pulseVariants = cva(
  "animate-pulse rounded-full bg-current",
  {
    variants: {
      size: {
        xs: "h-2 w-2",
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface LoadingSpinnerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  type?: "spinner" | "pulse" | "dots" | "bars"
  text?: string
  fullScreen?: boolean
  overlay?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size, 
    variant, 
    type = "spinner",
    text,
    fullScreen = false,
    overlay = false,
    ...props 
  }, ref) => {
    const renderSpinner = () => {
      switch (type) {
        case "pulse":
          return (
            <div className={cn(pulseVariants({ size }), variant === "white" && "text-white", variant === "muted" && "text-muted-foreground")} />
          )
        
        case "dots":
          return (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    pulseVariants({ size }),
                    variant === "white" && "bg-white",
                    variant === "muted" && "bg-muted-foreground",
                    variant === "default" && "bg-primary",
                    "animate-pulse"
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          )
        
        case "bars":
          return (
            <div className="flex items-end gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "animate-pulse rounded-sm",
                    size === "xs" && "w-0.5 h-2",
                    size === "sm" && "w-0.5 h-3",
                    size === "default" && "w-1 h-4",
                    size === "lg" && "w-1 h-6",
                    size === "xl" && "w-1.5 h-8",
                    size === "2xl" && "w-2 h-12",
                    variant === "white" && "bg-white",
                    variant === "muted" && "bg-muted-foreground",
                    variant === "default" && "bg-primary",
                  )}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "1.2s",
                  }}
                />
              ))}
            </div>
          )
        
        default:
          return (
            <div 
              className={cn(spinnerVariants({ size, variant }), className)}
              role="status"
              aria-label="Loading"
            />
          )
      }
    }

    const content = (
      <div 
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          text && "flex-col gap-2",
          fullScreen && "fixed inset-0 z-50",
          overlay && "bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {renderSpinner()}
        {text && (
          <span 
            className={cn(
              "text-sm font-medium",
              variant === "white" && "text-white",
              variant === "muted" && "text-muted-foreground",
              variant === "default" && "text-foreground"
            )}
          >
            {text}
          </span>
        )}
      </div>
    )

    if (fullScreen) {
      return content
    }

    return content
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

// Specialized loading components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <LoadingSpinner 
    fullScreen 
    overlay 
    size="xl" 
    text={text} 
    className="min-h-[200px]"
  />
)

export const InlineLoader: React.FC<{ size?: VariantProps<typeof spinnerVariants>["size"] }> = ({ 
  size = "sm" 
}) => (
  <LoadingSpinner size={size} className="inline-flex" />
)

export const CardLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center p-8 min-h-[120px]">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

export const ButtonLoader: React.FC = () => (
  <LoadingSpinner size="sm" variant="white" className="text-current" />
)

export { LoadingSpinner, spinnerVariants } 