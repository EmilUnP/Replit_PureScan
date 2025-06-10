'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Share2, 
  Copy, 
  Twitter, 
  Linkedin, 
  Globe, 
  Lock,
  ExternalLink,
  Check,
  X
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tables } from '@/lib/database.types'

type Scan = Tables<'scans'>

interface ShareButtonProps {
  scan: Scan
  onShare?: (isPublic: boolean, shareUrl?: string) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export default function ShareButton({ 
  scan, 
  onShare, 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(scan.is_public || false)
  const [shareUrl, setShareUrl] = useState<string | null>(
    scan.public_id && scan.is_public 
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${scan.public_id}`
      : null
  )
  const [loading, setLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleTogglePublic = async (newIsPublic: boolean) => {
    setLoading(true)
    try {
      const response = await fetch('/api/scans/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanId: scan.id,
          makePublic: newIsPublic
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update sharing status')
      }

      setIsPublic(newIsPublic)
      setShareUrl(data.shareUrl)
      setShareSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000)
      
      if (onShare) {
        onShare(newIsPublic, data.shareUrl)
      }

    } catch (error) {
      console.error('Error updating sharing status:', error)
      alert(`${newIsPublic ? 'Sharing enabled' : 'Made private'} successfully! ${newIsPublic ? 'Your scan is now publicly shareable.' : 'Your scan is now private.'}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      alert('Failed to copy link')
    }
  }

  const shareOnTwitter = () => {
    if (!shareUrl) return
    const text = `Check out this ${scan.scan_type === 'cosmetic' ? 'Cosmetic Analysis' : 'Skin Analysis'} result on PureScan2!`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    if (!shareUrl) return
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const openSharePage = () => {
    if (!shareUrl) return
    window.open(shareUrl, '_blank')
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={`flex items-center space-x-2 ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>Share Analysis</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Make your {scan.scan_type === 'cosmetic' ? 'cosmetic analysis' : 'skin analysis'} result public and shareable.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success Message */}
              {shareSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      {isPublic ? 'Sharing enabled successfully!' : 'Made private successfully!'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {isPublic ? 'Your scan is now publicly shareable.' : 'Your scan is now private.'}
                  </p>
                </div>
              )}

              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <Label htmlFor="public-toggle" className="text-sm font-medium">
                      {isPublic ? 'Public' : 'Private'}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {isPublic 
                        ? 'Anyone with the link can view this analysis' 
                        : 'Only you can view this analysis'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={loading}
                />
              </div>

              {/* Share URL */}
              {isPublic && shareUrl && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Share Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center space-x-1"
                    >
                      {copySuccess ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnTwitter}
                      className="flex items-center space-x-2"
                    >
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnLinkedIn}
                      className="flex items-center space-x-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openSharePage}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">Sharing Information:</p>
                <ul className="space-y-1">
                  <li>• Public scans can be viewed by anyone with the link</li>
                  <li>• Your personal information remains private</li>
                  <li>• You can make scans private again at any time</li>
                  <li>• Links remain valid even when made private</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 