'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Share2, ArrowRight, ShieldCheck, Tag, ShoppingBag, Box, CheckCircle2, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface PremiumProductViewProps {
  product: any
  businessName: string
  businessLogo?: string
  waLink: string
  allImages: string[]
}

export function PremiumProductView({ product, businessName, businessLogo, waLink, allImages }: PremiumProductViewProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Navigate lightbox images
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  // Handle header blur effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle horizontal scroll snapping for images (Mobile)
  const handleScrollImage = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft
      const width = scrollContainerRef.current.clientWidth
      const currentIndex = Math.round(scrollLeft / width)
      if (currentIndex !== activeImage) {
        setActiveImage(currentIndex)
      }
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} from ${businessName}`,
          url: window.location.href,
        })
      } catch (error) {
        // Handle cancel quietly
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const stockBadgeConfig = {
    in_stock: { label: 'In Stock', color: 'bg-emerald-500 text-white', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> },
    low_stock: { label: 'Low Stock', color: 'bg-amber-500 text-white', icon: <Box className="w-4 h-4 mr-1" /> },
    out_of_stock: { label: 'Out of Stock', color: 'bg-rose-500 text-white', icon: <Tag className="w-4 h-4 mr-1" /> },
  }

  const stockInfo = stockBadgeConfig[product.stock_status as keyof typeof stockBadgeConfig] || stockBadgeConfig['out_of_stock']

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 
        ======================================================================
        DYNAMIC HEADER (Visible on both Mobile + Desktop)
        ======================================================================
      */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-slate-200/50 py-3' : 'bg-transparent py-5 lg:py-6 lg:bg-transparent bg-gradient-to-b from-black/50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-white font-bold tracking-tighter shadow-lg text-sm border border-indigo-400/30 overflow-hidden relative">
              {businessLogo ? (
                <Image src={businessLogo} alt={businessName} fill className="object-cover" />
              ) : (
                businessName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className={`font-black tracking-tight leading-none text-lg ${isScrolled ? 'text-slate-900' : 'text-white lg:text-slate-900 drop-shadow-md lg:drop-shadow-none'}`}>
                {businessName}
              </p>
              <p className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${isScrolled ? 'text-slate-500' : 'text-white/80 lg:text-slate-500'}`}>Official Store</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-full transition-colors duration-300 gap-2 border-0 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md lg:bg-slate-100 lg:hover:bg-slate-200 lg:text-slate-700'}`}
            onClick={handleNativeShare}
          >
            <Share2 className="w-4 h-4" />
            <span className="font-semibold hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* 
        ======================================================================
        MAIN CONTENT SPLIT (Desktop: 2 Cols, Mobile: Stacked)
        ======================================================================
      */}
      <main className="max-w-7xl mx-auto min-h-screen lg:pt-28 lg:px-8 lg:pb-12 flex flex-col lg:flex-row gap-0 lg:gap-12 xl:gap-20">
        
        {/* --- LEFT COL: IMAGE GALLERY --- */}
        <section className="relative w-full lg:w-[55%] xl:w-[60%] flex-shrink-0 h-[65vh] sm:h-[70vh] lg:h-[calc(100vh-8rem)] lg:max-h-[800px] bg-slate-100 lg:rounded-[2rem] overflow-hidden lg:shadow-2xl border border-transparent lg:border-slate-200/50 group">
          
          {allImages.length > 0 ? (
            <>
              {/* Mobile/Touch Swipe Container */}
              <div 
                ref={scrollContainerRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none lg:snap-none"
                style={{ scrollBehavior: 'smooth' }}
                onScroll={handleScrollImage}
              >
                {allImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setActiveImage(idx)
                      setIsLightboxOpen(true)
                    }}
                    className={`w-full h-full flex-shrink-0 snap-center relative transition-transform duration-700 ${idx === activeImage ? 'scale-100' : 'scale-95 opacity-50'} lg:scale-100 lg:opacity-100 lg:absolute lg:inset-0 ${idx === activeImage ? 'lg:z-10' : 'lg:z-0 lg:opacity-0'} cursor-pointer group`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Image ${idx + 1}`}
                      fill
                      className="object-cover lg:object-contain bg-slate-50 transition-transform duration-500 group-hover:scale-105"
                      priority={idx === 0}
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl transform scale-90 group-hover:scale-100 hidden lg:flex">
                        <Maximize2 className="w-5 h-5 text-slate-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Image Navigation (Desktop Thumbs & Mobile Dots) */}
              {allImages.length > 1 && (
                <>
                  {/* Mobile Dots */}
                  <div className="absolute bottom-10 inset-x-0 flex justify-center gap-2 z-20 lg:hidden pointer-events-none">
                    {allImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === activeImage ? 'bg-white w-6 shadow-black/20' : 'bg-white/50 w-2'}`} 
                      />
                    ))}
                  </div>

                  {/* Desktop Thumbnails (Floating Left) */}
                  <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${idx === activeImage ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-white/50 hover:border-white opacity-70 hover:opacity-100 hover:scale-105'}`}
                      >
                         <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
              <ShoppingBag className="w-24 h-24 mb-6 opacity-40" />
              <p className="text-lg font-medium text-slate-400 tracking-tight">No image available</p>
            </div>
          )}

          {/* Stock Badge Overlay (Mobile Top Left, Desktop inside Image) */}
          <div className="absolute top-24 lg:top-8 left-4 lg:left-8 z-20">
            <div className={`flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md ${stockInfo.color}`}>
              {stockInfo.icon}
              {stockInfo.label}
            </div>
          </div>
        </section>

        {/* --- RIGHT COL: PRODUCT DETAILS --- */}
        <section className="flex-1 px-5 pt-8 pb-32 sm:px-8 lg:px-0 lg:py-4 flex flex-col justify-between relative z-20 bg-slate-50 lg:bg-transparent -mt-8 lg:mt-0 rounded-t-[2.5rem] lg:rounded-none">
          
          <div className="space-y-8">
            {/* Title & Price Headings */}
            <div className="space-y-4">
              {product.category && (
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs uppercase font-extrabold tracking-widest">
                  {product.category}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 pt-2">
                 <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
                   {formatPrice(product.selling_price)}
                 </span>
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pricing</span>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-slate-200 to-transparent" />

            {/* Description */}
            {product.description && (
              <div className="space-y-4">
                 <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Box className="w-4 h-4" /> Product Details
                 </h2>
                 <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                   {product.description}
                 </p>
              </div>
            )}

            {/* Spec Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Item Code / SKU</p>
                  <p className="font-mono text-base font-bold text-slate-800">{product.sku || 'N/A'}</p>
               </div>
               <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</p>
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 rounded-full shadow-sm ${product.stock_status === 'in_stock' ? 'bg-emerald-500' : product.stock_status === 'low_stock' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                     <p className="text-base font-bold text-slate-800">{stockInfo.label}</p>
                  </div>
               </div>
            </div>

            {/* Video Section */}
            {product.video_url && (() => {
              const url = product.video_url as string
              // Detect YouTube URLs and convert to embed
              const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
              const isYouTube = !!youtubeMatch

              return (
                <div className="space-y-3">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                    Product Video
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm bg-black aspect-video">
                    {isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeMatch![1]}?rel=0&modestbranding=1`}
                        title="Product video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Audio Section */}
            {product.audio_url && (
              <div className="space-y-3">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  Audio Description
                </h2>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200/60 shadow-sm">
                  <audio
                    src={product.audio_url}
                    controls
                    preload="metadata"
                    className="w-full h-10"
                    style={{ borderRadius: '12px' }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Trust Banner */}
            <div className="bg-gradient-to-r from-slate-100 to-white rounded-2xl p-5 border border-slate-200 flex items-center gap-5 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-32 h-32 bg-slate-200 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors" />
               <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 shrink-0 relative z-10">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div className="relative z-10">
                  <p className="text-sm font-black text-slate-900 tracking-tight">Verified Merchant</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Ordering directly via WhatsApp is fast and secure with {businessName}.</p>
               </div>
            </div>
          </div>

          {/* 
            ======================================================================
            DESKTOP CTA (Visible only on Desktop, pushes to bottom of col)
            ======================================================================
          */}
          <div className="hidden lg:block mt-12 mb-4">
             <Link href={waLink} target="_blank" className="group block">
                <Button 
                  size="lg" 
                  className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl shadow-green-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-[#25D366]/50 relative overflow-hidden"
                >
                   <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                   <div className="flex items-center justify-center gap-3 relative z-10 w-full">
                     <MessageCircle className="w-6 h-6 fill-white" />
                     <span className="font-extrabold text-lg tracking-tight">Buy via WhatsApp</span>
                     <ArrowRight className="w-5 h-5 ml-2 opacity-70 group-hover:translate-x-2 transition-transform" />
                   </div>
                </Button>
             </Link>
          </div>
        </section>
      </main>

      {/* 
        ======================================================================
        MOBILE FLOATING ACTION BAR (Hidden on Desktop)
        ======================================================================
      */}
      <div className="fixed bottom-0 inset-x-0 p-4 pb-6 bg-gradient-to-t from-white via-white to-transparent pt-12 z-50 lg:hidden pointer-events-none">
        {/* We place the button explicitly ABOVE the gradient to avoid touch issues */}
        <div className="max-w-lg w-full mx-auto pointer-events-auto shadow-2xl rounded-2xl">
           <Link href={waLink} target="_blank" className="block group">
              <Button 
                size="lg" 
                className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all duration-300 active:scale-[0.98] border border-[#25D366]/50 relative overflow-hidden"
              >
                 <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                 
                 <div className="flex items-center justify-center gap-4 relative z-10 w-full">
                   <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                     <MessageCircle className="w-6 h-6 fill-white/10" />
                   </div>
                   <div className="flex flex-col items-start">
                     <span className="font-bold text-lg tracking-tight leading-none mb-1">Buy via WhatsApp</span>
                     <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Fast & Secure</span>
                   </div>
                   <div className="ml-auto opacity-90 p-2 bg-white/10 rounded-full">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                 </div>
              </Button>
           </Link>
        </div>
      </div>

      {/* 
        ======================================================================
        FULLSCREEN LIGHTBOX OVERLAY
        ======================================================================
      */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 sm:top-8 right-4 sm:right-8 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                setIsLightboxOpen(false)
              }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Navigation Buttons (Hidden if only 1 image) */}
            {allImages.length > 1 && (
              <>
                <button 
                  className="absolute left-2 sm:left-8 z-50 p-3 sm:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors shadow-xl border border-white/10 hidden sm:block"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button 
                  className="absolute right-2 sm:right-8 z-50 p-3 sm:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors shadow-xl border border-white/10 hidden sm:block"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl h-[85vh] sm:h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[activeImage]}
                alt={`${product.name} - Fullscreen Image ${activeImage + 1}`}
                fill
                className="object-contain"
                priority
                quality={100}
              />
            </motion.div>

            {/* Mobile Paging Indicators & Instructions */}
            <div className="absolute bottom-6 sm:bottom-12 inset-x-0 flex flex-col items-center justify-center z-50 pointer-events-none">
              <p className="text-white/50 text-xs mb-4 font-medium tracking-widest uppercase">
                {activeImage + 1} / {allImages.length}
              </p>
              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImage ? 'bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/30 w-2'}`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Hidden mobile invisible areas for tapping left/right */}
            {allImages.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 w-1/3 z-40 sm:hidden" onClick={prevImage} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-40 sm:hidden" onClick={nextImage} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
