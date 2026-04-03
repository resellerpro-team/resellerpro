'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSliderProps {
  banners: Banner[];
  primaryColor?: string;
  autoSlideInterval?: number;
}

export function HeroSlider({ 
  banners, 
  primaryColor = '#4f46e5', 
  autoSlideInterval = 5000 
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoSlideInterval)
    return () => clearInterval(timer)
  }, [banners.length, autoSlideInterval])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'max(400px, 60vh)' }}>
      {banners.map((banner, index) => (
        <div 
          key={banner.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
          
          <Image 
            src={banner.image_url} 
            alt={banner.title || 'Banner'} 
            fill 
            sizes="100vw"
            className="object-cover object-center" 
            priority={index === 0}
          />

          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center">
            {banner.title && (
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-4xl tracking-tight animate-fade-in-up">
                {banner.title}
              </h1>
            )}
            {banner.subtitle && (
              <p className="mt-4 md:mt-6 text-base md:text-xl text-white/90 max-w-2xl font-medium animate-fade-in-up delay-100">
                {banner.subtitle}
              </p>
            )}
            {banner.ctaText && (
              <a href={banner.ctaLink || '#products'}
                className="mt-8 px-8 py-3.5 bg-white font-bold rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95 border-2 border-white/50 inline-flex items-center gap-2 animate-fade-in-up delay-200"
                style={{ color: primaryColor }}>
                {banner.ctaText} <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all rounded-full ${
                  i === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
