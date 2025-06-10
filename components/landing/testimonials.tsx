import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Beauty Enthusiast',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      content: 'PureScan2 saved me from so many harmful ingredients! I discovered my moisturizer had comedogenic ingredients causing my breakouts. Now I only buy products after scanning them first.',
    },
    {
      name: 'Marcus Johnson',
      role: 'Dermatology Student',
      avatar: '/avatars/marcus.jpg',
      rating: 5,
      content: 'As someone studying dermatology, I\'m impressed by the ingredient database accuracy. It\'s incredibly helpful for understanding product formulations and potential skin reactions.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Beauty Blogger',
      avatar: '/avatars/emily.jpg',
      rating: 5,
      content: 'This app is a game-changer for product reviews! I can quickly analyze ingredients and provide my followers with science-backed safety information. The community features are fantastic too.',
    },
    {
      name: 'David Kim',
      role: 'Sensitive Skin',
      avatar: '/avatars/david.jpg',
      rating: 5,
      content: 'Finally found an app that helps me avoid my allergens! The ingredient scanner immediately flags problematic ingredients. My skin irritation has reduced significantly.',
    },
    {
      name: 'Lisa Thompson',
      role: 'Wellness Coach',
      avatar: '/avatars/lisa.jpg',
      rating: 5,
      content: 'I recommend PureScan2 to all my clients who want cleaner beauty products. The safety analysis helps them make informed choices about what they put on their skin.',
    },
    {
      name: 'Alex Rivera',
      role: 'College Student',
      avatar: '/avatars/alex.jpg',
      rating: 5,
      content: 'Love how it helps me find budget-friendly products with safe ingredients! The skin analysis feature is amazing too. Perfect for students who need to be smart with spending.',
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Beauty Enthusiasts Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our community has to say about their PureScan2 experience 
            and how it's helped them make safer beauty choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200" />
                <p className="text-gray-700 leading-relaxed pl-6">
                  {testimonial.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join Our Growing Community
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">15K+</div>
                <div className="text-gray-600">Beauty Enthusiasts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
                <div className="text-gray-600">Products Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
                <div className="text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 