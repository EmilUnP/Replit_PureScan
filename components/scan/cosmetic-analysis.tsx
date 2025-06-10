'use client'

import React from 'react'
import { CosmeticAnalysisResult } from '@/lib/gemini'
import { Tables } from '@/lib/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ShareButton from '@/components/share/share-button'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck,
  AlertCircle,
  Eye,
  Sparkles,
  Target,
  Clock,
  Lightbulb,
  Heart,
  Users,
  Star,
  ChevronRight,
  Package,
  Zap
} from 'lucide-react'

type Scan = Tables<'scans'>

interface CosmeticAnalysisProps {
  result: CosmeticAnalysisResult
  originalImage: string
  onNewScan: () => void
  onSaveResults: () => void
  isSaving?: boolean
  scan?: Scan
  onShare?: (isPublic: boolean, shareUrl?: string) => void
}

// Safety indicator component
const SafetyIndicator = ({ level, score }: { level: 'safe' | 'caution' | 'avoid', score: number }) => {
  const getConfig = (level: string) => {
    switch(level) {
      case 'safe':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: CheckCircle,
          text: 'Safe to Use',
          bgColor: '#10b981'
        }
      case 'caution':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
          text: 'Use with Caution',
          bgColor: '#f59e0b'
        }
      case 'avoid':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: XCircle,
          text: 'Consider Avoiding',
          bgColor: '#ef4444'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: AlertCircle,
          text: 'Unknown',
          bgColor: '#6b7280'
        }
    }
  }

  const config = getConfig(level)
  const Icon = config.icon

  return (
    <div className={`p-6 rounded-lg border ${config.color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8" />
          <div>
            <h3 className="text-xl font-bold">{config.text}</h3>
            <p className="text-sm opacity-75">Safety Assessment</p>
          </div>
        </div>
        <div className="text-3xl font-bold">{score}/100</div>
      </div>
      <div className="w-full bg-white rounded-full h-3">
        <div 
          className="h-3 rounded-full transition-all duration-300"
          style={{ 
            width: `${score}%`,
            backgroundColor: config.bgColor
          }}
        />
      </div>
    </div>
  )
}

// Ingredient card component
const IngredientCard = ({ ingredient }: { ingredient: any }) => {
  const getSafetyColor = (level: string) => {
    switch(level) {
      case 'safe': return 'bg-green-50 border-green-200 text-green-800'
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'concerning': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getSafetyColor(ingredient.safetyLevel)}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold capitalize">{ingredient.name}</h4>
        <span className="text-xs px-2 py-1 rounded-full bg-white/50 capitalize">
          {ingredient.safetyLevel}
        </span>
      </div>
      <p className="text-sm mb-2">{ingredient.purpose}</p>
      <p className="text-xs opacity-75">{ingredient.description}</p>
      {ingredient.commonUses && ingredient.commonUses.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium mb-1">Common uses:</p>
          <p className="text-xs opacity-75">{ingredient.commonUses.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

export function CosmeticAnalysis({ 
  result, 
  originalImage, 
  onNewScan, 
  onSaveResults, 
  isSaving,
  scan,
  onShare 
}: CosmeticAnalysisProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="w-16 h-16 text-purple-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Ingredient Analysis Complete!
            </h1>
            <p className="text-gray-600 text-lg">Your cosmetic safety report is ready</p>
          </div>

          {/* Overall Safety Card */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-8">
              <SafetyIndicator level={result.overallSafety} score={result.safetyScore} />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Product Type</h3>
                  <p className="text-xl capitalize font-medium text-gray-900">{result.productType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Analysis Confidence</h3>
                  <p className="text-xl font-medium text-gray-900">{result.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image and Quick Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Original Image */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Analyzed Product</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={originalImage}
                    alt="Original product scan"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Safety Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Safety Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.safetyAssessment.beneficial.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Beneficial Ingredients
                      </h4>
                      <ul className="text-sm space-y-1">
                        {result.safetyAssessment.beneficial.map((ingredient, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="h-3 w-3 mt-1 mr-1 text-green-500" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.safetyAssessment.potentialIrritants.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Potential Concerns
                      </h4>
                      <ul className="text-sm space-y-1">
                        {result.safetyAssessment.potentialIrritants.map((irritant, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="h-3 w-3 mt-1 mr-1 text-orange-500" />
                            {irritant}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.safetyAssessment.allergens.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Common Allergens
                      </h4>
                      <ul className="text-sm space-y-1">
                        {result.safetyAssessment.allergens.map((allergen, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="h-3 w-3 mt-1 mr-1 text-red-500" />
                            {allergen}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detected Ingredients */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Ingredient Breakdown</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of detected ingredients and their purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                    {result.detectedIngredients.map((ingredient, index) => (
                      <IngredientCard key={index} ingredient={ingredient} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skin Type Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Recommended For
                      </h4>
                      <div className="space-y-2">
                        {result.recommendations.skinTypes.recommended.map((skinType, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800 capitalize">{skinType} skin</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Should Avoid
                      </h4>
                      <div className="space-y-2">
                        {result.recommendations.skinTypes.avoid.map((skinType, index) => (
                          <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-800 capitalize">{skinType} skin</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Concerns */}
                  {result.recommendations.concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Things to Watch Out For
                      </h4>
                      <div className="grid gap-2">
                        {result.recommendations.concerns.map((concern, index) => (
                          <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <p className="text-sm font-medium text-orange-800">{concern}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternatives */}
                  {result.recommendations.alternatives.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Better Alternatives
                      </h4>
                      <div className="grid gap-2">
                        {result.recommendations.alternatives.map((alternative, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">{alternative}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Advice (if available) */}
              {result.userSpecificAdvice && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Personal Recommendation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-purple-600 mb-2">For Your Skin Type</h4>
                          <p className="text-sm text-gray-700">{result.userSpecificAdvice.personalRecommendation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">Skin Type Match</h4>
                          <p className="text-sm text-gray-700">{result.userSpecificAdvice.skinTypeMatch}</p>
                        </div>

                        {result.userSpecificAdvice.allergyConcerns.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2">Allergy Alerts</h4>
                            <ul className="text-sm space-y-1">
                              {result.userSpecificAdvice.allergyConcerns.map((concern, index) => (
                                <li key={index} className="text-red-700">• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={onSaveResults}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                >
                  {isSaving ? 'Saving...' : 'Save Analysis to Profile'}
                </Button>
                {scan && onShare && (
                  <ShareButton 
                    scan={scan}
                    onShare={onShare}
                    variant="outline"
                    className="flex-1 py-3"
                  />
                )}
                <Button
                  variant="outline"
                  onClick={onNewScan}
                  className="flex-1 py-3"
                >
                  Scan Another Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 