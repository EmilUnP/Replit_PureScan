'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ScanResultDisplay } from '@/components/scan/scan-result-display'
import { 
  AlertTriangle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Head from 'next/head'

type Scan = Tables<'scans'>

interface ScanWithProfile extends Scan {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface SharedPageProps {
  params: {
    id: string
  }
}

export default function SharedScanPage({ params }: SharedPageProps) {
  const publicId = params.id as string
  const [scan, setScan] = useState<ScanWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSharedScan = async () => {
      if (!publicId) return

      try {
        // First try to fetch by public_id if available
        let { data: scanData, error: scanError } = await supabase
          .from('scans')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('public_id', publicId)
          .eq('is_public', true)
          .single()

        // If not found by public_id, try by id (for demo purposes)
        if (scanError && scanError.code === 'PGRST116') {
          const { data: scanByIdData, error: scanByIdError } = await supabase
            .from('scans')
            .select(`
              *,
              profiles (
                full_name,
                avatar_url
              )
            `)
            .eq('id', publicId)
            .single()

          if (scanByIdError) {
            setError('This scan is private or no longer available.')
            console.error('Error fetching shared scan:', scanByIdError)
            return
          }

          // For demo purposes, treat any scan as public if accessed directly by ID
          scanData = scanByIdData
        } else if (scanError) {
          setError('Failed to load shared scan.')
          console.error('Error fetching shared scan:', scanError)
          return
        }

        setScan(scanData)
      } catch (error) {
        console.error('Error loading shared scan:', error)
        setError('Failed to load shared scan.')
      } finally {
        setLoading(false)
      }
    }

    loadSharedScan()
  }, [publicId])

  const getScanTypeLabel = (scanType: string) => {
    return scanType === 'cosmetic' ? 'Cosmetic Analysis' : 'Skin Analysis'
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Shared Scan | PureScan2</title>
          <meta name="description" content="View shared scan results on PureScan2" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">PureScan2</span>
                </Link>
                <div className="text-sm text-gray-500">
                  Shared Scan Result
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !scan) {
    return (
      <>
        <Head>
          <title>Scan Not Found | PureScan2</title>
          <meta name="description" content="This scan is private or no longer available" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Not Found</h1>
              <p className="text-gray-600 mb-6">
                {error || 'This scan is private or no longer available.'}
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to PureScan2
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{`${getScanTypeLabel(scan.scan_type)} - Shared on PureScan2`}</title>
        <meta name="description" content={`View this ${getScanTypeLabel(scan.scan_type)} result shared on PureScan2`} />
        <meta property="og:title" content={`${getScanTypeLabel(scan.scan_type)} - Shared on PureScan2`} />
        <meta property="og:description" content={`View this ${getScanTypeLabel(scan.scan_type)} result shared on PureScan2`} />
        <meta property="og:image" content={scan.thumbnail_url || scan.image_url} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${getScanTypeLabel(scan.scan_type)} - Shared on PureScan2`} />
        <meta name="twitter:description" content={`View this ${getScanTypeLabel(scan.scan_type)} result shared on PureScan2`} />
        <meta name="twitter:image" content={scan.thumbnail_url || scan.image_url} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PureScan2</span>
              </Link>
              <div className="text-sm text-gray-500">
                Shared Scan Result
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Scan Result Display */}
          <ScanResultDisplay 
            scan={scan}
            isPublic={true}
            showHeader={true}
            showActions={true}
            className="max-w-6xl mx-auto"
          />
        </div>
      </div>
    </>
  )
} 