'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, IndianRupee, ShoppingCart, Package, Users, BarChart3, Sparkles } from 'lucide-react'
import NextImage from 'next/image'

export function FirstVisitLoader() {
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('resellerpro_visited')

    if (!hasVisited) {
      setIsFirstVisit(true)

      // Animation sequence
      const steps = [0, 1, 2, 3]
      let stepIndex = 0

      const interval = setInterval(() => {
        stepIndex++
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex])
        }
      }, 1000)

      // Hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        localStorage.setItem('resellerpro_visited', 'true')
      }, 4000)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [])

  if (!isFirstVisit) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Money Icons */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: '100vh',
                  x: Math.random() * window.innerWidth,
                  opacity: 0.3,
                  rotate: 0
                }}
                animate={{
                  y: '-10vh',
                  rotate: 360,
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: Math.random() * 3 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
                className="absolute text-white/20"
              >
                <IndianRupee size={Math.random() * 30 + 20} />
              </motion.div>
            ))}

            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center px-6">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                duration: 0.8
              }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Pulsing Background */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 bg-white/30 rounded-full blur-2xl"
                />

                {/* Icon Circle */}
                <div className="relative bg-white rounded-full p-6 shadow-2xl overflow-hidden flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="flex items-center justify-center"
                  >
                    <NextImage
                      src="/logo.png"
                      alt="ResellerPro Logo"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  </motion.div>
                </div>

                {/* Orbiting Icons */}
                {[ShoppingCart, Package, Users, BarChart3].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{ marginLeft: '-12px', marginTop: '-12px' }}
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * Math.PI) / 2) * 80,
                      y: Math.sin((i * Math.PI) / 2) * 80
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.2
                    }}
                  >
                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-4"
            >
              <motion.h1
                className="text-5xl md:text-6xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Welcome to{' '}
                <motion.span
                  className="inline-block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    backgroundSize: '200% auto'
                  }}
                >
                  ResellerPro
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xl text-white/90 font-medium"
              >
                Your Complete Business Operating System
              </motion.p>
            </motion.div>

            {/* Loading Steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 space-y-3"
            >
              {[
                { icon: Package, text: 'Loading Products' },
                { icon: Users, text: 'Setting Up Customers' },
                { icon: ShoppingCart, text: 'Preparing Orders' },
                { icon: BarChart3, text: 'Initializing Dashboard' }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: currentStep >= i ? 1 : 0.3,
                    x: 0
                  }}
                  transition={{ delay: 1.4 + (i * 0.1) }}
                  className="flex items-center justify-center gap-3"
                >
                  <step.icon
                    className={`w-5 h-5 ${currentStep >= i ? 'text-green-300' : 'text-white/40'
                      }`}
                  />
                  <span
                    className={`text-sm ${currentStep >= i ? 'text-white font-medium' : 'text-white/40'
                      }`}
                  >
                    {step.text}
                  </span>
                  {currentStep >= i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-8 max-w-md mx-auto"
            >
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-sm mt-3"
              >
                {Math.round(((currentStep + 1) / 4) * 100)}% Complete
              </motion.p>
            </motion.div>

            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}