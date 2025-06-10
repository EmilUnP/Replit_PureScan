import { Suspense } from 'react'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { LandingHero } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PublicNavbar />
      <Suspense fallback={<LoadingSpinner />}>
        <LandingHero />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <CTA />
        <Footer />
      </Suspense>
    </main>
  )
} 