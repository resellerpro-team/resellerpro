'use client'

import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  index: number
}

function PricingCard({ name, price, description, features, popular, index }: PricingCardProps) {
  return (
    <div
      className={`relative p-8 rounded-2xl transition-all duration-300 ${
        popular
          ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl scale-105 hover:scale-110'
          : 'bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-2'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
            <Crown size={14} />
            <span>MOST POPULAR</span>
          </div>
        </div>
      )}

      {!popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-cyan-50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative z-10">
        {/* Icon Badge */}
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${
            popular ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}
        >
          {name === 'Free' && (
            <Sparkles className={popular ? 'text-white' : 'text-white'} size={24} />
          )}
          {name === 'Professional' && <Zap className="text-white" size={24} />}
          {name === 'Business' && (
            <Crown className={popular ? 'text-white' : 'text-white'} size={24} />
          )}
        </div>

        {/* Plan Name */}
        <h3 className={`text-2xl font-bold mb-2 ${popular ? 'text-white' : 'text-gray-900'}`}>
          {name}
        </h3>

        {/* Description */}
        <p className={`text-sm mb-6 ${popular ? 'text-blue-100' : 'text-gray-600'}`}>
          {description}
        </p>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline">
            <span className={`text-5xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
              {price}
            </span>
            <span className={`text-lg ml-2 ${popular ? 'text-blue-100' : 'text-gray-600'}`}>
              /month
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/signup?plan=${name.toLowerCase()}`}>
          <button
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mb-8 ${
              popular
                ? 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg'
            }`}
          >
            <span>{popular || name !== 'Free' ? 'Get Started Now' : 'Start Free Trial'}</span>
            <ArrowRight size={18} />
          </button>
        </Link>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  popular ? 'bg-white/20 backdrop-blur-sm' : 'bg-blue-100'
                }`}
              >
                <Check
                  className={popular ? 'text-white' : 'text-blue-600'}
                  size={14}
                  strokeWidth={3}
                />
              </div>
              <span
                className={`text-sm leading-relaxed ${popular ? 'text-blue-50' : 'text-gray-700'}`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative gradient blob */}
      {!popular && (
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300" />
      )}
    </div>
  )
}

export default function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      description: 'Perfect for getting started',
      features: [
        '10 orders per month',
        '10 products',
        'Unlimited customers',
        'Smart Paste',
        'Manual WhatsApp actions',
        'Basic analytics',
        'Branded invoice (Powered by us)',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '₹999',
      description: 'For growing businesses',
      popular: true,
      features: [
        '100 orders per month',
        '100 products',
        'Advanced analytics',
        'Semi-auto WhatsApp actions',
        'PDF invoice with your logo',
        'Priority support',
        'Remove branding (from invoice)',
      ],
    },
    {
      name: 'Business',
      price: '₹1,999',
      description: 'For power users',
      features: [
        'Unlimited orders',
        'Unlimited products',
        'Full analytics + Export',
        'AI WhatsApp Assistant',
        'Smart dealer auto-notifications',
        'Custom integrations',
        '10 team members',
        'Premium support',
      ],
    },
  ]

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white -z-10" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
            <Sparkles size={16} />
            <span>Flexible Pricing</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Simple,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              transparent pricing
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              index={index}
            />
          ))}
        </div>

        {/* Bottom Trust Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Still not sure? Try it free!</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start with our free plan and upgrade anytime. No credit card required. Cancel
                anytime with no questions asked.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Check className="text-green-600" size={18} strokeWidth={3} />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Check className="text-green-600" size={18} strokeWidth={3} />
                  <span>14-day money-back guarantee</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Check className="text-green-600" size={18} strokeWidth={3} />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}
