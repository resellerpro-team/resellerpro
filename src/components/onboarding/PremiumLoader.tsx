// 'use client'

// import { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { TrendingUp, DollarSign, ShoppingCart, Package, Users, BarChart3, Sparkles } from 'lucide-react'
// import { usePathname } from 'next/navigation'

// export function AppLoader() {
//   const [isVisible, setIsVisible] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const pathname = usePathname()

//   useEffect(() => {
//     // Check if loader already shown in this session
//     const hasShownThisSession = sessionStorage.getItem('loader_shown')
    
//     // Only show on dashboard/main app pages, not on auth pages
//     const shouldShow = !hasShownThisSession && 
//                        pathname !== '/login' && 
//                        pathname !== '/signup'

//     if (shouldShow) {
//       setIsVisible(true)
      
//       // Mark as shown for this browser session
//       sessionStorage.setItem('loader_shown', 'true')
      
//       // Animation sequence
//       const steps = [0, 1, 2, 3]
//       let stepIndex = 0
      
//       const interval = setInterval(() => {
//         stepIndex++
//         if (stepIndex < steps.length) {
//           setCurrentStep(steps[stepIndex])
//         }
//       }, 800)

//       // Hide after 3.5 seconds
//       const timer = setTimeout(() => {
//         setIsVisible(false)
//       }, 3500)

//       return () => {
//         clearInterval(interval)
//         clearTimeout(timer)
//       }
//     }
//   }, [pathname])

//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0, scale: 1.05 }}
//           transition={{ duration: 0.4 }}
//           className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center"
//         >
//           {/* Animated Background */}
//           <div className="absolute inset-0 overflow-hidden">
//             {/* Floating Money Icons */}
//             {[...Array(12)].map((_, i) => (
//               <motion.div
//                 key={`money-${i}`}
//                 initial={{ 
//                   y: '110vh', 
//                   x: `${Math.random() * 100}vw`,
//                   opacity: 0.3,
//                   rotate: 0
//                 }}
//                 animate={{ 
//                   y: '-10vh',
//                   rotate: 360,
//                   opacity: [0.3, 0.6, 0.3]
//                 }}
//                 transition={{
//                   duration: Math.random() * 3 + 3,
//                   repeat: Infinity,
//                   delay: Math.random() * 1,
//                   ease: 'linear'
//                 }}
//                 className="absolute"
//                 style={{ left: 0 }}
//               >
//                 <DollarSign 
//                   size={Math.random() * 30 + 20} 
//                   className="text-white/20"
//                 />
//               </motion.div>
//             ))}

//             {/* Grid Pattern */}
//             <motion.div
//               animate={{
//                 backgroundPosition: ['0px 0px', '40px 40px']
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 ease: 'linear'
//               }}
//               className="absolute inset-0"
//               style={{
//                 backgroundImage: `
//                   linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
//                   linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
//                 `,
//                 backgroundSize: '40px 40px'
//               }}
//             />
//           </div>

//           {/* Main Content */}
//           <div className="relative z-10 text-center px-6">
            
//             {/* Animated Logo */}
//             <motion.div
//               initial={{ scale: 0, rotate: -180 }}
//               animate={{ scale: 1, rotate: 0 }}
//               transition={{ 
//                 type: 'spring', 
//                 stiffness: 260, 
//                 damping: 20,
//                 duration: 0.6 
//               }}
//               className="mb-8"
//             >
//               <div className="relative inline-block">
//                 {/* Pulsing Glow */}
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.3, 1],
//                     opacity: [0.3, 0.6, 0.3]
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: 'easeInOut'
//                   }}
//                   className="absolute inset-0 bg-white/40 rounded-full blur-3xl"
//                 />
                
