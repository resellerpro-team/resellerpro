'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-1 cursor-pointer group"
          >
            <div className="relative -m-2">
              <NextImage
                src="/logo.svg"
                alt="ResellerPro Logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain mr-2"
              />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
              ResellerPro
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => {
              const href = `/${item.toLowerCase()}`
              const isActive = pathname === href
              return (
                <Link
                  key={item}
                  href={href}
                  className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  {item}
                </Link>
              )
            })}
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