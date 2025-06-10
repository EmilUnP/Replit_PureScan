'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Navbar } from '@/components/layout/navbar'
import ShareButton from '@/components/share/share-button'
import { 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Calendar, 
  Filter,
  Search,
  ChevronRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'

type Scan = Tables<'scans'>

export default function ScansPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [scans, setScans] = useState<Scan[]>([])
  const [filteredScans, setFilteredScans] = useState<Scan[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'cosmetic' | 'skin'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      redirect('/')
    }
  }, [user, loading])

  useEffect(() => {
    const loadScans = async () => {
      if (!user) return

      try {
        const { data: scansData, error } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching scans:', error)
          return
        }

        setScans(scansData || [])
        setFilteredScans(scansData || [])
      } catch (error) {
        console.error('Error loading scans:', error)
      } finally {
        setScansLoading(false)
      }
    }

    if (user) {
      loadScans()
    }
  }, [user])

  useEffect(() => {
    let filtered = scans

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(scan => scan.scan_type === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(scan => 
        scan.scan_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredScans(filtered)
  }, [scans, filter, searchTerm])

  const getScanIcon = (scanType: string) => {
    return scanType === 'cosmetic' ? ShieldCheck : Sparkles
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleScanShare = (scanId: string, isPublic: boolean, shareUrl?: string) => {
    // Update the local scan state to reflect the sharing change
    setScans(prevScans => 
      prevScans.map(scan => 
        scan.id === scanId 
          ? { 
              ...scan, 
              is_public: isPublic, 
              public_id: shareUrl ? shareUrl.split('/').pop() || null : scan.public_id 
            }
          : scan
      )
    )
  }

  const handleViewDetails = (scanId: string) => {
    router.push(`/scan-results/${scanId}`)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Product Analysis</h1>
                <p className="text-gray-600 mt-1">View and manage all your cosmetic ingredient analysis and skin analysis results</p>
              </div>
              <Link href="/scan">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <div className="flex space-x-2">
                      <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                      >
                        All Analysis
                      </Button>
                      <Button
                        variant={filter === 'cosmetic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('cosmetic')}
                        className={filter === 'cosmetic' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Cosmetic (Main)
                      </Button>
                      <Button
                        variant={filter === 'skin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('skin')}
                        className={filter === 'skin' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Skin (Bonus)
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Scans</p>
                      <p className="text-2xl font-bold text-gray-900">{scans.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Cosmetic Scans</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {scans.filter(scan => scan.scan_type === 'cosmetic').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Skin Scans</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {scans.filter(scan => scan.scan_type === 'skin').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scans List */}
            {scansLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredScans.length > 0 ? (
              <div className="space-y-4">
                {filteredScans.map((scan) => {
                  const ScanIcon = getScanIcon(scan.scan_type)
                  const isCosmetic = scan.scan_type === 'cosmetic'
                  
                  // Safely extract score from analysis results
                  let score: number | undefined
                  let overallSafety: string | undefined
                  let skinType: string | undefined
                  
                  if (scan.analysis_results && typeof scan.analysis_results === 'object' && scan.analysis_results !== null) {
                    const results = scan.analysis_results as any
                    score = isCosmetic ? results.safetyScore : results.overallScore
                    overallSafety = results.overallSafety
                    skinType = results.skinType
                  }

                  return (
                    <Card key={scan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 ${isCosmetic ? 'bg-purple-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                              <ScanIcon className={`w-8 h-8 ${isCosmetic ? 'text-purple-600' : 'text-blue-600'}`} />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {scan.scan_type} {isCosmetic ? 'Ingredient' : ''} Analysis
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-600">{formatDate(scan.created_at)}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                  <span className="text-sm text-green-600 capitalize">{scan.status}</span>
                                </div>
                                {score && (
                                  <div className="flex items-center">
                                    <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                                      Score: {score}/100
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Quick preview */}
                              <div className="mt-2">
                                {isCosmetic && overallSafety && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    overallSafety === 'safe' ? 'bg-green-100 text-green-800' :
                                    overallSafety === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {overallSafety === 'safe' ? 'Safe to Use' :
                                     overallSafety === 'caution' ? 'Use with Caution' :
                                     'Consider Avoiding'}
                                  </span>
                                )}
                                {!isCosmetic && skinType && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {skinType} skin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <ShareButton 
                              scan={scan}
                              onShare={(isPublic, shareUrl) => handleScanShare(scan.id, isPublic, shareUrl)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(scan.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {filter === 'all' ? 'No scans yet' : `No ${filter} scans yet`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? 'Start your first AI analysis to see results here'
                      : `You haven't performed any ${filter} scans yet`
                    }
                  </p>
                  <Link href="/scan">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Your First Scan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 