//                 {/* Main Logo Circle */}
//                 <div className="relative bg-white rounded-full p-8 shadow-2xl">
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{ 
//                       duration: 15, 
//                       repeat: Infinity, 
//                       ease: 'linear' 
//                     }}
//                   >
//                     <TrendingUp className="w-20 h-20 text-purple-600" strokeWidth={2.5} />
//                   </motion.div>
//                 </div>

//                 {/* Orbiting Business Icons */}
//                 {[
//                   { Icon: ShoppingCart, delay: 0, color: 'text-purple-600' },
//                   { Icon: Package, delay: 0.25, color: 'text-pink-600' },
//                   { Icon: Users, delay: 0.5, color: 'text-indigo-600' },
//                   { Icon: BarChart3, delay: 0.75, color: 'text-violet-600' }
//                 ].map(({ Icon, delay, color }, i) => (
//                   <motion.div
//                     key={i}
//                     className="absolute top-1/2 left-1/2"
//                     style={{ marginLeft: '-16px', marginTop: '-16px' }}
//                     animate={{
//                       rotate: 360,
//                     }}
//                     transition={{
//                       duration: 4,
//                       repeat: Infinity,
//                       ease: 'linear',
//                       delay: delay
//                     }}
//                   >
//                     <motion.div
//                       animate={{
//                         x: Math.cos((i * Math.PI) / 2 + (delay * Math.PI * 2)) * 90,
//                         y: Math.sin((i * Math.PI) / 2 + (delay * Math.PI * 2)) * 90
//                       }}
//                       transition={{
//                         duration: 4,
//                         repeat: Infinity,
//                         ease: 'linear'
//                       }}
//                     >
//                       <div className="bg-white rounded-full p-3 shadow-xl">
//                         <Icon className={`w-7 h-7 ${color}`} strokeWidth={2} />
//                       </div>
//                     </motion.div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* Brand Name */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.5 }}
//               className="space-y-3 mb-10"
//             >
//               <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight">
//                 <motion.span
//                   className="inline-block"
//                   animate={{
//                     textShadow: [
//                       '0 0 20px rgba(255,255,255,0.5)',
//                       '0 0 40px rgba(255,255,255,0.8)',
//                       '0 0 20px rgba(255,255,255,0.5)'
//                     ]
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: 'easeInOut'
//                   }}
//                 >
//                   ResellerPro
//                 </motion.span>
//               </h1>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.7 }}
//                 className="text-xl md:text-2xl text-white/90 font-medium"
//               >
//                 Your Complete Business OS
//               </motion.p>
//             </motion.div>

//             {/* Loading Steps */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.9 }}
//               className="space-y-3 mb-8"
//             >
//               {[
//                 { icon: Package, text: 'Loading Products', color: 'text-blue-300' },
//                 { icon: Users, text: 'Loading Customers', color: 'text-green-300' },
//                 { icon: ShoppingCart, text: 'Loading Orders', color: 'text-yellow-300' },
//                 { icon: BarChart3, text: 'Loading Dashboard', color: 'text-pink-300' }
//               ].map((step, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, x: -30 }}
//                   animate={{ 
//                     opacity: currentStep >= i ? 1 : 0.4,
//                     x: 0
//                   }}
//                   transition={{ delay: 1 + (i * 0.1) }}
//                   className="flex items-center justify-center gap-4"
//                 >
//                   <div className={`
//                     w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
//                     ${currentStep >= i ? 'bg-white shadow-lg' : 'bg-white/20'}
//                   `}>
//                     <step.icon 
//                       className={`w-5 h-5 transition-colors ${
//                         currentStep >= i ? 'text-purple-600' : 'text-white/40'
//                       }`} 
//                     />
//                   </div>

//                   <span 
//                     className={`text-base font-medium transition-all duration-300 ${
//                       currentStep >= i ? 'text-white' : 'text-white/40'
//                     }`}
//                   >
//                     {step.text}
//                   </span>

//                   <AnimatePresence>
//                     {currentStep >= i && (
//                       <motion.div
//                         initial={{ scale: 0, rotate: -180 }}
//                         animate={{ scale: 1, rotate: 0 }}
//                         exit={{ scale: 0 }}
//                         transition={{ type: 'spring', stiffness: 500, damping: 25 }}
//                         className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shadow-lg"
//                       >
//                         <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </motion.div>
//               ))}
//             </motion.div>

//             {/* Progress Bar */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 1.3 }}
//               className="max-w-md mx-auto"
//             >
//               <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
//                 <motion.div
//                   initial={{ width: '0%' }}
//                   animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
//                   transition={{ duration: 0.5, ease: 'easeOut' }}
//                   className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full relative"
//                 >
//                   {/* Shimmer Effect */}
//                   <motion.div
//                     className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
//                     animate={{
//                       x: ['-100%', '200%']
//                     }}
//                     transition={{
//                       duration: 1,
//                       repeat: Infinity,
//                       ease: 'linear'
//                     }}
//                   />
//                 </motion.div>
//               </div>

//               <motion.p
//                 className="text-white/70 text-sm mt-3 font-medium"
//               >
//                 {Math.round(((currentStep + 1) / 4) * 100)}% Complete
//               </motion.p>
//             </motion.div>

//             {/* Sparkle Effects */}
//             <div className="absolute inset-0 pointer-events-none overflow-hidden">
//               {[...Array(25)].map((_, i) => (
//                 <motion.div
//                   key={`sparkle-${i}`}
//                   className="absolute"
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: `${Math.random() * 100}%`
//                   }}
//                   initial={{ opacity: 0, scale: 0 }}
//                   animate={{
//                     opacity: [0, 1, 0],
//                     scale: [0, 1.5, 0],
//                     rotate: [0, 180, 360]
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     delay: Math.random() * 2,
//                     ease: 'easeInOut'
//                   }}
//                 >
//                   <Sparkles className="w-4 h-4 text-yellow-300" />
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   )
// }