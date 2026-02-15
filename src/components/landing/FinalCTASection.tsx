// 'use client'

// import { ArrowRight, CheckCircle, Rocket, Zap, TrendingUp, Clock } from 'lucide-react'
// import Link from 'next/link'

// export default function FinalCTASection() {
//   const benefits = [
//     { icon: Clock, text: 'Setup in 5 minutes' },
//     { icon: CheckCircle, text: 'No credit card required' },
//     { icon: Zap, text: 'Free forever plan available' },
//     { icon: TrendingUp, text: 'Upgrade anytime as you grow' },
//   ]

//   return (
//     <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
//       {/* Background with gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 -z-10" />

//       {/* Animated background elements */}
//       <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob" />
//       <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
//       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

//       <div className="max-w-6xl mx-auto relative z-10">
//         <div className="text-center space-y-8">
//           {/* Rocket Icon */}
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 mb-4 animate-bounce">
//             <Rocket className="text-white" size={40} />
//           </div>

//           {/* Main Heading */}
//           <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto">
//             Ready to Turn WhatsApp Enquiries into Orders?
//           </h2>

//           {/* Subheading */}
//           <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
//             Join growing resellers who are saving hours every week and looking more professional
//             with every order
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
//             <Link href="/signup">
//               <button className="group px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center space-x-3">
//                 <span>Start Free Trial Now</span>
//                 <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
//               </button>
//             </Link>
//             <button className="px-10 py-5 bg-transparent text-white rounded-xl hover:bg-white/10 transition-all font-bold text-lg border-2 border-white/30 backdrop-blur-sm hover:border-white/50">
//               Schedule a Demo
//             </button>
//           </div>

//           {/* Benefits Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 max-w-5xl mx-auto">
//             {benefits.map((benefit, index) => {
//               const Icon = benefit.icon
//               return (
//                 <div
//                   key={index}
//                   className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
//                   style={{ animationDelay: `${index * 100}ms` }}
//                 >
//                   <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
//                     <Icon className="text-white" size={20} />
//                   </div>
//                   <span className="text-white font-medium text-sm sm:text-base">
//                     {benefit.text}
//                   </span>
//                 </div>
//               )
//             })}
//           </div>

//           {/* Trust Indicators */}
//           <div className="pt-8 border-t border-white/20 max-w-3xl mx-auto">
//             <p className="text-blue-100 text-sm mb-4">Trusted by resellers across India</p>
//             <div className="flex flex-wrap justify-center gap-8 items-center">
//               <div className="flex items-center space-x-2">
//                 <div className="flex -space-x-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-white" />
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-500 border-2 border-white" />
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 border-2 border-white flex items-center justify-center">
//                     <span className="text-white text-xs font-bold">+</span>
//                   </div>
//                 </div>
//                 <span className="text-white font-medium">Join early adopters</span>
//               </div>

//               <div className="h-8 w-px bg-white/30" />

//               <div className="text-white font-medium">🔒 Bank-level security</div>

//               <div className="h-8 w-px bg-white/30" />

//               <div className="text-white font-medium">⚡ Start in minutes</div>
//             </div>
//           </div>

//           {/* Bottom text */}
//           <p className="text-blue-200 text-sm pt-6">
//             No commitment. No credit card. No risk. Just results.
//           </p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes blob {
//           0%,
//           100% {
//             transform: translate(0, 0) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//         }

//         .animate-blob {
//           animation: blob 7s infinite;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }

//         @keyframes bounce {
//           0%,
//           100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }

//         .animate-bounce {
//           animation: bounce 2s infinite;
//         }
//       `}</style>
//     </section>
//   )
// }


// ============================================================================================


'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Rocket, Zap, ShieldCheck, Smartphone, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { AnimatedDemoModal } from '@/components/demo/AnimatedDemoModal'

export default function FinalCTASection() {
  const [showDemo, setShowDemo] = useState(false)
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Main Card Container */}
        <div className="relative rounded-[3rem] overflow-hidden bg-primary text-primary-foreground px-6 py-20 sm:px-12 sm:py-24 text-center shadow-2xl shadow-primary/25">

          {/* 1. Background Effects (Contained inside the card) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            {/* Top Right Blob */}
            <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] animate-pulse" />
            {/* Bottom Left Blob */}
            <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">

            {/* 2. Floating Icon Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-semibold text-white mb-4 animate-bounce-slow">
              <Rocket className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Launch your business today</span>
            </div>

            {/* 3. Main Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Turn WhatsApp Enquiries <br />
              into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">Real Orders</span>
            </h2>

            {/* 4. Subtext */}
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
              Join growing resellers who save hours every week.
              Look professional, stay organized, and scale fast.
            </p>

            {/* 5. CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <button className="group h-14 px-8 bg-white text-primary rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <button
                onClick={() => setShowDemo(true)}
                className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* 6. Trust/Feature Pills */}
            <div className="pt-10 flex flex-wrap justify-center gap-4">
              {[
                { icon: Zap, text: "Setup in 2 mins" },
                { icon: ShieldCheck, text: "No credit card needed" },
                { icon: CheckCircle2, text: "Cancel anytime" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-blue-900/30 border border-blue-400/30 px-4 py-2 rounded-xl text-sm font-medium text-blue-100 backdrop-blur-sm"
                >
                  <item.icon className="w-4 h-4 text-cyan-300" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* 7. Social Proof Avatars */}
            <div className="pt-8 border-t border-white/10 mt-12">
              <div className="flex flex-col items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-blue-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-primary bg-white text-primary flex items-center justify-center text-xs font-bold">
                    +2k
                  </div>
                </div>
                <p className="text-sm text-blue-200 font-medium">Trusted by resellers across India</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatedDemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  )
}