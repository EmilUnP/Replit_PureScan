'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-800">
            You&apos;re Offline
          </h1>
          <p className="text-slate-600 leading-relaxed">
            It looks like you&apos;re not connected to the internet. 
            Some features may not be available, but you can still view 
            previously loaded content.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h3 className="font-medium text-slate-700 mb-2">
            Available Offline Features:
          </h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• View previously scanned results</li>
            <li>• Browse cached user profiles</li>
            <li>• Access saved achievements</li>
            <li>• Review scan history</li>
          </ul>
        </div>

        <div className="text-xs text-slate-500">
          Your data will sync automatically when you&apos;re back online
        </div>
      </Card>
    </div>
  )
} 