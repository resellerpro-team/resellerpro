'use client'

import { useState } from 'react'
import { Check, Sparkles, Zap, Crown, ArrowRight, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  index: number
  isAnnual: boolean
}

function PricingCard({ name, price, description, features, popular, index, isAnnual }: PricingCardProps) {
  return (
    <div
      className={`relative p-8 lg:p-10 rounded-[2rem] transition-all duration-300 flex flex-col h-full ${popular
        ? 'bg-card border-2 border-primary shadow-xl scale-100 lg:scale-105 z-10'
        : 'bg-card border border-border/60 hover:border-border shadow-sm hover:shadow-md'
        }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
            Most Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed h-10">
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {price}
          </span>
          <span className="text-muted-foreground font-medium">
            /{isAnnual ? 'year' : 'mo'}
          </span>
        </div>
        {isAnnual && price !== 'Free' && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 bg-green-50 dark:bg-green-900/20 inline-block px-2 py-1 rounded-md">
            Save 20%
          </p>
        )}
      </div>

      {/* Button */}
      <div className="mb-10">
        <Link href={`/signup?plan=${name.toLowerCase()}`} className="w-full">
          <button
            className={`w-full py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${popular
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent'
              }`}
          >
            Get Started
          </button>
        </Link>
      </div>

      {/* Features Divider */}
      <div className="border-t border-border/50 mb-8" />

      {/* Features List */}
      <div className="space-y-4 flex-grow">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${popular ? 'bg-primary/10' : 'bg-secondary'}`}>
              <Check
                className={`w-3 h-3 ${popular ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}
                strokeWidth={3}
              />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      price: isAnnual ? '₹0' : '₹0',
      description: 'Perfect for testing the waters and organizing your first sales.',
      features: [
        '10 orders per month',
        'Unlimited customers',
        'Smart WhatsApp Paste',
        'Basic Invoice Generation',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      price: isAnnual ? '₹9,999' : '₹999',
      description: 'For growing resellers who need automated workflows.',
      popular: true,
      features: [
        'Everything in Starter',
        '100 orders per month',
        'Advanced Profit Analytics',
        'Remove Branding from Invoice',
        'Priority Chat Support',
        'Product Margin Calculator'
      ],
    },
    {
      name: 'Business',
      price: isAnnual ? '₹19,999' : '₹1,999',
      description: 'Ultimate power for high-volume whatsapp sellers.',
      features: [
        'Everything in Pro',
        'Unlimited orders',
        'Unlimited products',
        'AI WhatsApp Assistant',
        'Multiple Team Members',
        'Custom Domain for Catalog',
        'Dedicated Account Manager'
      ],
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
            Simple & <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose a plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              {...plan}
              index={index}
              isAnnual={isAnnual}
            />
          ))}
        </div>

        {/* FAQ / Trust Mini Section */}
        <div className="mt-24 grid md:grid-cols-2 gap-8 items-center bg-secondary/20 rounded-[2rem] p-8 border border-border/50">
          <div>
            <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions</h3>
            <p className="text-muted-foreground">Can't find the answer you're looking for? Chat with our support team.</p>
          </div>
          <div className="grid gap-4">
            <div className="bg-background p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Can I upgrade later?</h4>
                  <p className="text-sm text-muted-foreground mt-1">Yes, you can upgrade or downgrade your plan at any time from your dashboard.</p>
                </div>
              </div>
            </div>
            <div className="bg-background p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Is my data secure?</h4>
                  <p className="text-sm text-muted-foreground mt-1">Absolutely. Your data is encrypted and stored securely on our platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}