import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* Pricing */}
      <PricingSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Faq Section */}
      <FAQSection />

      {/* CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

