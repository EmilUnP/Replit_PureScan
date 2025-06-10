'use client'

import { PublicNavbar } from '@/components/layout/public-navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, 
  Sparkles, 
  Package, 
  Users, 
  Brain, 
  Target,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const features = [
    {
      icon: Package,
      title: "Cosmetic Ingredient Analysis",
      description: "Our AI analyzes every ingredient in your beauty products, providing detailed safety ratings and potential concerns."
    },
    {
      icon: ShieldCheck,
      title: "Safety Scoring",
      description: "Get comprehensive safety scores based on scientific research and regulatory data from trusted sources."
    },
    {
      icon: Sparkles,
      title: "Skin Analysis",
      description: "Upload photos for AI-powered skin analysis to understand your skin type and get personalized recommendations."
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced machine learning algorithms provide accurate analysis and personalized recommendations."
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description: "Receive tailored product suggestions based on your skin type, concerns, and ingredient preferences."
    },
    {
      icon: Users,
      title: "Community Reviews",
      description: "Connect with other beauty enthusiasts and share experiences with products and ingredients."
    }
  ]

  const benefits = [
    "Make informed decisions about your beauty products",
    "Avoid harmful ingredients that could damage your skin",
    "Discover safer alternatives to your current products",
    "Understand your skin better with AI analysis",
    "Save money by avoiding products that don't work for you",
    "Join a community of conscious beauty consumers"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About PureScan2
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Empowering consumers to make safer, smarter beauty choices through 
              AI-powered ingredient analysis and skin assessment technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                At PureScan2, we believe everyone deserves to know what they're putting on their skin. 
                Our mission is to democratize access to cosmetic safety information through cutting-edge 
                AI technology, making it easier than ever to make informed beauty choices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  The Problem We Solve
                </h3>
                <p className="text-gray-600 mb-6">
                  The beauty industry uses thousands of ingredients, many with complex names 
                  and unclear safety profiles. Most consumers lack the time or expertise to 
                  research every ingredient in their products, leading to:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Skin reactions and irritation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Wasted money on unsuitable products
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Confusion about ingredient safety
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Lack of personalized recommendations
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Solution
                </h3>
                <p className="text-gray-600 mb-6">
                  PureScan2 leverages advanced AI to instantly analyze cosmetic ingredients 
                  and provide clear, actionable insights. We combine scientific research, 
                  regulatory data, and machine learning to deliver:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Instant ingredient safety analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Personalized product recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    AI-powered skin analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Evidence-based safety scores
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                How PureScan2 Works
              </h2>
              <p className="text-xl text-gray-600">
                Our comprehensive platform combines multiple AI technologies to give you 
                complete insights into your beauty products.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose PureScan2?
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of users who have transformed their beauty routine with our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600 mr-4 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Beauty Routine?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your journey to safer, smarter beauty choices today.
            </p>
            <Link href="/scan">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-4 h-auto font-semibold"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 