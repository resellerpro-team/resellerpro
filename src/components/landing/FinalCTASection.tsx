'use client';

import { ArrowRight, CheckCircle, Rocket, Zap, TrendingUp, Clock } from 'lucide-react';

export default function FinalCTASection() {
  const benefits = [
    { icon: Clock, text: "Setup in 5 minutes" },
    { icon: CheckCircle, text: "No credit card required" },
    { icon: Zap, text: "Free forever plan available" },
    { icon: TrendingUp, text: "Upgrade anytime as you grow" }
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 -z-10" />
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          {/* Rocket Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 mb-4 animate-bounce">
            <Rocket className="text-white" size={40} />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto">
            Ready to Stop the WhatsApp Chaos?
          </h2>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join growing resellers who are saving hours every week and looking more professional with every order
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="group px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center space-x-3">
              <span>Start Free Trial Now</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-transparent text-white rounded-xl hover:bg-white/10 transition-all font-bold text-lg border-2 border-white/30 backdrop-blur-sm hover:border-white/50">
              Schedule a Demo
            </button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon className="text-white" size={20} />
                  </div>
                  <span className="text-white font-medium text-sm sm:text-base">
                    {benefit.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/20 max-w-3xl mx-auto">
            <p className="text-blue-100 text-sm mb-4">Trusted by resellers across India</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-500 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <span className="text-white font-medium">Join early adopters</span>
              </div>
              
              <div className="h-8 w-px bg-white/30" />
              
              <div className="text-white font-medium">
                🔒 Bank-level security
              </div>
              
              <div className="h-8 w-px bg-white/30" />
              
              <div className="text-white font-medium">
                ⚡ Start in minutes
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-blue-200 text-sm pt-6">
            No commitment. No credit card. No risk. Just results.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </section>
  );
}