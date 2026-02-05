'use client'

import { Mail, Phone, Facebook, Instagram, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-20 pb-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

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
              <span className="text-2xl font-bold text-gray-900">ResellerPro</span>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link href="/#features" className="hover:text-blue-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-blue-600 transition-colors">
                  Workflow
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-blue-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-600" />
                <a href="mailto:resellerpro@gmail.com" className="hover:text-blue-600">
                  resellerpro.tech@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-600" />
                <a href="tel:+917736767759" className="hover:text-blue-600">
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
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-100 transition-all shadow-sm hover:shadow-md"
                >
                  <Icon size={20} className="text-gray-700 hover:text-blue-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-500 text-sm">
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
