import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-foreground transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputSize: {
        sm: "h-8 px-3 py-1 text-xs",
        default: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      variant: {
        default: "border-input hover:border-ring/50 focus:border-ring",
        error: "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20",
        success: "border-green-500 text-green-700 focus:border-green-500 focus:ring-green-500/20",
        warning: "border-yellow-500 text-yellow-700 focus:border-yellow-500 focus:ring-yellow-500/20",
      },
    },
    defaultVariants: {
      inputSize: "default",
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  helperText?: string
  label?: string
  showPasswordToggle?: boolean
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type,
    inputSize,
    variant,
    leftIcon,
    rightIcon,
    error,
    success,
    helperText,
    label,
    showPasswordToggle = false,
    containerClassName,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    
    const isPasswordType = type === "password"
    const inputType = isPasswordType && showPassword ? "text" : type
    
    // Determine the variant based on validation state
    const currentVariant = error ? "error" : success ? "success" : variant

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const hasLeftIcon = leftIcon
    const hasRightIcon = rightIcon || (isPasswordType && showPasswordToggle) || error || success
    
    const renderValidationIcon = () => {
      if (error) {
        return <AlertCircle className="h-4 w-4 text-destructive" />
      }
      if (success) {
        return <CheckCircle className="h-4 w-4 text-green-500" />
      }
      return null
    }

    const renderPasswordToggle = () => {
      if (!isPasswordType || !showPasswordToggle) return null
      
      return (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:text-foreground"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )
    }

    const inputElement = (
      <div className={cn("relative flex items-center", containerClassName)}>
        {/* Left icon */}
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        {/* Input field */}
        <input
          type={inputType}
          className={cn(
            inputVariants({ inputSize, variant: currentVariant }),
            hasLeftIcon && "pl-10",
            hasRightIcon && "pr-10",
            isFocused && "ring-2 ring-ring ring-offset-2",
            className
          )}
          ref={ref}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${props.id}-error` : 
            success ? `${props.id}-success` :
            helperText ? `${props.id}-helper` : 
            undefined
          }
          {...props}
        />
        
        {/* Right side icons */}
        {hasRightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {renderValidationIcon()}
            {renderPasswordToggle()}
            {rightIcon && !error && !success && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>
    )

    // If no label or helper text, return just the input
    if (!label && !error && !success && !helperText) {
      return inputElement
    }

    // Return wrapped input with label and helper text
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={props.id}
            className={cn(
              "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive",
              success && "text-green-700",
              disabled && "opacity-50"
            )}
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        {inputElement}
        
        {/* Helper text, error, or success message */}
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p 
                id={`${props.id}-error`}
                className="text-xs text-destructive flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            )}
            
            {success && !error && (
              <p 
                id={`${props.id}-success`}
                className="text-xs text-green-600 flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                {success}
              </p>
            )}
            
            {helperText && !error && !success && (
              <p 
                id={`${props.id}-helper`}
                className="text-xs text-muted-foreground"
              >
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

// Specialized input components for common use cases
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type" | "leftIcon">>(
  ({ placeholder = "Search...", ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      placeholder={placeholder}
      leftIcon={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  )
)

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type" | "showPasswordToggle">>(
  (props, ref) => (
    <Input
      ref={ref}
      type="password"
      showPasswordToggle
      {...props}
    />
  )
)

export const EmailInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  (props, ref) => (
    <Input
      ref={ref}
      type="email"
      placeholder="Enter your email"
      autoComplete="email"
      {...props}
    />
  )
)

SearchInput.displayName = "SearchInput"
PasswordInput.displayName = "PasswordInput"  
EmailInput.displayName = "EmailInput"

export { Input, inputVariants } 