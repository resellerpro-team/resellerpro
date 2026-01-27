'use client'

import Link from 'next/link'
import NextImage from 'next/image'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              {/* Subtle glow effect on hover */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>

              <div className="relative flex items-center justify-center bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-blue-100 group-hover:-translate-y-0.5">
                <NextImage
                  src="/logo.png"
                  alt="ResellerPro Logo"
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
              ResellerPro
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Pricing', 'Blog', 'Workflow'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <button className="bg-primary sm:bg-transparent text-sm px-6 py-2.5 font-semibold text-primary-foreground rounded-full sm:rounded-none sm:text-foreground sm:hover:text-primary transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="hidden sm:block px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                Start now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}