'use client'

import React, { useState } from 'react'
import { Tables } from '@/lib/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ShareButton from '@/components/share/share-button'
import { 
  Calendar, 
  Sparkles, 
  ShieldCheck,
  Heart,
  Smile,
  AlertTriangle,
  Eye,
  Target,
  Star,
  Package,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  ExternalLink,
  Clock,
  TrendingUp,
  Zap,
  Award,
  Lightbulb,
  ChevronRight,
  Droplets,
  Sun,
  Utensils,
  Shield,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'

type Scan = Tables<'scans'>

interface ScanWithProfile extends Scan {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface ScanResultDisplayProps {
  scan: ScanWithProfile
  isPublic?: boolean
  showHeader?: boolean
  showActions?: boolean
  onShare?: (isPublic: boolean, shareUrl?: string) => void
  className?: string
}

export function ScanResultDisplay({ 
  scan, 
  isPublic = false,
  showHeader = true,
  showActions = true,
  onShare,
  className = ""
}: ScanResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  // Safe helper functions to handle potentially undefined or non-array data
  const safeArray = (data: any): any[] => {
    if (Array.isArray(data)) return data
    
    // Handle stringified JSON arrays
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        // If not valid JSON, treat as single item
        return [data]
      }
    }
    
    if (data && typeof data === 'object') {
      // Convert object to array of values or entries if needed
      return Object.values(data).filter(item => item != null)
    }
    
    return []
  }

  const safeString = (data: any): string => {
    if (typeof data === 'string') {
      // Check if it's a JSON string and try to format it nicely
      try {
        const parsed = JSON.parse(data)
        if (typeof parsed === 'object') {
          // Handle different object structures
          if (parsed.skinTypeMatch || parsed.allergyConcerns || parsed.personalRecommendation) {
            // Personal advice format
            return formatPersonalAdvice(parsed)
          }
          if (parsed.allergens !== undefined || parsed.beneficial !== undefined) {
            // Safety assessment format
            return formatSafetyAssessment(parsed)
          }
          if (parsed.category && parsed.reasoning && parsed.suggestion) {
            // Product recommendation format
            return formatProductRecommendation(parsed)
          }
          // Generic object - return formatted
          return Object.entries(parsed)
            .filter(([_, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        }
        return String(parsed)
      } catch (e) {
        // Not JSON, return as is
        return data
      }
    }
    
    if (data && typeof data === 'object') {
      // Handle objects that weren't stringified
      if (data.skinTypeMatch || data.allergyConcerns || data.personalRecommendation) {
        return formatPersonalAdvice(data)
      }
      if (data.allergens !== undefined || data.beneficial !== undefined) {
        return formatSafetyAssessment(data)
      }
      if (data.category && data.reasoning && data.suggestion) {
        return formatProductRecommendation(data)
      }
      return JSON.stringify(data)
    }
    
    return String(data || '')
  }

  // Helper function to format personal advice objects
  const formatPersonalAdvice = (advice: any): string => {
    const parts = []
    
    if (advice.skinTypeMatch) {
      parts.push(`Skin Type Match: ${advice.skinTypeMatch}`)
    }
    
    if (advice.allergyConcerns && Array.isArray(advice.allergyConcerns)) {
      parts.push(`Allergy Concerns: ${advice.allergyConcerns.join(', ')}`)
    }
    
    if (advice.personalRecommendation) {
      parts.push(`Recommendation: ${advice.personalRecommendation}`)
    }
    
    return parts.join('\n\n')
  }

  // Helper function to format safety assessment objects
  const formatSafetyAssessment = (assessment: any): string => {
    const categories = []
    
    if (assessment.allergens && assessment.allergens.length > 0) {
      categories.push(`Allergens: ${assessment.allergens.join(', ')}`)
    } else if (assessment.allergens) {
      categories.push('No known allergens detected')
    }
    
    if (assessment.beneficial && assessment.beneficial.length > 0) {
      categories.push(`Beneficial ingredients: ${assessment.beneficial.join(', ')}`)
    } else if (assessment.beneficial) {
      categories.push('No specifically beneficial ingredients identified')
    }
    
    if (assessment.comedogenic && assessment.comedogenic.length > 0) {
      categories.push(`Comedogenic ingredients: ${assessment.comedogenic.join(', ')}`)
    } else if (assessment.comedogenic) {
      categories.push('No comedogenic ingredients detected')
    }
    
    if (assessment.potentialIrritants && assessment.potentialIrritants.length > 0) {
      categories.push(`Potential irritants: ${assessment.potentialIrritants.join(', ')}`)
    } else if (assessment.potentialIrritants) {
      categories.push('No potential irritants identified')
    }
    
    return categories.length > 0 ? categories.join('\n') : 'Analysis complete - no specific concerns identified'
  }

  // Helper function to format product recommendations
  const formatProductRecommendation = (product: any): string => {
    const parts = []
    
    if (product.category) {
      parts.push(`Category: ${product.category}`)
    }
    
    if (product.reasoning) {
      parts.push(`Why: ${product.reasoning}`)
    }
    
    if (product.suggestion) {
      parts.push(`Suggestion: ${product.suggestion}`)
    }
    
    return parts.join('\n')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScanTypeIcon = (scanType: string) => {
    return scanType === 'cosmetic' ? ShieldCheck : Sparkles
  }

  const getScanTypeLabel = (scanType: string) => {
    return scanType === 'cosmetic' ? 'Cosmetic Ingredient Analysis' : 'Skin Analysis'
  }

  const getSentimentIcon = (analysis: any) => {
    if (!analysis) return Smile
    const sentiment = analysis.sentiment || analysis.overall_sentiment
    if (sentiment === 'positive') return Smile
    if (sentiment === 'negative') return AlertTriangle
    return Heart
  }

  const getSentimentColor = (analysis: any) => {
    if (!analysis) return 'text-gray-500'
    const sentiment = analysis.sentiment || analysis.overall_sentiment
    if (sentiment === 'positive') return 'text-green-600'
    if (sentiment === 'negative') return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentLabel = (analysis: any) => {
    if (!analysis) return 'Neutral'
    const sentiment = analysis.sentiment || analysis.overall_sentiment
    return sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : 'Neutral'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareOnTwitter = () => {
    const text = `Check out this ${getScanTypeLabel(scan.scan_type)} result on PureScan2!`
    const url = window.location.href
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = window.location.href
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const ScanIcon = getScanTypeIcon(scan.scan_type)
  const SentimentIcon = getSentimentIcon(scan.analysis_results)
  const isCosmetic = scan.scan_type === 'cosmetic'
  const analysisResults = scan.analysis_results as any
  const recommendations = scan.recommendations as any
  const overallScore = analysisResults?.safetyScore || analysisResults?.overallScore || 0



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      {showHeader && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                  isCosmetic ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <ScanIcon className={`w-8 h-8 ${
                    isCosmetic ? 'text-purple-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {getScanTypeLabel(scan.scan_type)}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDate(scan.created_at)}</span>
                    </div>
                    <Badge className={getStatusColor(scan.status)}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {scan.status}
                    </Badge>
                    {scan.profiles?.full_name && isPublic && (
                      <Badge variant="outline">
                        <User className="w-3 h-3 mr-1" />
                        Shared by {scan.profiles.full_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Metrics */}
              <div className="flex gap-4">
                {/* Overall Score */}
                {overallScore > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${getScoreBgColor(overallScore)} text-center min-w-[80px]`}>
                    <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                      {Math.round(overallScore)}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Score</div>
                  </div>
                )}

                {/* Confidence */}
                {scan.confidence_score && (
                  <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200 text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(scan.confidence_score * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Confidence</div>
                  </div>
                )}

                {/* Sentiment */}
                {analysisResults && (
                  <div className={`p-4 rounded-lg border-2 text-center min-w-[80px] ${
                    getSentimentColor(analysisResults) === 'text-green-600' ? 'bg-green-50 border-green-200' :
                    getSentimentColor(analysisResults) === 'text-red-600' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <SentimentIcon className={`w-8 h-8 mx-auto mb-1 ${getSentimentColor(analysisResults)}`} />
                    <div className="text-xs text-gray-600 font-medium">
                      {getSentimentLabel(analysisResults)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Column */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img 
                  src={scan.image_url} 
                  alt="Scan Image"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${
                    isCosmetic 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    <ScanIcon className="w-4 h-4 mr-2" />
                    {getScanTypeLabel(scan.scan_type)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Summary */}
          {analysisResults && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SentimentIcon className={`w-6 h-6 mr-3 ${getSentimentColor(analysisResults)}`} />
                  Analysis Summary
                </CardTitle>
                <CardDescription>
                  Comprehensive {isCosmetic ? 'ingredient safety' : 'skin'} analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCosmetic ? (
                  <div className="space-y-4">
                    {/* Product Type */}
                    {analysisResults.productType && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-gray-700">Product Type</span>
                        <Badge variant="secondary">{safeString(analysisResults.productType)}</Badge>
                      </div>
                    )}

                    {/* Safety Assessment */}
                    {(analysisResults.overallSafety || analysisResults.safetyAssessment) && (
                      <div className={`p-4 rounded-lg border-2 ${
                        analysisResults.overallSafety === 'safe' ? 'bg-green-50 border-green-200' :
                        analysisResults.overallSafety === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-center space-x-3">
                            {analysisResults.overallSafety === 'safe' ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : analysisResults.overallSafety === 'caution' ? (
                              <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                            <h4 className={`font-semibold ${
                              analysisResults.overallSafety === 'safe' ? 'text-green-800' :
                              analysisResults.overallSafety === 'caution' ? 'text-yellow-800' :
                              'text-red-800'
                            }`}>
                              {analysisResults.overallSafety === 'safe' ? 'Safe to Use' :
                               analysisResults.overallSafety === 'caution' ? 'Use with Caution' :
                               analysisResults.overallSafety ? 'Consider Avoiding' : 'Safety Assessment'}
                            </h4>
                          </div>
                          
                          {/* Detailed Safety Assessment */}
                          {analysisResults.safetyAssessment && (() => {
                            let assessment = analysisResults.safetyAssessment
                            if (typeof assessment === 'string') {
                              try {
                                assessment = JSON.parse(assessment)
                              } catch (e) {
                                return (
                                  <p className="text-sm text-gray-700">
                                    {assessment}
                                  </p>
                                )
                              }
                            }

                            if (typeof assessment === 'object' && assessment !== null) {
                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                  {/* Allergens */}
                                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-gray-700">Allergens</span>
                                    <Badge className={assessment.allergens && assessment.allergens.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                      {assessment.allergens && assessment.allergens.length > 0 ? 
                                        `${assessment.allergens.length} found` : 'None detected'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Beneficial */}
                                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-gray-700">Beneficial</span>
                                    <Badge className={assessment.beneficial && assessment.beneficial.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                                      {assessment.beneficial && assessment.beneficial.length > 0 ? 
                                        `${assessment.beneficial.length} found` : 'None identified'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Comedogenic */}
                                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-gray-700">Comedogenic</span>
                                    <Badge className={assessment.comedogenic && assessment.comedogenic.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                      {assessment.comedogenic && assessment.comedogenic.length > 0 ? 
                                        `${assessment.comedogenic.length} found` : 'None detected'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Potential Irritants */}
                                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-gray-700">Potential Irritants</span>
                                    <Badge className={assessment.potentialIrritants && assessment.potentialIrritants.length > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                                      {assessment.potentialIrritants && assessment.potentialIrritants.length > 0 ? 
                                        `${assessment.potentialIrritants.length} found` : 'None detected'}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <p className="text-sm text-gray-700">
                                {safeString(assessment)}
                              </p>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Detected Ingredients */}
                    {analysisResults.detectedIngredients && safeArray(analysisResults.detectedIngredients).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-purple-600" />
                          Key Ingredients ({safeArray(analysisResults.detectedIngredients).length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {safeArray(analysisResults.detectedIngredients).slice(0, 6).map((ingredient: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-sm">
                                {safeString(ingredient?.name || ingredient)}
                              </span>
                              {ingredient?.safety && (
                                <Badge className={`text-xs ${
                                  ingredient.safety === 'safe' ? 'bg-green-100 text-green-800' :
                                  ingredient.safety === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {safeString(ingredient.safety)}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Skin Type */}
                    {analysisResults.skinType && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700">Skin Type</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {safeString(analysisResults.skinType)}
                        </Badge>
                      </div>
                    )}

                    {/* Main Concerns */}
                    {analysisResults.mainConcerns && safeArray(analysisResults.mainConcerns).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                          Areas to Address
                        </h4>
                        <div className="space-y-2">
                          {safeArray(analysisResults.mainConcerns).map((concern: any, index: number) => (
                            <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-3 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{safeString(concern)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {analysisResults.strengths && safeArray(analysisResults.strengths).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-green-600" />
                          Skin Strengths
                        </h4>
                        <div className="space-y-2">
                          {safeArray(analysisResults.strengths).map((strength: any, index: number) => (
                            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{safeString(strength)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-6 h-6 mr-3 text-yellow-600" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Tailored advice based on your {isCosmetic ? 'product analysis' : 'skin analysis'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCosmetic ? (
                  <div className="space-y-4">
                    {/* Skin Types */}
                    {recommendations.skinTypes && safeArray(recommendations.skinTypes).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Best For Skin Types
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            // Get all skin type recommendations and flatten them
                            const allSkinTypes: string[] = []
                            const rawData = safeArray(recommendations.skinTypes)
                            
                            rawData.forEach((item: any) => {
                              if (typeof item === 'string') {
                                // Try to parse as JSON array first
                                if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
                                  try {
                                    const parsed = JSON.parse(item)
                                    if (Array.isArray(parsed)) {
                                      allSkinTypes.push(...parsed)
                                    } else {
                                      allSkinTypes.push(item)
                                    }
                                  } catch (e) {
                                    // If parsing fails, treat as regular string
                                    allSkinTypes.push(item)
                                  }
                                } else {
                                  allSkinTypes.push(item)
                                }
                              } else if (Array.isArray(item)) {
                                allSkinTypes.push(...item)
                              } else {
                                allSkinTypes.push(String(item))
                              }
                            })

                            return allSkinTypes.map((skinType: string, index: number) => (
                              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <User className="w-4 h-4 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <span className="text-sm text-blue-800 leading-relaxed">
                                  {skinType.trim()}
                                </span>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Concerns */}
                    {recommendations.concerns && safeArray(recommendations.concerns).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-green-600" />
                          Addresses These Concerns
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            // Get all concerns and flatten them
                            const allConcerns: string[] = []
                            const rawData = safeArray(recommendations.concerns)
                            
                            rawData.forEach((item: any) => {
                              if (typeof item === 'string') {
                                // Try to parse as JSON array first
                                if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
                                  try {
                                    const parsed = JSON.parse(item)
                                    if (Array.isArray(parsed)) {
                                      allConcerns.push(...parsed)
                                    } else {
                                      allConcerns.push(item)
                                    }
                                  } catch (e) {
                                    // If parsing fails, treat as regular string
                                    allConcerns.push(item)
                                  }
                                } else {
                                  allConcerns.push(item)
                                }
                              } else if (Array.isArray(item)) {
                                allConcerns.push(...item)
                              } else {
                                allConcerns.push(String(item))
                              }
                            })

                            return allConcerns.map((concernText: string, index: number) => (
                              <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                <span className="text-sm text-gray-700 leading-relaxed">{concernText.trim()}</span>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}

                    {/* User Specific Advice */}
                    {recommendations.userSpecificAdvice && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Heart className="w-5 h-5 mr-2 text-purple-600" />
                          Personal Advice
                        </h4>
                        {(() => {
                          // Parse structured advice if it's JSON
                          let advice = recommendations.userSpecificAdvice
                          if (typeof advice === 'string') {
                            try {
                              advice = JSON.parse(advice)
                            } catch (e) {
                              // If not JSON, display as is
                              return (
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {advice}
                                  </p>
                                </div>
                              )
                            }
                          }

                          if (typeof advice === 'object' && advice !== null) {
                            return (
                              <div className="space-y-3">
                                {/* Skin Type Match */}
                                {advice.skinTypeMatch && (
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h5 className="font-medium text-blue-900 mb-2">Skin Type Compatibility</h5>
                                    <p className="text-sm text-blue-800">{advice.skinTypeMatch}</p>
                                  </div>
                                )}

                                {/* Allergy Concerns */}
                                {advice.allergyConcerns && (
                                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <h5 className="font-medium text-yellow-900 mb-2">Allergy Considerations</h5>
                                    {Array.isArray(advice.allergyConcerns) ? (
                                      <ul className="space-y-1">
                                        {advice.allergyConcerns.map((concern: string, index: number) => (
                                          <li key={index} className="text-sm text-yellow-800 flex items-start">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                            {concern}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-yellow-800">{advice.allergyConcerns}</p>
                                    )}
                                  </div>
                                )}

                                {/* Personal Recommendation */}
                                {advice.personalRecommendation && (
                                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <h5 className="font-medium text-purple-900 mb-2">Personalized Recommendation</h5>
                                    <p className="text-sm text-purple-800 leading-relaxed">{advice.personalRecommendation}</p>
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // Fallback for other formats
                          return (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {safeString(advice)}
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Immediate Actions */}
                    {recommendations.immediate && safeArray(recommendations.immediate).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-orange-600" />
                          Immediate Actions
                        </h4>
                        <div className="space-y-2">
                          {safeArray(recommendations.immediate).map((action: any, index: number) => (
                            <div key={index} className="flex items-start p-3 bg-orange-50 rounded-lg">
                              <Clock className="w-4 h-4 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{safeString(action)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Long Term Care */}
                    {recommendations.longTerm && safeArray(recommendations.longTerm).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                          Long-Term Care
                        </h4>
                        <div className="space-y-2">
                          {safeArray(recommendations.longTerm).map((item: any, index: number) => (
                            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                              <Award className="w-4 h-4 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{safeString(item)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Recommendations */}
                    {recommendations.products && safeArray(recommendations.products).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-green-600" />
                          Recommended Products
                        </h4>
                        <div className="space-y-3">
                          {safeArray(recommendations.products).map((product: any, index: number) => {
                            // Check if product is a structured object
                            let productData = product
                            if (typeof product === 'string') {
                              try {
                                productData = JSON.parse(product)
                              } catch (e) {
                                productData = { suggestion: product }
                              }
                            }

                            if (typeof productData === 'object' && productData !== null) {
                              return (
                                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-start space-x-3">
                                    <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                      {/* Category */}
                                      {productData.category && (
                                        <div>
                                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                            {productData.category}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Reasoning */}
                                      {productData.reasoning && (
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          <span className="font-medium text-gray-900">Why: </span>
                                          {productData.reasoning}
                                        </p>
                                      )}
                                      
                                      {/* Suggestion */}
                                      {productData.suggestion && (
                                        <p className="text-sm text-green-800 font-medium">
                                          <span className="text-gray-700">Recommended: </span>
                                          {productData.suggestion}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                                <Star className="w-4 h-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{safeString(product)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {scan.tags && safeArray(scan.tags).length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-6 h-6 mr-3 text-gray-600" />
                  Tags & Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeArray(scan.tags).map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {safeString(tag)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {showActions && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-gray-600" />
                  Actions
                </CardTitle>
                <CardDescription>
                  {isPublic ? 'Share this analysis or try PureScan2' : 'Share your results or take more actions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {/* Copy Link */}
                  {isPublic && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </Button>
                  )}

                  {/* Social Sharing */}
                  {isPublic && (
                    <>
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
                    </>
                  )}

                  {/* Share Button for Authenticated Users */}
                  {!isPublic && onShare && (
                    <ShareButton 
                      scan={scan}
                      onShare={onShare}
                      variant="outline"
                      size="sm"
                    />
                  )}

                  {/* New Scan Button */}
                  <Link href="/scan">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      New Scan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Public Footer */}
      {isPublic && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want to analyze your own products?
            </h3>
            <p className="text-gray-600 mb-4">
              Join PureScan2 to get AI-powered cosmetic ingredient analysis and skin scanning.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Try PureScan2 Free
              </Button>
            </Link>
            <div className="mt-4 text-sm text-gray-500">
              Powered by{' '}
              <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                PureScan2
              </Link>
              {' '}- AI-Powered Cosmetic & Skin Analysis
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 