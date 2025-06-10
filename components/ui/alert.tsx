import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X,
  Lightbulb,
  Heart 
} from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border border-border px-4 py-3 text-sm transition-all duration-300 ease-in-out [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive bg-destructive/5 dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-500/50 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-yellow-500/50 text-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-500/50 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info:
          "border-blue-500/50 text-blue-800 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-500/50 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        tip:
          "border-purple-500/50 text-purple-800 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-500/50 [&>svg]:text-purple-600 dark:[&>svg]:text-purple-400",
      },
      size: {
        sm: "px-3 py-2 text-xs [&>svg]:w-4 [&>svg]:h-4 [&>svg]:top-2.5",
        default: "px-4 py-3 text-sm [&>svg]:w-4 [&>svg]:h-4 [&>svg]:top-4",
        lg: "px-6 py-4 text-base [&>svg]:w-5 [&>svg]:h-5 [&>svg]:top-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean
    onDismiss?: () => void
    icon?: React.ReactNode
    animate?: boolean
  }
>(({ 
  className, 
  variant, 
  size,
  dismissible = false,
  onDismiss,
  icon,
  animate = true,
  children,
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(true)
  
  const handleDismiss = () => {
    if (animate) {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(), 200)
    } else {
      onDismiss?.()
    }
  }

  const getDefaultIcon = (variant?: VariantProps<typeof alertVariants>["variant"]) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      case "tip":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  if (!isVisible && animate) {
    return (
      <div
        className={cn(
          alertVariants({ variant, size }),
          "animate-slide-up opacity-0 scale-95 transition-all duration-200",
          className
        )}
      />
    )
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant, size }),
        animate && "animate-fade-in",
        !isVisible && "opacity-0 scale-95",
        className
      )}
      {...props}
    >
      {(icon !== null) && (icon || getDefaultIcon(variant))}
      
      <div className="flex-1">
        {children}
      </div>
      
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity duration-200"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  }
>(({ className, as: Comp = "h5", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Specialized alert components with friendly messaging
const SuccessAlert: React.FC<{
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({ title, children, dismissible, onDismiss, className }) => (
  <Alert 
    variant="success" 
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
  >
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{children}</AlertDescription>
  </Alert>
)

const ErrorAlert: React.FC<{
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({ title = "Oops! Something went wrong", children, dismissible, onDismiss, className }) => (
  <Alert 
    variant="destructive" 
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </Alert>
)

const WarningAlert: React.FC<{
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({ title = "Just a heads up", children, dismissible, onDismiss, className }) => (
  <Alert 
    variant="warning" 
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
  >
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{children}</AlertDescription>
  </Alert>
)

const InfoAlert: React.FC<{
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({ title, children, dismissible, onDismiss, className }) => (
  <Alert 
    variant="info" 
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
  >
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{children}</AlertDescription>
  </Alert>
)

const TipAlert: React.FC<{
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({ title = "Pro tip", children, dismissible, onDismiss, className }) => (
  <Alert 
    variant="tip" 
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </Alert>
)

const LoadingAlert: React.FC<{
  title?: string
  children?: React.ReactNode
  className?: string
}> = ({ title = "Just a moment...", children = "We're processing your request.", className }) => (
  <Alert variant="info" icon={null} className={className}>
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{children}</AlertDescription>
      </div>
    </div>
  </Alert>
)

export { 
  Alert, 
  AlertTitle, 
  AlertDescription,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  TipAlert,
  LoadingAlert,
  alertVariants 
} 