'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img
              src="/icons/icon-512x512.png"
              alt="ResellerPro Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-gray-900">ResellerPro</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#workflow"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Workflow
            </a>
            <Link href="/signup">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md">
                Get Started
              </button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fadeIn">
            <a
              href="#features"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Testimonials
            </a>
            <Link href="/signup">
              <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
