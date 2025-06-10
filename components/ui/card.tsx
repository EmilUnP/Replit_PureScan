import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border border-border bg-card text-card-foreground transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg",
        interactive: "shadow-sm hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98] active:shadow-sm",
        outlined: "border-2 shadow-none hover:border-primary/50 hover:shadow-sm",
        ghost: "border-transparent shadow-none hover:bg-accent/50 hover:shadow-sm",
        gradient: "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-sm hover:shadow-md",
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & {
    asChild?: boolean
    loading?: boolean
    spacing?: "none" | "sm" | "default" | "lg" | "xl"
  }
>(({ className, variant, size, spacing, loading, children, asChild, ...props }, ref) => {
  const Component = asChild ? React.Fragment : "div"
  
  const getSpacingClass = (spacing?: "none" | "sm" | "default" | "lg" | "xl") => {
    switch (spacing) {
      case "none": return "p-0"
      case "sm": return "p-3"
      case "default": return "p-4"
      case "lg": return "p-6"
      case "xl": return "p-8"
      default: return ""
    }
  }
  
  if (loading) {
    return (
      <div 
        ref={ref}
        className={cn(
          cardVariants({ variant: "default", size }),
          spacing && getSpacingClass(spacing),
          "animate-pulse bg-muted/50",
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (asChild) {
    return <>{children}</>
  }

  return (
    <Component
      ref={ref}
      className={cn(
        cardVariants({ variant, size }),
        spacing && getSpacingClass(spacing),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "centered" | "with-action"
    spacing?: "none" | "sm" | "default" | "lg"
  }
>(({ className, variant = "default", spacing = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      spacing === "none" && "p-0",
      spacing === "sm" && "p-3 pb-2",
      spacing === "default" && "p-6 pb-2",
      spacing === "lg" && "p-8 pb-4",
      variant === "centered" && "text-center items-center",
      variant === "with-action" && "flex-row items-center justify-between space-y-0",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    variant?: "default" | "large" | "small"
  }
>(({ className, as: Comp = "h3", variant = "default", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      variant === "large" && "text-2xl",
      variant === "default" && "text-lg",
      variant === "small" && "text-base",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "default" | "muted" | "subtle"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      variant === "default" && "text-muted-foreground",
      variant === "muted" && "text-muted-foreground/70",
      variant === "subtle" && "text-muted-foreground/60",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "none" | "sm" | "default" | "lg"
  }
>(({ className, spacing = "default", ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      spacing === "none" && "p-0",
      spacing === "sm" && "p-3 pt-0",
      spacing === "default" && "p-6 pt-0", 
      spacing === "lg" && "p-8 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "actions" | "centered"
    spacing?: "none" | "sm" | "default" | "lg"
  }
>(({ className, variant = "default", spacing = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      spacing === "none" && "p-0",
      spacing === "sm" && "p-3 pt-0",
      spacing === "default" && "p-6 pt-0",
      spacing === "lg" && "p-8 pt-0",
      variant === "default" && "space-x-2",
      variant === "actions" && "justify-between",
      variant === "centered" && "justify-center space-x-2",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized card components for common use cases
const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode
    title: string
    description: string
    href?: string
    onClick?: () => void
    onToggle?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onPointerEnterCapture?: (event: React.PointerEvent<HTMLDivElement>) => void
    onPointerLeaveCapture?: (event: React.PointerEvent<HTMLDivElement>) => void
  }
>(({ className, icon, title, description, href, onClick, onToggle, onPointerEnterCapture, onPointerLeaveCapture, ...props }, ref) => {
  if (href) {
    // For anchor elements, we need to be more careful about which props we pass
    const anchorProps = {
      href,
      className: cn(
        cardVariants({ variant: "interactive" }),
        "group relative overflow-hidden block",
        className
      ),
      // Only pass basic props that are valid for anchor elements
      ...(props.id && { id: props.id }),
      ...(props.role && { role: props.role }),
      ...(props['aria-label'] && { 'aria-label': props['aria-label'] }),
      ...(props.tabIndex && { tabIndex: props.tabIndex }),
    }
    
    return (
      <a {...anchorProps}>
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-200">
            {icon}
          </div>
        )}
        <CardTitle variant="small" className="mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
      </a>
    )
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant: "interactive" }),
        "group relative overflow-hidden",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-200">
          {icon}
        </div>
      )}
      <CardTitle variant="small" className="mb-2">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
    </div>
  )
})
FeatureCard.displayName = "FeatureCard"

const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon?: React.ReactNode
  }
>(({ className, label, value, change, trend, icon, ...props }, ref) => (
  <Card
    ref={ref}
    variant="elevated"
    className={cn("text-center", className)}
    {...props}
  >
    <CardContent spacing="lg">
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {change && (
        <div className={cn(
          "mt-2 text-xs font-medium",
          trend === "up" && "text-green-600",
          trend === "down" && "text-red-600",
          trend === "neutral" && "text-muted-foreground"
        )}>
          {change}
        </div>
      )}
    </CardContent>
  </Card>
))
StatsCard.displayName = "StatsCard"

const LoadingCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <Card
    ref={ref}
    loading
    variant={variant}
    size={size}
    className={className}
    {...props}
  />
))
LoadingCard.displayName = "LoadingCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  FeatureCard,
  StatsCard,
  LoadingCard,
  cardVariants
} 