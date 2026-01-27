'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react' // Using Package icon as placeholder logo

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Image
              src="/icons/icon-512x512.png"
              alt="ResellerPro Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-gray-900">ResellerPro</span>
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
              <button className="hidden sm:block text-sm font-semibold text-foreground hover:text-primary transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                Start now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}