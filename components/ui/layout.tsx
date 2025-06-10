import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Page Container Component
const pageContainerVariants = cva(
  "min-h-screen bg-background",
  {
    variants: {
      variant: {
        default: "",
        centered: "flex items-center justify-center",
        fullHeight: "h-screen",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  center?: boolean
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ 
    className, 
    variant, 
    padding, 
    maxWidth = "full", 
    center = false,
    children, 
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        pageContainerVariants({ variant, padding }),
        maxWidth !== "none" && maxWidth !== "full" && "container mx-auto",
        maxWidth === "sm" && "max-w-sm",
        maxWidth === "md" && "max-w-md",
        maxWidth === "lg" && "max-w-lg",
        maxWidth === "xl" && "max-w-xl",
        maxWidth === "2xl" && "max-w-2xl",
        center && "mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
PageContainer.displayName = "PageContainer"

// Section Component
const sectionVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        default: "",
        hero: "bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white",
        feature: "bg-background",
        muted: "bg-muted/30",
        accent: "bg-accent/30",
      },
      padding: {
        none: "",
        sm: "py-8",
        default: "py-12",
        lg: "py-16",
        xl: "py-24",
      },
      spacing: {
        tight: "space-y-4",
        normal: "space-y-8",
        relaxed: "space-y-12",
        loose: "space-y-16",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      spacing: "normal",
    },
  }
)

export interface SectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  center?: boolean
  as?: "section" | "div" | "article" | "aside"
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ 
    className, 
    variant, 
    padding, 
    spacing,
    maxWidth = "2xl",
    center = true,
    as: Component = "section",
    children, 
    ...props 
  }, ref) => (
    <Component
      ref={ref as any}
      className={cn(sectionVariants({ variant, padding }), className)}
      {...props}
    >
      <div className={cn(
        "px-4 md:px-6 lg:px-8",
        maxWidth !== "none" && maxWidth !== "full" && "container mx-auto",
        maxWidth === "sm" && "max-w-sm",
        maxWidth === "md" && "max-w-md", 
        maxWidth === "lg" && "max-w-lg",
        maxWidth === "xl" && "max-w-xl",
        maxWidth === "2xl" && "max-w-2xl",
        center && "mx-auto",
        spacing && sectionVariants({ spacing }).split(' ').find(c => c.startsWith('space-'))
      )}>
        {children}
      </div>
    </Component>
  )
)
Section.displayName = "Section"

// Grid Layout Component
const gridVariants = cva(
  "grid gap-6",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        auto: "grid-cols-auto-fit-md",
        "auto-sm": "grid-cols-auto-fit-sm",
        "auto-lg": "grid-cols-auto-fit-lg",
      },
      gap: {
        sm: "gap-4",
        default: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      },
    },
    defaultVariants: {
      cols: 3,
      gap: "default",
    },
  }
)

export interface GridLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const GridLayout = React.forwardRef<HTMLDivElement, GridLayoutProps>(
  ({ className, cols, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  )
)
GridLayout.displayName = "GridLayout"

// Stack Layout Component
const stackVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        column: "flex-col",
        "row-reverse": "flex-row-reverse",
        "column-reverse": "flex-col-reverse",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        default: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
      wrap: {
        nowrap: "flex-nowrap",
        wrap: "flex-wrap",
        "wrap-reverse": "flex-wrap-reverse",
      },
    },
    defaultVariants: {
      direction: "column",
      align: "stretch",
      justify: "start",
      gap: "default",
      wrap: "nowrap",
    },
  }
)

export interface StackLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "nav"
}

const StackLayout = React.forwardRef<HTMLDivElement, StackLayoutProps>(
  ({ 
    className, 
    direction, 
    align, 
    justify, 
    gap, 
    wrap,
    as: Component = "div",
    ...props 
  }, ref) => (
    <Component
      ref={ref}
      className={cn(stackVariants({ direction, align, justify, gap, wrap }), className)}
      {...props}
    />
  )
)
StackLayout.displayName = "StackLayout"

// Sidebar Layout Component
const SidebarLayout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sidebar: React.ReactNode
    sidebarWidth?: "sm" | "md" | "lg" | "xl"
    sidebarPosition?: "left" | "right"
    collapsible?: boolean
    collapsed?: boolean
    onToggle?: () => void
  }
>(({ 
  className, 
  sidebar, 
  sidebarWidth = "md",
  sidebarPosition = "left",
  collapsible = false,
  collapsed = false,
  onToggle,
  children, 
  ...props 
}, ref) => {
  const sidebarWidthClass = {
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
    xl: "w-[28rem]",
  }[sidebarWidth]

  return (
    <div
      ref={ref}
      className={cn("flex min-h-screen bg-background", className)}
      {...props}
    >
      {sidebarPosition === "left" && (
        <aside className={cn(
          "bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-16" : sidebarWidthClass,
          collapsible && "relative"
        )}>
          {collapsible && (
            <button
              onClick={onToggle}
              className="absolute top-4 -right-3 z-10 rounded-full bg-background border border-border p-1.5 shadow-md hover:shadow-lg transition-shadow"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg 
                className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className={cn(
            "h-full overflow-hidden",
            collapsed && "opacity-0"
          )}>
            {sidebar}
          </div>
        </aside>
      )}
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      
      {sidebarPosition === "right" && (
        <aside className={cn(
          "bg-card border-l border-border transition-all duration-300",
          collapsed ? "w-16" : sidebarWidthClass,
          collapsible && "relative"
        )}>
          {collapsible && (
            <button
              onClick={onToggle}
              className="absolute top-4 -left-3 z-10 rounded-full bg-background border border-border p-1.5 shadow-md hover:shadow-lg transition-shadow"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg 
                className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className={cn(
            "h-full overflow-hidden",
            collapsed && "opacity-0"
          )}>
            {sidebar}
          </div>
        </aside>
      )}
    </div>
  )
})
SidebarLayout.displayName = "SidebarLayout"

// Center Layout Component (for auth pages, error pages, etc.)
const CenterLayout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"
    variant?: "default" | "card" | "glass"
  }
>(({ 
  className, 
  maxWidth = "md",
  variant = "default",
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-h-screen flex items-center justify-center p-4",
      className
    )}
    {...props}
  >
    <div className={cn(
      "w-full",
      maxWidth === "xs" && "max-w-xs",
      maxWidth === "sm" && "max-w-sm",
      maxWidth === "md" && "max-w-md",
      maxWidth === "lg" && "max-w-lg",
      maxWidth === "xl" && "max-w-xl",
      variant === "card" && "bg-card border border-border rounded-lg shadow-lg p-8",
      variant === "glass" && "glass rounded-lg p-8"
    )}>
      {children}
    </div>
  </div>
))
CenterLayout.displayName = "CenterLayout"

export {
  PageContainer,
  Section,
  GridLayout,
  StackLayout,
  SidebarLayout,
  CenterLayout,
  pageContainerVariants,
  sectionVariants,
  gridVariants,
  stackVariants
} 