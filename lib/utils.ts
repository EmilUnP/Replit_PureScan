import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Input sanitization for XSS prevention - preserves spaces
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// Sanitization for text fields that should preserve spaces and basic formatting
export function sanitizeTextInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    // Preserve spaces and basic text formatting
}

// Sanitization for names (allows spaces, letters, hyphens, apostrophes)
export function sanitizeNameInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[^a-zA-Z\s\-']/g, '') // Only allow letters, spaces, hyphens, apostrophes
    .trim()
}

// Sanitization for email
export function sanitizeEmailInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/\s/g, '') // Remove all spaces
    .toLowerCase()
    .trim()
}

// Validate file types and sizes
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (allowedTypes.indexOf(file.type) === -1) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
  }
  
  return { valid: true }
}

// Rate limiting utility
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>()
  
  return (identifier: string): boolean => {
    const now = Date.now()
    const userRequests = requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    validRequests.push(now)
    requests.set(identifier, validRequests)
    return true
  }
}

// Format dates consistently
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Generate secure random IDs
export function generateId(): string {
  return crypto.randomUUID()
}

// Debounce function for search and input optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
} 