import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronDown, Menu, X } from "lucide-react"

// Navigation Bar Component
const navBarVariants = cva(
  "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  {
    variants: {
      variant: {
        default: "",
        transparent: "bg-transparent border-transparent",
        solid: "bg-background border-border",
        glass: "bg-background/80 backdrop-blur-lg border-border/50",
      },
      size: {
        sm: "h-12",
        default: "h-14",
        lg: "h-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NavBarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navBarVariants> {
  logo?: React.ReactNode
  actions?: React.ReactNode
  mobileMenuOpen?: boolean
  onMobileMenuToggle?: () => void
}

const NavBar = React.forwardRef<HTMLElement, NavBarProps>(
  ({ 
    className, 
    variant, 
    size, 
    logo,
    actions,
    mobileMenuOpen = false,
    onMobileMenuToggle,
    children, 
    ...props 
  }, ref) => (
    <nav
      ref={ref}
      className={cn(navBarVariants({ variant, size }), className)}
      {...props}
    >
      <div className="container flex items-center justify-between px-4 h-full">
        {/* Logo */}
        {logo && (
          <div className="flex items-center">
            {logo}
          </div>
        )}
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          {children}
        </div>
        
        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {actions}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container px-4 py-4 space-y-4">
            {children}
            {actions && (
              <div className="pt-4 border-t border-border">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
)
NavBar.displayName = "NavBar"

// Navigation Link Component
const navLinkVariants = cva(
  "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground",
        primary: "text-primary hover:text-primary/80",
        active: "text-foreground bg-accent",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navLinkVariants> {
  active?: boolean
  disabled?: boolean
  external?: boolean
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ 
    className, 
    variant, 
    size, 
    active = false,
    disabled = false,
    external = false,
    children, 
    ...props 
  }, ref) => (
    <a
      ref={ref}
      className={cn(
        navLinkVariants({ 
          variant: active ? "active" : variant, 
          size 
        }),
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      aria-current={active ? "page" : undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
      {/* Active indicator */}
      {active && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}
    </a>
  )
)
NavLink.displayName = "NavLink"

// Navigation Dropdown Component
export interface NavDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

const NavDropdown = ({ 
  trigger, 
  children, 
  align = "start",
  className 
}: NavDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-50",
          align === "end" && "right-0",
          align === "center" && "left-1/2 transform -translate-x-1/2",
          className
        )}>
          <div className="py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Navigation Dropdown Item Component
const navDropdownItemVariants = cva(
  "flex w-full items-center px-4 py-2 text-sm transition-colors focus:outline-none focus:bg-accent",
  {
    variants: {
      variant: {
        default: "text-foreground hover:bg-accent",
        destructive: "text-destructive hover:bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NavDropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof navDropdownItemVariants> {
  icon?: React.ReactNode
}

const NavDropdownItem = React.forwardRef<HTMLButtonElement, NavDropdownItemProps>(
  ({ 
    className, 
    variant, 
    icon,
    children, 
    ...props 
  }, ref) => (
    <button
      ref={ref}
      className={cn(navDropdownItemVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <span className="mr-2 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </button>
  )
)
NavDropdownItem.displayName = "NavDropdownItem"

// Breadcrumb Component
const breadcrumbVariants = cva(
  "flex items-center space-x-2 text-sm text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface BreadcrumbProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  separator?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    className, 
    size, 
    separator = "/",
    children, 
    ...props 
  }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn(breadcrumbVariants({ size }), className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {React.Children.map(children, (child, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <span className="text-muted-foreground/50 select-none" aria-hidden="true">
                {separator}
              </span>
            )}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  )
)
Breadcrumb.displayName = "Breadcrumb"

// Breadcrumb Item Component
const breadcrumbItemVariants = cva(
  "transition-colors hover:text-foreground",
  {
    variants: {
      current: {
        true: "text-foreground font-medium",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: {
      current: false,
    },
  }
)

export interface BreadcrumbItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof breadcrumbItemVariants> {
  current?: boolean
}

const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ 
    className, 
    current = false,
    children, 
    ...props 
  }, ref) => {
    if (current) {
      return (
        <span
          className={cn(breadcrumbItemVariants({ current }), className)}
          aria-current="page"
        >
          {children}
        </span>
      )
    }

    return (
      <a
        ref={ref}
        className={cn(breadcrumbItemVariants({ current }), className)}
        {...props}
      >
        {children}
      </a>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

// Tab Navigation Component
const tabsVariants = cva(
  "inline-flex items-center justify-center rounded-md bg-muted p-1",
  {
    variants: {
      variant: {
        default: "bg-muted",
        underline: "bg-transparent border-b border-border",
        pills: "bg-background border border-border",
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    variant, 
    size, 
    value,
    onValueChange,
    children, 
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(tabsVariants({ variant, size }), className)}
      role="tablist"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            active: child.props.value === value,
            onClick: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
)
Tabs.displayName = "Tabs"

// Tab Item Component
const tabItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline: "border-b-2 border-transparent data-[state=active]:border-primary rounded-none",
        pills: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TabItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabItemVariants> {
  value: string
  active?: boolean
}

const TabItem = React.forwardRef<HTMLButtonElement, TabItemProps>(
  ({ 
    className, 
    variant, 
    value,
    active = false,
    children, 
    ...props 
  }, ref) => (
    <button
      ref={ref}
      className={cn(tabItemVariants({ variant }), className)}
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
)
TabItem.displayName = "TabItem"

export {
  NavBar,
  NavLink,
  NavDropdown,
  NavDropdownItem,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabItem,
  navBarVariants,
  navLinkVariants,
  breadcrumbVariants,
  tabsVariants,
} 