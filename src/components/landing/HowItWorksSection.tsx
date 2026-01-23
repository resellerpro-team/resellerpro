'use client'

import {
  Copy,
  Package,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  PlayCircle
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

interface StepCardProps {
  number: number
  icon: ComponentType<LucideProps>
  title: string
  description: string
  details: string[]
  index: number
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
  details,
  index,
}: StepCardProps) {
  return (
    <div
      className="group relative bg-card text-card-foreground rounded-[2rem] p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* Step Badge & Icon Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon size={28} />
        </div>
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
          Step 0{number}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {/* Details List (Pushed to bottom) */}
      <div className="mt-auto space-y-3 pt-6 border-t border-border/50">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={16} />
            <span className="text-sm text-muted-foreground font-medium">{detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: MessageSquare,
      title: 'Add WhatsApp Enquiries',
      description: 'When you receive a customer message, quickly add it as an enquiry. Never lose a lead again.',
      details: [
        'Save Name & Phone',
        'Track pending leads',
        'Set reminders'
      ],
    },
    {
      number: 2,
      icon: CheckCircle2,
      title: 'Track Enquiry Status',
      description: 'Visualize your sales pipeline. Move customers from "Enquiry" to "Converted" with a click.',
      details: [
        'Status labels',
        'Filter by progress',
        'Follow-up alerts'
      ],
    },
    {
      number: 3,
      icon: Copy,
      title: 'Convert to Order',
      description: 'Customer said yes? Instantly convert the chat into a formal order without re-typing details.',
      details: [
        'Smart Paste details',
        'Select products',
        'Auto-calculate total'
      ],
    },
    {
      number: 4,
      icon: Package,
      title: 'Manage & Ship',
      description: 'Keep track of what needs to be packed, shipped, or delivered. Update customers in real-time.',
      details: [
        'Shipment tracking',
        'WhatsApp templates',
        'One-click updates'
      ],
    },
    {
      number: 5,
      icon: FileText,
      title: 'View Analytics',
      description: 'Understand your profit margins. See which products are selling and who your best customers are.',
      details: [
        'Daily profit reports',
        'Order trends',
        'Export data'
      ],
    },
  ]

  return (
    <section id="workflow" className="py-24 bg-background relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[120px] -z-10 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
            From Chaos to <span className="text-primary">Clarity</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple 5-step workflow designed specifically for WhatsApp resellers.
            No learning curve required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              {...step}
              index={index}
            />
          ))}

          {/* Last card: "Start Now" filler to make the grid even or act as a CTA within the grid */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-[2rem] p-8 border border-primary shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
            <p className="text-primary-foreground/80 mb-8">Join 10,000+ resellers today.</p>
            <Link href="/signup">
              <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Wide CTA */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-foreground text-background p-10 md:p-16 text-center">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-primary rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              Stop managing your business on a notepad.
            </h3>
            <p className="text-muted-foreground/80 text-lg">
              Experience the power of a dedicated CRM built for your reselling business.
              Setup takes less than 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight size={20} />
                </button>
              </Link>

              <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-background border border-background/20 rounded-full font-bold text-lg hover:bg-background/10 transition-all flex items-center justify-center gap-2">
                <PlayCircle size={20} /> Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground/60">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Free Forever Plan</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> No Credit Card</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}