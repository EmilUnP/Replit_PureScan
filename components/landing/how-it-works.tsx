import { Camera, Brain, ShieldCheck, TrendingUp } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: 'Scan or Enter Ingredients',
      description: 'Take a photo of your product label or manually enter the ingredient list. Our AI recognizes and processes ingredient information instantly.',
      step: '01',
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Our advanced algorithms analyze each ingredient for safety, comedogenic ratings, allergens, and potential benefits or concerns.',
      step: '02',
    },
    {
      icon: ShieldCheck,
      title: 'Get Safety Report',
      description: 'Receive detailed safety analysis with ingredient breakdown, risk assessment, and personalized warnings based on your skin type.',
      step: '03',
    },
    {
      icon: TrendingUp,
      title: 'Make Informed Choices',
      description: 'Use insights to choose safer products, track your cosmetic library, and discover better alternatives with community recommendations.',
      step: '04',
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How PureScan2 Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get professional-grade cosmetic ingredient analysis in four simple steps. 
            Make informed beauty choices with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Make Safer Beauty Choices?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of beauty enthusiasts who trust PureScan2 for ingredient analysis and safety insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">50K+</div>
                <div className="text-sm text-gray-600">Products Analyzed</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 