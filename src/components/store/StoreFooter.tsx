import Link from 'next/link'
import { Instagram, Facebook, Twitter, MessageCircle, Youtube, Heart } from 'lucide-react'
import type { Profile, ShopTheme } from '@/types'

interface StoreFooterProps {
  profile: Profile
  theme: ShopTheme | null
}

export function StoreFooter({ profile, theme }: StoreFooterProps) {
  const storeName = profile.shop_name || profile.business_name || 'Store'
  const waNum = theme?.socialWhatsApp || profile.whatsapp_number || profile.business_phone
  const waClean = waNum?.replace(/\D/g, '')
  const waLink = waClean ? `https://wa.me/91${waClean}?text=${encodeURIComponent('Hi! I wanted to inquire about a product.')}` : null

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">{storeName}</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Your one-stop shop for premium quality products at the best prices. Crafted for your modern lifestyle with direct shipping and hassle-free updates.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}#new-arrivals`} className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}#best-sellers`} className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}#offers`} className="hover:text-white transition-colors">
                  Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Help & Support</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Account & Store Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href={`/store/${profile.shop_slug}`} className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:items-start gap-1">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 flex items-center gap-1 font-semibold">
              Powered by <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" /> ResellerPro
            </p>
          </div>

          {/* We Accept Payment Icons */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 mr-1">We Accept:</span>
            {/* Visa */}
            <span className="bg-slate-900 px-2.5 py-1 rounded text-[9px] font-black text-slate-300 border border-slate-800 tracking-wider">VISA</span>
            {/* Mastercard */}
            <span className="bg-slate-900 px-2.5 py-1 rounded text-[9px] font-black text-slate-300 border border-slate-800 tracking-wider">MASTERCARD</span>
            {/* RuPay */}
            <span className="bg-slate-900 px-2.5 py-1 rounded text-[9px] font-black text-slate-300 border border-slate-800 tracking-wider">RUPAY</span>
            {/* UPI */}
            <span className="bg-slate-900 px-2.5 py-1 rounded text-[9px] font-black text-slate-300 border border-slate-800 tracking-wider">UPI</span>
          </div>

          {/* Social Media Link Buttons */}
          <div className="flex items-center gap-3">
            {theme?.socialInstagram && (
              <a
                href={`https://instagram.com/${theme.socialInstagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all duration-300"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
