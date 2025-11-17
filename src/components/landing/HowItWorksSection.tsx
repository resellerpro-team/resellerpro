'use client'

import {
  Copy,
  Package,
  MessageSquare,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle,
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
  isLast: boolean
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
  details,
  index,
  isLast,
}: StepCardProps) {
  return (
    <div className="relative">
      <div
        className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{ animationDelay: `${index * 200}ms` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Step Number Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold text-xl shadow-lg">
              {number}
            </div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:scale-110 transition-transform duration-300">
              <Icon size={28} />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <p className="text-gray-600 leading-relaxed mb-4 text-lg">{description}</p>

          {/* Details List */}
          <div className="space-y-2">
            {details.map((detail, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300" />
      </div>

      {/* Connecting Arrow */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-12 transform -translate-y-1/2 z-20">
          <ArrowRight className="text-blue-300" size={48} strokeWidth={2} />
        </div>
      )}
    </div>
  )
}

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Copy,
      title: 'Smart Paste from WhatsApp',
      description: 'Copy customer messages from WhatsApp and paste directly into Reseller Pro.',
      details: [
        'Auto-extracts name, phone & address',
        'No manual typing needed',
        'Works in seconds',
      ],
    },
    {
      number: 2,
      icon: Package,
      title: 'Track Orders Centrally',
      description: 'Manage all orders in one organized dashboard with complete visibility.',
      details: [
        'See order status at a glance',
        'Track from processing to delivery',
        'Update customers instantly',
      ],
    },
    {
      number: 3,
      icon: MessageSquare,
      title: 'Message Dealers Instantly',
      description: 'Send pre-formatted messages to dealers with one click via WhatsApp.',
      details: [
        'Pre-built message templates',
        'One-click WhatsApp integration',
        'Save hours on communication',
      ],
    },
    {
      number: 4,
      icon: FileText,
      title: 'Generate Branded Invoices',
      description: 'Create professional invoices with your business name and logo automatically.',
      details: ['Custom branded design', 'Instant generation', 'Look more professional'],
    },
  ]

  return (
    <section
      id="workflow"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white"
    >
      {/* Background Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
            <Sparkles size={16} />
            <span>Simple & Powerful</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              It Works
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From WhatsApp chaos to organized business in 4 simple steps. No complicated setup, no
            learning curve.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 lg:grid-cols-2 mb-20">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              details={step.details}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />

            <div className="relative z-10 text-center space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to transform your WhatsApp business?
              </h3>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join growing resellers who are saving hours every week with smart automation
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/signup">
                  <button className="group px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </Link>
                <button className="px-8 py-4 bg-transparent text-white rounded-xl hover:bg-white/10 transition-all font-semibold border-2 border-white/30 backdrop-blur-sm">
                  Watch Demo Video
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 pt-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Free forever plan</span>
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
