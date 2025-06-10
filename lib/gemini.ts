import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface CosmeticAnalysisResult {
  overallSafety: 'safe' | 'caution' | 'avoid'
  safetyScore: number // 0-100
  productType: string
  detectedIngredients: {
    name: string
    purpose: string
    safetyLevel: 'safe' | 'moderate' | 'concerning'
    description: string
    commonUses: string[]
  }[]
  safetyAssessment: {
    potentialIrritants: string[]
    allergens: string[]
    comedogenic: string[] // pore-clogging ingredients
    beneficial: string[]
  }
  recommendations: {
    skinTypes: {
      recommended: string[] // which skin types this is good for
      avoid: string[] // which skin types should avoid
    }
    concerns: string[] // what to watch out for
    alternatives: string[] // better ingredient alternatives if issues found
  }
  userSpecificAdvice?: {
    personalRecommendation: string
    allergyConcerns: string[]
    skinTypeMatch: string
  }
  confidence: number
}

export interface SkinAnalysisResult {
  overallScore: number
  skinType: 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive'
  mainConcerns: string[]
  strengths: string[]
  detailedAnalysis: {
    hydration: {
      score: number
      description: string
    }
    texture: {
      score: number
      description: string
    }
    pores: {
      score: number
      description: string
    }
    clarity: {
      score: number
      description: string
    }
    tone: {
      score: number
      description: string
    }
  }
  recommendations: {
    immediate: string[]
    longTerm: string[]
    products: {
      category: string
      suggestion: string
      reasoning: string
    }[]
  }
  lifestyle: {
    diet: string[]
    habits: string[]
    environmental: string[]
  }
  followUp: {
    timeframe: string
    focusAreas: string[]
  }
  confidence: number
}

export async function analyzeCosmeticIngredients(
  imageBase64: string,
  userProfile?: {
    age?: number
    skinType?: string
    concerns?: string
    allergies?: string
    location?: string
  }
): Promise<CosmeticAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a cosmetic chemist and ingredient safety expert. Analyze this image of a cosmetic product's ingredient list and provide a comprehensive safety assessment.

${userProfile ? `User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Skin type: ${userProfile.skinType || 'Not specified'}
- Skin concerns: ${userProfile.concerns || 'Not specified'}
- Known allergies: ${userProfile.allergies || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}` : ''}

Please read the ingredient list from the image and provide a detailed analysis in the following JSON format:

{
  "overallSafety": "[safe/caution/avoid - overall safety assessment]",
  "safetyScore": [0-100 overall safety score],
  "productType": "[detected product type - moisturizer, cleanser, serum, etc.]",
  "detectedIngredients": [
    {
      "name": "ingredient name",
      "purpose": "what this ingredient does",
      "safetyLevel": "[safe/moderate/concerning]",
      "description": "detailed explanation of this ingredient",
      "commonUses": ["list of common uses"]
    }
  ],
  "safetyAssessment": {
    "potentialIrritants": ["list of potentially irritating ingredients"],
    "allergens": ["list of common allergens found"],
    "comedogenic": ["list of pore-clogging ingredients"],
    "beneficial": ["list of beneficial ingredients"]
  },
  "recommendations": {
    "skinTypes": {
      "recommended": ["skin types this product is good for"],
      "avoid": ["skin types that should avoid this product"]
    },
    "concerns": ["specific things to watch out for"],
    "alternatives": ["better alternatives if concerns exist"]
  },
  ${userProfile ? `"userSpecificAdvice": {
    "personalRecommendation": "personalized advice based on user profile",
    "allergyConcerns": ["specific allergy concerns for this user"],
    "skinTypeMatch": "how well this matches user's skin type"
  },` : ''}
  "confidence": [0-100 confidence level in this analysis]
}

Focus on:
1. Reading ALL visible ingredients from the image
2. Identifying potentially harmful or beneficial ingredients
3. Providing clear, actionable safety advice
4. Considering the user's profile for personalized recommendations
5. Being specific about WHY certain ingredients might be concerning

Be thorough but easy to understand. If you can't read the ingredients clearly, indicate this in your confidence score.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const analysisResult = JSON.parse(jsonMatch[0]) as CosmeticAnalysisResult
    
    // Validate the result structure
    if (!analysisResult.overallSafety || !analysisResult.safetyScore) {
      throw new Error('Invalid analysis result structure')
    }

    return analysisResult

  } catch (error) {
    console.error('Error analyzing cosmetic ingredients:', error)
    throw new Error('Failed to analyze cosmetic ingredients. Please try again.')
  }
}

// Keep skin analysis as secondary feature
export async function analyzeSkinImage(
  imageBase64: string,
  userProfile?: {
    age?: number
    skinType?: string
    concerns?: string
    allergies?: string
    location?: string
  }
): Promise<SkinAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a professional dermatologist and skin analysis expert. Analyze this skin image and provide a comprehensive, detailed assessment.

${userProfile ? `User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Known skin type: ${userProfile.skinType || 'Not specified'}
- Skin concerns: ${userProfile.concerns || 'Not specified'}
- Allergies: ${userProfile.allergies || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}` : ''}

Please provide a detailed analysis in the following JSON format:

{
  "overallScore": [0-100 overall skin health score],
  "skinType": "[normal/oily/dry/combination/sensitive - your assessment]",
  "mainConcerns": ["list of 2-4 main concerns you observe"],
  "strengths": ["list of 2-4 positive aspects you observe"],
  "detailedAnalysis": {
    "hydration": {
      "score": [0-100],
      "description": "detailed assessment of skin hydration levels"
    },
    "texture": {
      "score": [0-100], 
      "description": "assessment of skin texture, smoothness, roughness"
    },
    "pores": {
      "score": [0-100],
      "description": "assessment of pore size, visibility, congestion"
    },
    "clarity": {
      "score": [0-100],
      "description": "assessment of blemishes, spots, clarity"
    },
    "tone": {
      "score": [0-100],
      "description": "assessment of skin tone evenness, discoloration"
    }
  },
  "recommendations": {
    "immediate": ["3-4 immediate actions to take"],
    "longTerm": ["3-4 long-term skincare goals"],
    "products": [
      {
        "category": "product category (cleanser, moisturizer, etc.)",
        "suggestion": "specific product type suggestion",
        "reasoning": "why this would help"
      }
    ]
  },
  "lifestyle": {
    "diet": ["dietary recommendations"],
    "habits": ["lifestyle habit recommendations"],
    "environmental": ["environmental factor recommendations"]
  },
  "followUp": {
    "timeframe": "recommended time for next analysis",
    "focusAreas": ["areas to monitor for improvement"]
  },
  "confidence": [0-100 confidence level in this analysis]
}

Be specific, professional, and helpful. Consider the user's profile information in your recommendations. Focus on actionable advice.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const analysisResult = JSON.parse(jsonMatch[0]) as SkinAnalysisResult
    
    // Validate the result structure
    if (!analysisResult.overallScore || !analysisResult.skinType) {
      throw new Error('Invalid analysis result structure')
    }

    return analysisResult

  } catch (error) {
    console.error('Error analyzing skin image:', error)
    throw new Error('Failed to analyze skin image. Please try again.')
  }
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix to get just the base64 data
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to convert image to base64'))
    reader.readAsDataURL(file)
  })
}

// Utility function to validate image before processing
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' }
  }
  
  return { valid: true }
} 