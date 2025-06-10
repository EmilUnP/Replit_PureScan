'use client'

import { PublicNavbar } from '@/components/layout/public-navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  Sparkles, 
  Crown, 
  ArrowRight,
  Zap,
  Shield,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with basic ingredient analysis",
      icon: Sparkles,
      color: "from-blue-600 to-purple-600",
      features: [
        "5 product scans per month",
        "Basic ingredient safety analysis", 
        "Simple safety ratings",
        "Community access",
        "Email support"
      ],
      limitations: [
        "Limited detailed reports",
        "No personalized recommendations",
        "No skin analysis"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Ideal for beauty enthusiasts who want comprehensive analysis",
      icon: Shield,
      color: "from-purple-600 to-pink-600",
      features: [
        "Unlimited product scans",
        "Detailed ingredient analysis",
        "Personalized recommendations",
        "Advanced safety reports",
        "Skin analysis (3 per month)",
        "Priority email support",
        "Export reports as PDF",
        "Ingredient alternatives suggestions"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$19.99", 
      period: "per month",
      description: "For professionals and serious beauty enthusiasts",
      icon: Crown,
      color: "from-pink-600 to-red-600",
      features: [
        "Everything in Pro",
        "Unlimited skin analysis",
        "Brand analysis & comparisons",
        "Custom ingredient alerts",
        "Advanced skin tracking",
        "1-on-1 expert consultations",
        "Priority chat support",
        "Early access to new features",
        "White-label reports"
      ],
      limitations: [],
      cta: "Start Premium Trial",
      popular: false
    }
  ]

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, both Pro and Premium plans come with a 14-day free trial. No credit card required to start."
    },
    {
      question: "How accurate is the analysis?",
      answer: "Our AI achieves 98% accuracy by combining scientific research, regulatory data, and machine learning algorithms."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption and never sell your personal data to third parties."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Choose the perfect plan for your beauty analysis needs. 
              Start free and upgrade anytime.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">14-day free trial on all paid plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const Icon = plan.icon
                return (
                  <div 
                    key={index} 
                    className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                      plan.popular ? 'border-2 border-purple-500 scale-105' : 'border border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 ml-2">/{plan.period}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        {plan.description}
                      </p>
                      
                      <Button 
                        className={`w-full mb-6 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                            : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">What's included:</h4>
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                        
                        {plan.limitations.length > 0 && (
                          <>
                            <h4 className="font-semibold text-gray-900 mt-6">Limitations:</h4>
                            {plan.limitations.map((limitation, limitIndex) => (
                              <div key={limitIndex} className="flex items-center">
                                <div className="w-5 h-5 mr-3 flex-shrink-0">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mt-1.5"></div>
                                </div>
                                <span className="text-gray-500">{limitation}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose PureScan2?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Join thousands of beauty enthusiasts who trust our AI-powered analysis
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">98% Accuracy</h3>
                <p className="text-gray-600">
                  Industry-leading accuracy powered by advanced AI and scientific research
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">50K+ Users</h3>
                <p className="text-gray-600">
                  Trusted by beauty enthusiasts worldwide for safer product choices
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Results</h3>
                <p className="text-gray-600">
                  Get comprehensive analysis and recommendations in seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Got questions? We've got answers.
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
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
              Ready to Start Your Beauty Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users making safer beauty choices with PureScan2.
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