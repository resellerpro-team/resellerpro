'use client';
import { Package, Users, Zap, BarChart3, Shield, TrendingUp, ArrowRight, Sparkles, type LucideProps } from 'lucide-react';

function FeatureCard({ icon: Icon, title, description, index }: { icon: React.ComponentType<LucideProps>; title: string; description: string; index: number }) {
  return (
    <div 
      className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <Icon size={28} />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed mb-4">
          {description}
        </p>
        
        <div className="flex items-center space-x-2 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Learn more</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300" />
    </div>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Product Management",
      description: "Organize products with images, pricing, and profit calculations. Know exactly what you're earning."
    },
    {
      icon: Users,
      title: "Customer Database",
      description: "Save customer details once, reuse forever. Track order history and build relationships."
    },
    {
      icon: Zap,
      title: "Smart WhatsApp Paste",
      description: "Copy customer messages from WhatsApp, paste in app. Auto-extract name, phone, address!"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Daily, weekly, monthly reports. See what's selling, who's buying, and how much you're earning."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and safe. We never share your information with anyone."
    },
    {
      icon: TrendingUp,
      title: "Scale Unlimited",
      description: "Start with 10 orders/month free. Upgrade as you grow. No limits on success."
    }
  ];

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white -z-10" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
            <Sparkles size={16} />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              grow
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for resellers who want to scale their business efficiently
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl">
            <div className="text-white text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to transform your business?</h3>
              <p className="text-blue-100">Start your free trial today. No credit card required.</p>
            </div>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap">
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </button>
          </div>
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
      `}</style>
    </section>
  );
}