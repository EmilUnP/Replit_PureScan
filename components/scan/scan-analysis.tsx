'use client'

import React from 'react'
import { SkinAnalysisResult } from '@/lib/gemini'
import { Tables } from '@/lib/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ShareButton from '@/components/share/share-button'
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Droplets, 
  Eye, 
  Zap, 
  Target,
  Clock,
  Lightbulb,
  Heart,
  Utensils,
  Sun,
  Calendar,
  Star,
  ChevronRight
} from 'lucide-react'

type Scan = Tables<'scans'>

interface ScanAnalysisProps {
  result: SkinAnalysisResult
  originalImage: string
  onNewScan: () => void
  onSaveResults: () => void
  isSaving?: boolean
  scan?: Scan
  onShare?: (isPublic: boolean, shareUrl?: string) => void
}

// Score indicator component
const ScoreIndicator = ({ score, label, icon: Icon }: { score: number, label: string, icon: any }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Attention'
  }

  return (
    <div className={`p-4 rounded-lg border ${getScoreColor(score)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xl font-bold">{score}</span>
      </div>
      <div className="w-full bg-white rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${score}%`,
            backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>
      <p className="text-xs mt-1 opacity-75">{getScoreText(score)}</p>
    </div>
  )
}

export function ScanAnalysis({ 
  result, 
  originalImage, 
  onNewScan, 
  onSaveResults, 
  isSaving,
  scan,
  onShare 
}: ScanAnalysisProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Analysis Complete!
            </h1>
            <p className="text-gray-600 text-lg">Your comprehensive skin health report is ready</p>
          </div>

          {/* Overall Score Card */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Overall Skin Health Score</h2>
                  <p className="text-purple-100">Based on comprehensive AI analysis</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{result.overallScore}</div>
                  <div className="text-purple-100">out of 100</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-purple-100 mb-2">Detected Skin Type</h3>
                  <p className="text-xl capitalize font-medium">{result.skinType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-100 mb-2">Analysis Confidence</h3>
                  <p className="text-xl font-medium">{result.confidence}%</p>
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
                    <Eye className="h-5 w-5" />
                    <span>Analyzed Image</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={originalImage}
                    alt="Original scan"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Key Highlights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Strengths
                    </h4>
                    <ul className="text-sm space-y-1">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronRight className="h-3 w-3 mt-1 mr-1 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="text-sm space-y-1">
                      {result.mainConcerns.map((concern, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronRight className="h-3 w-3 mt-1 mr-1 text-orange-500" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detailed Scores */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Detailed Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of your skin health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScoreIndicator 
                      score={result.detailedAnalysis.hydration.score} 
                      label="Hydration" 
                      icon={Droplets}
                    />
                    <ScoreIndicator 
                      score={result.detailedAnalysis.texture.score} 
                      label="Texture" 
                      icon={Zap}
                    />
                    <ScoreIndicator 
                      score={result.detailedAnalysis.pores.score} 
                      label="Pores" 
                      icon={Eye}
                    />
                    <ScoreIndicator 
                      score={result.detailedAnalysis.clarity.score} 
                      label="Clarity" 
                      icon={Star}
                    />
                    <ScoreIndicator 
                      score={result.detailedAnalysis.tone.score} 
                      label="Tone" 
                      icon={Heart}
                    />
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    {Object.entries(result.detailedAnalysis).map(([key, analysis]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold capitalize mb-1">{key} Analysis</h4>
                        <p className="text-sm text-gray-600">{analysis.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Personalized Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Immediate Actions */}
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Immediate Actions
                    </h4>
                    <div className="grid gap-2">
                      {result.recommendations.immediate.map((action, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-800">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Long-term Goals */}
                  <div>
                    <h4 className="font-semibold text-purple-600 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Long-term Goals
                    </h4>
                    <div className="grid gap-2">
                      {result.recommendations.longTerm.map((goal, index) => (
                        <div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-sm font-medium text-purple-800">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Product Recommendations
                    </h4>
                    <div className="space-y-3">
                      {result.recommendations.products.map((product, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-800 capitalize">{product.category}</h5>
                          <p className="text-sm text-green-700 mt-1">{product.suggestion}</p>
                          <p className="text-xs text-green-600 mt-2 italic">{product.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lifestyle Recommendations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5" />
                    <span>Lifestyle Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-3 flex items-center">
                        <Utensils className="h-4 w-4 mr-2" />
                        Diet
                      </h4>
                      <ul className="text-sm space-y-2">
                        {result.lifestyle.diet.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Habits
                      </h4>
                      <ul className="text-sm space-y-2">
                        {result.lifestyle.habits.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Environment
                      </h4>
                      <ul className="text-sm space-y-2">
                        {result.lifestyle.environmental.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Follow-up */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Follow-up Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-purple-600 mb-2">Next Analysis</h4>
                        <p className="text-sm text-gray-700">{result.followUp.timeframe}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Focus Areas</h4>
                        <ul className="text-sm space-y-1">
                          {result.followUp.focusAreas.map((area, index) => (
                            <li key={index} className="text-gray-700">• {area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={onSaveResults}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                >
                  {isSaving ? 'Saving...' : 'Save Results to Profile'}
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
                  Take Another Scan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 