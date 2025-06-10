import { Package, ShieldCheck, Users, Trophy, Zap, Sparkles } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: 'Ingredient Scanner',
      description: 'Scan cosmetic product ingredients instantly. Our AI analyzes thousands of ingredients to provide safety ratings and potential concerns.',
    },
    {
      icon: ShieldCheck,
      title: 'Safety Analysis',
      description: 'Get comprehensive safety reports for each ingredient, including comedogenic ratings, allergen alerts, and pregnancy safety information.',
    },
    {
      icon: Sparkles,
      title: 'Skin Analysis',
      description: 'Advanced AI skin analysis feature. Analyze skin condition, detect concerns, and get personalized skincare recommendations.',
    },
    {
      icon: Users,
      title: 'Community Reviews',
      description: 'Read real user reviews and experiences with products. Share your own reviews and help others make informed beauty choices.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get detailed ingredient analysis in seconds. Simply scan a product label or enter ingredients manually for immediate insights.',
    },
    {
      icon: Trophy,
      title: 'Smart Recommendations',
      description: 'Receive personalized product recommendations based on your skin type, concerns, and ingredient preferences. Beauty made simple.',
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Safer Beauty Choices
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the power of AI-driven cosmetic ingredient analysis, safety insights, 
            and a supportive community to make informed beauty decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 