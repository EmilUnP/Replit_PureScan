'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/auth-modal'
import { useAuth } from '@/components/providers'
import { Badge } from '@/components/ui/badge'
import { Scan, ShieldCheck, Users, Trophy, Package, Play, ArrowRight } from 'lucide-react'

export function LandingHero() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push('/scan')
    } else {
      setShowAuthModal(true)
    }
  }

  const handleWatchDemo = () => {
    // Add demo functionality here
    console.log('Demo functionality to be implemented')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600">
      {/* Background overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Enhanced background pattern with better visual depth */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/20 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/10 blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24 xl:py-32">
        <div className="text-center text-white">
          {/* Enhanced badge with better visual hierarchy */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <Badge 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              icon={<ShieldCheck className="w-4 h-4 text-green-300" />}
            >
              AI-Powered Cosmetic Safety Analysis
            </Badge>
          </div>
          
          {/* Enhanced heading with better typography */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            <span className="block mb-2">Know What's In Your</span>
            <span className="block bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Beauty Products
            </span>
          </h1>
          
          {/* Enhanced description with better spacing and contrast */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Advanced AI analysis of cosmetic ingredients, safety ratings, and personalized recommendations 
            to help you make informed beauty choices. Plus comprehensive skin analysis features.
          </p>

          {/* Enhanced feature highlights with better visual design */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Package, text: "Ingredient Scanner" },
              { icon: ShieldCheck, text: "Safety Analysis" },
              { icon: Scan, text: "Skin Analysis" },
              { icon: Users, text: "Community Reviews" }
            ].map(({ icon: Icon, text }, index) => (
              <div 
                key={text}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced CTA buttons with better interactions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="xl" 
              variant="gradient"
              className="bg-white text-purple-600 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleGetStarted}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {user ? 'Start New Analysis' : 'Start Your Journey'}
            </Button>
            <Button 
              size="xl" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleWatchDemo}
              leftIcon={<Play className="w-5 h-5" />}
            >
              Watch Demo
            </Button>
          </div>

          {/* Enhanced trust indicators with better visual design */}
          <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="border-t border-white/20 pt-8">
              <p className="text-white/70 mb-6 text-sm">Trusted by beauty enthusiasts worldwide</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                {[
                  { value: "50K+", label: "Products Analyzed" },
                  { value: "15K+", label: "Ingredients Database" },
                  { value: "98%", label: "Accuracy Rate" }
                ].map(({ value, label }, index) => (
                  <div 
                    key={label}
                    className="text-center group hover:scale-105 transition-transform duration-200"
                    style={{ animationDelay: `${1 + index * 0.1}s` }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-200">
                      {value}
                    </div>
                    <div className="text-sm text-white/80">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subtle scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-60">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </section>
  )
} 