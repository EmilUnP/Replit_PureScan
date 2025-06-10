import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X, Check, AlertTriangle, Info } from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  onRemove?: () => void
  disabled?: boolean
  interactive?: boolean
}

function Badge({ 
  className, 
  variant, 
  size,
  icon,
  onRemove,
  disabled,
  interactive,
  children,
  onClick,
  ...props 
}: BadgeProps) {
  const isInteractive = interactive || !!onClick

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        disabled && "opacity-50 cursor-not-allowed",
        isInteractive && "cursor-pointer hover:scale-105",
        className
      )}
      onClick={handleClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {icon && (
        <span className="mr-1" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onRemove()
          }}
          disabled={disabled}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none dark:hover:bg-white/10"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  )
}

// Specialized badge components for common use cases
const StatusBadge: React.FC<{
  status: "success" | "warning" | "error" | "info" | "pending" | "active" | "inactive"
  children?: React.ReactNode
  size?: VariantProps<typeof badgeVariants>["size"]
  className?: string
}> = ({ status, children, size, className }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return { variant: "success" as const, icon: <Check className="h-3 w-3" />, text: "Success" }
      case "warning":
        return { variant: "warning" as const, icon: <AlertTriangle className="h-3 w-3" />, text: "Warning" }
      case "error":
        return { variant: "destructive" as const, icon: <X className="h-3 w-3" />, text: "Error" }
      case "info":
        return { variant: "info" as const, icon: <Info className="h-3 w-3" />, text: "Info" }
      case "pending":
        return { variant: "warning" as const, icon: null, text: "Pending" }
      case "active":
        return { variant: "success" as const, icon: null, text: "Active" }
      case "inactive":
        return { variant: "secondary" as const, icon: null, text: "Inactive" }
      default:
        return { variant: "default" as const, icon: null, text: status }
    }
  }

  const config = getStatusConfig(status)
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
      className={className}
    >
      {children || config.text}
    </Badge>
  )
}

const ScoreBadge: React.FC<{
  score: number
  maxScore?: number
  showIcon?: boolean
  size?: VariantProps<typeof badgeVariants>["size"]
  className?: string
}> = ({ score, maxScore = 100, showIcon = true, size, className }) => {
  const percentage = (score / maxScore) * 100
  
  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return "success"
    if (percentage >= 60) return "warning" 
    return "destructive"
  }

  const getScoreIcon = (percentage: number) => {
    if (!showIcon) return null
    if (percentage >= 80) return <Check className="h-3 w-3" />
    if (percentage >= 60) return <AlertTriangle className="h-3 w-3" />
    return <X className="h-3 w-3" />
  }

  return (
    <Badge
      variant={getScoreVariant(percentage)}
      size={size}
      icon={getScoreIcon(percentage)}
      className={className}
    >
      {score}{maxScore === 100 ? "%" : `/${maxScore}`}
    </Badge>
  )
}

const CountBadge: React.FC<{
  count: number
  max?: number
  size?: VariantProps<typeof badgeVariants>["size"]
  variant?: VariantProps<typeof badgeVariants>["variant"]
  className?: string
}> = ({ count, max, size, variant = "default", className }) => {
  const displayCount = max && count > max ? `${max}+` : count.toString()
  
  return (
    <Badge
      variant={variant}
      size={size}
      className={cn("tabular-nums", className)}
    >
      {displayCount}
    </Badge>
  )
}

const TagBadge: React.FC<{
  children: React.ReactNode
  onRemove?: () => void
  disabled?: boolean
  size?: VariantProps<typeof badgeVariants>["size"]
  className?: string
}> = ({ children, onRemove, disabled, size, className }) => (
  <Badge
    variant="outline"
    size={size}
    onRemove={onRemove}
    disabled={disabled}
    interactive={!onRemove}
    className={className}
  >
    {children}
  </Badge>
)

export { 
  Badge, 
  StatusBadge, 
  ScoreBadge, 
  CountBadge, 
  TagBadge, 
  badgeVariants 
} 