'use client'

import React, { useState } from 'react'
import { User, Camera, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProfileAvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  onImageChange?: (file: File) => void
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12', 
  lg: 'h-20 w-20',
  xl: 'h-32 w-32'
}

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10', 
  xl: 'h-16 w-16'
}

export function ProfileAvatar({
  src,
  alt = 'Profile picture',
  size = 'lg',
  editable = false,
  onImageChange,
  className
}: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImageChange) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      await onImageChange(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className={cn('text-muted-foreground', iconSizeClasses[size])} />
        )}
        
        {editable && (
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {editable && (
        <div className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 rounded-full p-0"
            disabled={isUploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            {isUploading ? (
              <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  )
} 