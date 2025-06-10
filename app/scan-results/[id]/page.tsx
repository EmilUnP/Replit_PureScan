'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ScanResultSkeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/layout/navbar'
import { ScanResultDisplay } from '@/components/scan/scan-result-display'
import { 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Scan = Tables<'scans'>

interface ScanWithProfile extends Scan {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export default function ScanResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const scanId = params.id as string
  const [scan, setScan] = useState<ScanWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadScan = async () => {
      if (!scanId || !user) return

      try {
        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('id', scanId)
          .eq('user_id', user.id)
          .single()

        if (scanError) {
          if (scanError.code === 'PGRST116') {
            setError('Scan not found or you do not have permission to view it.')
          } else {
            setError('Failed to load scan.')
          }
          console.error('Error fetching scan:', scanError)
          return
        }

        setScan(scanData)
      } catch (error) {
        console.error('Error loading scan:', error)
        setError('Failed to load scan.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadScan()
    }
  }, [scanId, user])

  const handleScanShare = (isPublic: boolean, shareUrl?: string) => {
    if (scan) {
      setScan({
        ...scan,
        is_public: isPublic,
        public_id: shareUrl ? shareUrl.split('/').pop() || null : scan.public_id
      })
    }
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  if (!authLoading && !user) {
    return null // Will redirect
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <ScanResultSkeleton />
          </div>
        </div>
      </>
    )
  }

  if (error || !scan) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Not Found</h1>
              <p className="text-gray-600 mb-6">
                {error || 'This scan could not be found.'}
              </p>
              <div className="flex space-x-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Scan Result Display */}
          <ScanResultDisplay 
            scan={scan}
            isPublic={false}
            showHeader={true}
            showActions={true}
            onShare={handleScanShare}
            className="max-w-6xl mx-auto"
          />
        </div>
      </div>
    </>
  )
} 