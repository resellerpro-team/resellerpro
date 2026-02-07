'use client'

import { Mail, Phone, Facebook, Instagram, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-background pt-20 pb-10 overflow-hidden border-t border-border">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo + About */}
          <div className="space-y-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
            >
              <NextImage
                src="/logo.svg"
                alt="ResellerPro"
                width={64}
                height={64}
                className="w-16 h-16"
              />
              <span className="text-2xl font-bold text-foreground">ResellerPro</span>
            </div>

            <p className="text-muted-foreground leading-relaxed text-sm">
              Your all-in-one platform to manage products, customers & orders. Built for modern
              resellers who want to grow faster.
            </p>

            <Link href="/signup">
              <button className="group mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all">
                <span>Start Free Trial</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-primary transition-colors">
                  Workflow
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary" />
                <a href="mailto:resellerpro@gmail.com" className="hover:text-primary">
                  resellerpro.tech@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary" />
                <a href="tel:+917736767759" className="hover:text-primary">
                  +91 7736767759
                </a>
              </li>

            </ul>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              {[Facebook, Instagram, MessageCircle].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-primary/20 transition-all shadow-sm hover:shadow-md"
                >
                  <Icon size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ResellerPro. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </footer>
  )
}
