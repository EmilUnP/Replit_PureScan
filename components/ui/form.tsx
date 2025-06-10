import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

const formVariants = cva(
  "space-y-6",
  {
    variants: {
      variant: {
        default: "",
        card: "p-6 bg-card border border-border rounded-lg shadow-sm",
        inline: "space-y-4",
        compact: "space-y-3",
      },
      spacing: {
        tight: "space-y-2",
        normal: "space-y-4", 
        relaxed: "space-y-6",
        loose: "space-y-8",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "normal",
    },
  }
)

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {
  loading?: boolean
  errors?: Record<string, string>
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className, 
    variant, 
    spacing, 
    loading, 
    errors,
    children,
    onSubmit,
    ...props 
  }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (loading) return
      onSubmit?.(e)
    }

    return (
      <form
        ref={ref}
        className={cn(formVariants({ variant, spacing }), className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

// Form Section Component
const FormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    description?: string
    spacing?: "tight" | "normal" | "relaxed"
  }
>(({ className, title, description, spacing = "normal", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-4",
      spacing === "tight" && "space-y-2",
      spacing === "relaxed" && "space-y-6",
      className
    )}
    {...props}
  >
    {(title || description) && (
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
))
FormSection.displayName = "FormSection"

// Form Field Component
const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
    required?: boolean
    error?: string
    success?: string
    helperText?: string
    orientation?: "vertical" | "horizontal"
  }
>(({ 
  className, 
  label, 
  required, 
  error, 
  success, 
  helperText,
  orientation = "vertical",
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-2",
      orientation === "horizontal" && "flex items-center space-y-0 space-x-4",
      className
    )}
    {...props}
  >
    {label && (
      <label className={cn(
        "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        success && "text-green-600",
        orientation === "horizontal" && "whitespace-nowrap"
      )}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
    )}
    
    <div className={cn(orientation === "horizontal" && "flex-1")}>
      {children}
      
      {/* Helper text, error, or success message */}
      {(error || success || helperText) && (
        <div className="mt-2 space-y-1">
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1" role="alert">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {error}
            </p>
          )}
          
          {success && !error && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              {success}
            </p>
          )}
          
          {helperText && !error && !success && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3 flex-shrink-0 opacity-50" />
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
))
FormField.displayName = "FormField"

// Form Actions Component (for buttons)
const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "split" | "centered" | "right"
    spacing?: "tight" | "normal" | "relaxed"
  }
>(({ className, variant = "default", spacing = "normal", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-3",
      variant === "default" && "flex-row",
      variant === "split" && "flex-row justify-between",
      variant === "centered" && "flex-row justify-center",
      variant === "right" && "flex-row justify-end",
      spacing === "tight" && "gap-2",
      spacing === "relaxed" && "gap-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
FormActions.displayName = "FormActions"

// Form Group Component (for grouping related fields)
const FormGroup = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement> & {
    legend?: string
    description?: string
    variant?: "default" | "bordered" | "card"
  }
>(({ className, legend, description, variant = "default", children, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn(
      "space-y-4",
      variant === "bordered" && "border border-border rounded-lg p-4",
      variant === "card" && "bg-card border border-border rounded-lg p-6 shadow-sm",
      className
    )}
    {...props}
  >
    {legend && (
      <legend className={cn(
        "text-sm font-medium leading-none",
        variant !== "default" && "mb-4"
      )}>
        {legend}
        {description && (
          <span className="block text-xs text-muted-foreground font-normal mt-1">
            {description}
          </span>
        )}
      </legend>
    )}
    {children}
  </fieldset>
))
FormGroup.displayName = "FormGroup"

// Form Error Summary Component
const FormErrorSummary = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    errors: Record<string, string>
    title?: string
  }
>(({ className, errors, title = "Please fix the following errors:", ...props }, ref) => {
  const errorList = Object.entries(errors).filter(([, message]) => message)
  
  if (errorList.length === 0) return null

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/5 p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-destructive">
            {title}
          </h4>
          <ul className="text-sm text-destructive space-y-1">
            {errorList.map(([field, message]) => (
              <li key={field} className="list-disc list-inside">
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
})
FormErrorSummary.displayName = "FormErrorSummary"

// Form Success Message Component
const FormSuccessMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    message: string
  }
>(({ className, title, message, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-950/20 p-4",
      className
    )}
    {...props}
  >
    <div className="flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        {title && (
          <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
            {title}
          </h4>
        )}
        <p className="text-sm text-green-700 dark:text-green-400">
          {message}
        </p>
      </div>
    </div>
  </div>
))
FormSuccessMessage.displayName = "FormSuccessMessage"

export {
  Form,
  FormSection,
  FormField,
  FormActions,
  FormGroup,
  FormErrorSummary,
  FormSuccessMessage,
  formVariants
} 