import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        outline:
          "border-2 border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost: 
          "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/60",
        success:
          "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        warning:
          "bg-yellow-500 text-yellow-900 shadow-md hover:bg-yellow-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        info:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        gradient:
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] active:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 py-1 text-xs",
        lg: "h-12 rounded-lg px-6 py-3 text-base font-semibold",
        xl: "h-14 rounded-lg px-8 py-4 text-lg font-semibold",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <LoadingSpinner 
            size="sm" 
            className="text-current" 
            aria-hidden="true" 
          />
        )}
        
        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className={cn("flex items-center gap-2", loading && "opacity-70")}>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {/* Hover effect overlay */}
        <span 
          className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100 rounded-[inherit]" 
          aria-hidden="true"
        />
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 