'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { 
  analyzeCosmeticIngredients, 
  analyzeSkinImage, 
  convertImageToBase64, 
  validateImageFile, 
  CosmeticAnalysisResult,
  SkinAnalysisResult 
} from '@/lib/gemini'
import { CosmeticAnalysis } from '@/components/scan/cosmetic-analysis'
import { ScanAnalysis } from '@/components/scan/scan-analysis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Navbar } from '@/components/layout/navbar'
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Zap,
  Target,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Package,
  User
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { trackScanCompletion } from '@/lib/achievements'
import { Tables } from '@/lib/database.types'
import { useRouter } from 'next/navigation'

type ScanStep = 'upload' | 'analyzing' | 'results'
type ScanType = 'cosmetic' | 'skin'

export default function ScanPage() {
  const { user, loading } = useAuth()
  const [scanType, setScanType] = useState<ScanType>('cosmetic')
  const [currentStep, setCurrentStep] = useState<ScanStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [cosmeticResult, setCosmeticResult] = useState<CosmeticAnalysisResult | null>(null)
  const [skinResult, setSkinResult] = useState<SkinAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedScan, setSavedScan] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      redirect('/')
    }
  }, [user, loading])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const simulateProgress = () => {
    setAnalysisProgress(0)
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 800)
    return interval
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return

    setIsAnalyzing(true)
    setCurrentStep('analyzing')
    setError(null)
    setCosmeticResult(null)
    setSkinResult(null)

    const progressInterval = simulateProgress()

    try {
      // Get user profile for personalized analysis
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const userProfile = profile ? {
        age: profile.age || undefined,
        skinType: profile.skin_type || undefined,
        concerns: (profile.preferences as any)?.additional_info?.skin_concerns || undefined,
        allergies: (profile.preferences as any)?.additional_info?.allergies || undefined,
        location: (profile.preferences as any)?.additional_info?.location || undefined
      } : undefined

      // Convert image to base64
      const imageBase64 = await convertImageToBase64(selectedFile)

      // Analyze based on scan type
      if (scanType === 'cosmetic') {
        const result = await analyzeCosmeticIngredients(imageBase64, userProfile)
        setCosmeticResult(result)
      } else {
        const result = await analyzeSkinImage(imageBase64, userProfile)
        setSkinResult(result)
      }

      clearInterval(progressInterval)
      setAnalysisProgress(100)
      
      setTimeout(() => {
        setCurrentStep('results')
        setIsAnalyzing(false)
      }, 1000)

    } catch (error) {
      console.error('Analysis error:', error)
      clearInterval(progressInterval)
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
      setIsAnalyzing(false)
      setCurrentStep('upload')
    }
  }

  const handleSaveResults = async () => {
    if ((!cosmeticResult && !skinResult) || !selectedFile || !user) return

    setIsSaving(true)
    try {
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${scanType}-scan-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(fileName, selectedFile, {
          upsert: false,
          contentType: selectedFile.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload image')
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('scan-images')
        .getPublicUrl(fileName)

      // Save scan results to database
      const result = cosmeticResult || skinResult
      const { data: scanData, error: dbError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          status: 'completed',
          scan_type: scanType,
          analysis_results: scanType === 'cosmetic' ? {
            overallSafety: cosmeticResult?.overallSafety,
            safetyScore: cosmeticResult?.safetyScore,
            productType: cosmeticResult?.productType,
            detectedIngredients: cosmeticResult?.detectedIngredients,
            safetyAssessment: cosmeticResult?.safetyAssessment,
            confidence: cosmeticResult?.confidence
          } : {
            overallScore: skinResult?.overallScore,
            skinType: skinResult?.skinType,
            mainConcerns: skinResult?.mainConcerns,
            strengths: skinResult?.strengths,
            detailedAnalysis: skinResult?.detailedAnalysis,
            confidence: skinResult?.confidence
          },
          confidence_score: (result?.confidence || 0) / 100,
          recommendations: scanType === 'cosmetic' ? {
            skinTypes: cosmeticResult?.recommendations.skinTypes,
            concerns: cosmeticResult?.recommendations.concerns,
            alternatives: cosmeticResult?.recommendations.alternatives,
            userSpecificAdvice: cosmeticResult?.userSpecificAdvice
          } : {
            immediate: skinResult?.recommendations.immediate,
            longTerm: skinResult?.recommendations.longTerm,
            products: skinResult?.recommendations.products,
            lifestyle: skinResult?.lifestyle,
            followUp: skinResult?.followUp
          },
          metadata: {
            analysisDate: new Date().toISOString(),
            scanType: scanType,
            userProfile: {
              age: user.user_metadata?.age,
              location: user.user_metadata?.location
            }
          }
        })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving scan:', dbError)
        setError('Failed to save scan results. Please try again.')
        return
      }

      // Track achievement for scan completion
      if (scanData) {
        try {
          const safetyScore = scanType === 'cosmetic' 
            ? cosmeticResult?.safetyScore 
            : skinResult?.overallScore

          await trackScanCompletion(user.id, scanType, safetyScore)
        } catch (achievementError) {
          console.error('Error tracking achievement:', achievementError)
          // Don't fail the whole operation if achievement tracking fails
        }
      }

      // Redirect to scan results page
      router.push(`/scan-results/${scanData.id}`)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save results. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleScanShare = (isPublic: boolean, shareUrl?: string) => {
    if (savedScan) {
      setSavedScan({
        ...savedScan,
        is_public: isPublic,
        public_id: shareUrl ? shareUrl.split('/').pop() || null : savedScan.public_id
      })
    }
  }

  const handleNewScan = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setPreview(null)
    setCosmeticResult(null)
    setSkinResult(null)
    setError(null)
    setIsAnalyzing(false)
    setAnalysisProgress(0)
    setSavedScan(null)
  }

  // Results view
  if (currentStep === 'results' && preview) {
    if (scanType === 'cosmetic' && cosmeticResult) {
      return (
        <>
          <Navbar />
          <CosmeticAnalysis
            result={cosmeticResult}
            originalImage={preview}
            onNewScan={handleNewScan}
            onSaveResults={handleSaveResults}
            isSaving={isSaving}
            scan={savedScan}
            onShare={handleScanShare}
          />
        </>
      )
    } else if (scanType === 'skin' && skinResult) {
      return (
        <>
          <Navbar />
          <ScanAnalysis
            result={skinResult}
            originalImage={preview}
            onNewScan={handleNewScan}
            onSaveResults={handleSaveResults}
            isSaving={isSaving}
            scan={savedScan}
            onShare={handleScanShare}
          />
        </>
      )
    }
  }

  // Analyzing view
  if (currentStep === 'analyzing') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    {scanType === 'cosmetic' ? (
                      <ShieldCheck className="w-12 h-12 text-white animate-pulse" />
                    ) : (
                      <Zap className="w-12 h-12 text-white animate-pulse" />
                    )}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {scanType === 'cosmetic' ? 'Analyzing Ingredients' : 'Analyzing Your Skin'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {scanType === 'cosmetic' 
                    ? 'Our AI is reading and analyzing the cosmetic ingredients for safety'
                    : 'Our AI is processing your image with advanced dermatological analysis'
                  }
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{Math.round(analysisProgress)}% complete</p>
                </div>

                <div className="mt-8 space-y-3">
                  {scanType === 'cosmetic' ? (
                    <>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>Reading ingredient list</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Analyzing ingredient safety</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>Generating personalized recommendations</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>Analyzing skin texture and tone</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>Detecting skin concerns and strengths</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Generating personalized recommendations</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Upload view
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                AI-Powered Scanning
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Scan cosmetic ingredients or analyze your skin with advanced AI
              </p>
              <p className="text-gray-500">
                Get professional insights and personalized recommendations
              </p>
            </div>

            {/* Scan Type Selector */}
            <Card className="border-0 shadow-lg bg-white mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Choose Scan Type</CardTitle>
                <CardDescription className="text-center">
                  Select what you'd like to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      scanType === 'cosmetic' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setScanType('cosmetic')}
                  >
                    <div className="text-center">
                      <ShieldCheck className={`w-12 h-12 mx-auto mb-4 ${
                        scanType === 'cosmetic' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <h3 className="text-xl font-semibold mb-2">Cosmetic Ingredients</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Scan ingredient lists on cosmetic products to check safety and get recommendations
                      </p>
                      <div className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          scanType === 'cosmetic' 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'
                        }`}>
                          {scanType === 'cosmetic' && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      scanType === 'skin' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setScanType('skin')}
                  >
                    <div className="text-center">
                      <Sparkles className={`w-12 h-12 mx-auto mb-4 ${
                        scanType === 'skin' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h3 className="text-xl font-semibold mb-2">Skin Analysis</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Analyze your skin condition and get personalized skincare recommendations
                      </p>
                      <div className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          scanType === 'skin' 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {scanType === 'skin' && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Upload {scanType === 'cosmetic' ? 'Product Image' : 'Skin Image'}
                </CardTitle>
                <CardDescription className="text-center">
                  {scanType === 'cosmetic' 
                    ? 'Take a clear photo of the ingredient list on your cosmetic product'
                    : 'For best results, use a well-lit photo with your skin clearly visible'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {!selectedFile ? (
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
                      {scanType === 'cosmetic' ? (
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      )}
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Choose an image</h3>
                      <p className="text-gray-600 mb-6">Upload from your device or take a photo</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </Button>

                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={handleFileInputChange}
                          className="hidden"
                          id="camera-capture"
                        />
                        <Button
                          variant="outline"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Photo</span>
                        </Button>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Tips for Best Results {scanType === 'cosmetic' ? '(Ingredient Scanning)' : '(Skin Analysis)'}:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        {scanType === 'cosmetic' ? (
                          <>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Take a clear, straight-on photo of the ingredient list
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Ensure good lighting so text is readable
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Include the full ingredient list if possible
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Avoid shadows or glare on the text
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Use natural lighting or bright indoor lighting
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Ensure your skin is clean and makeup-free
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Take the photo straight-on, not at an angle
                            </li>
                            <li className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              Avoid shadows on your face
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Preview */}
                    <div className="relative">
                      <img
                        src={preview!}
                        alt="Selected image"
                        className="w-full max-w-md mx-auto h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-white shadow-md hover:bg-gray-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* File Info */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              {scanType === 'cosmetic' ? (
                                <ShieldCheck className="h-4 w-4 mr-2" />
                              ) : (
                                <Zap className="h-4 w-4 mr-2" />
                              )}
                              Start AI Analysis
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={handleRemoveFile}
                          disabled={isAnalyzing}
                        >
                          Choose Different Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
} 