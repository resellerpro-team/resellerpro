"use client"

import { useState } from 'react'
import { ArrowRight, CheckCircle, TrendingUp, Users, ShoppingBag, Sparkles, Play, Star, Zap, ShieldCheck, Bell, Search, Home, PieChart, MessageSquare, User, Wallet } from 'lucide-react'
import Link from 'next/link'
import { AnimatedDemoModal } from '@/components/demo/AnimatedDemoModal'

export default function HeroSection() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-background">

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 5s ease-in-out infinite 1s; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite; 
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary via-secondary/50 to-transparent rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-primary/40 rounded-full animate-float" />
        <div className="absolute top-[60%] right-[20%] w-3 h-3 bg-secondary/60 rounded-full animate-float-delay" />
        <div className="absolute bottom-[30%] left-[40%] w-1.5 h-1.5 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* LEFT: Text Content */}
          <div className="space-y-8 text-center lg:text-left">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">New: AI-Powered Insights</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Supercharge your{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent animate-gradient">
                  Reselling
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>{' '}
              Business
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The all-in-one platform to manage orders, track customers, and grow your business.
              Built for modern resellers who demand <span className="text-foreground font-medium">simplicity</span> and <span className="text-foreground font-medium">power</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {[
                { icon: Zap, text: 'Lightning Fast' },
                { icon: ShieldCheck, text: 'Bank-grade Security' },
                { icon: Users, text: '24/7 Support' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
                  <feature.icon className="w-3.5 h-3.5 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/signup" className="w-full sm:w-auto group">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] flex items-center justify-center gap-2 shimmer-effect">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <button
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto px-8 py-4 bg-background text-foreground rounded-2xl font-semibold text-lg border-2 border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                </div>
                Watch Demo
              </button>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-[3px] border-background ring-2 ring-primary/20 overflow-hidden transition-transform hover:scale-110 hover:z-10">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">12,000+</span> resellers
                  </p>
                </div>
              </div>

              <div className="h-10 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">No credit card required</span>
              </div>
            </div>
          </div>

          {/* RIGHT: iPhone 17 Pro Mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">

            <div className="relative w-[320px] h-[680px] flex items-center justify-center">

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] bg-gradient-to-br from-primary/25 via-secondary/20 to-primary/15 rounded-full blur-3xl -z-10 animate-pulse-glow" />

              <div className="relative animate-float">

                {/* Phone Frame - Titanium Natural finish */}
                <div
                  className="relative bg-gradient-to-br from-[#8a8a8a] via-[#a0a0a0] to-[#7a7a7a] p-[2.5px] rounded-[54px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
                  style={{ width: '280px', height: '590px' }}
                >

                  {/* Inner frame - dark bezel */}
                  <div className="w-full h-full rounded-[51.5px] bg-[#1a1a1a] p-[2px]">

                    {/* Screen bezel */}
                    <div className="w-full h-full rounded-[49.5px] bg-black p-[1px]">

                      {/* Actual Screen */}
                      <div className="relative w-full h-full rounded-[48.5px] overflow-hidden bg-white">

                        {/* Dynamic Island - Proper iPhone 15/16/17 style */}
                        <div className="absolute top-0 left-0 right-0 z-50 pt-[11px]">
                          <div className="relative flex items-center justify-between px-4">

                            {/* LEFT — Time */}
                            <span className="text-[14px] font-semibold text-black tracking-tight">
                              9:41
                            </span>

                            {/* CENTER — Dynamic Island */}
                            <div className="absolute left-1/2 -translate-x-1/2">
                              <div className="w-[85px] h-[28px] bg-black rounded-[20px] flex items-center gap-2 px-3">

                                {/* Front camera */}
                                <div className="w-[12px] h-[12px] rounded-full bg-[#1a1a1a] ring-[1.5px] ring-[#2a2a2a] flex items-center justify-center">
                                  <div className="w-[6px] h-[6px] rounded-full bg-[#0d1b2a]">
                                    <div className="w-[2px] h-[2px] rounded-full bg-[#1e3a5f] ml-[1px] mt-[1px]" />
                                  </div>
                                </div>

                                {/* Face ID sensors */}
                                <div className="flex items-center gap-[6px]">
                                  <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a1a]" />
                                  <div className="w-[5px] h-[5px] rounded-full bg-[#0f0f0f]" />
                                </div>

                              </div>
                            </div>

                            {/* RIGHT — Network + Battery */}
                            <div className="flex items-center gap-1">
                              {/* 5G */}
                              <span className="text-[12px] font-semibold text-black">5G</span>

                              {/* Battery */}
                              <div className="flex items-center">
                                <div className="w-[25px] h-[13px] border-[1.5px] border-black rounded-[4px] flex items-center p-[2px]">
                                  <div className="h-full w-[80%] bg-black rounded-[2px]" />
                                </div>
                                <div className="w-[1.5px] h-[5px] bg-black rounded-r-[1px] ml-[0.5px]" />
                              </div>
                            </div>

                          </div>
                        </div>


                        {/* Screen Content */}
                        <div className="h-full w-full bg-gradient-to-b from-[#f8fafc] via-white to-[#f1f5f9] flex flex-col">

                          {/* Status Bar - with proper spacing from Dynamic Island */}
                          <div className="flex justify-between items-end px-8 pt-[14px] h-[52px]">
                            <div className="flex items-center gap-[5px] mb-[2px]">
                            </div>
                          </div>

                          {/* App Header - proper spacing below status bar */}
                          <div className="px-4 pt-3 pb-2 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                              <div className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-[14px] shadow-lg shadow-primary/40">
                                RS
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-500 leading-tight">Welcome back</p>
                                <p className="text-[14px] font-semibold text-gray-900 leading-tight">Rahul Sharma</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center">
                                <Bell className="w-[18px] h-[18px] text-gray-700" />
                                <div className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                  <span className="text-[9px] font-bold text-white">3</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Search Bar */}
                          <div className="px-4 py-2">
                            <div className="flex items-center gap-2.5 px-3.5 py-[10px] bg-gray-100 rounded-[14px]">
                              <Search className="w-[16px] h-[16px] text-gray-400" />
                              <span className="text-[12px] text-gray-400">Search orders, customers...</span>
                            </div>
                          </div>

                          {/* Revenue Card */}
                          <div className="mx-4 mt-1 p-4 rounded-[20px] bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white shadow-xl shadow-primary/35 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-2xl" />

                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="text-blue-100 text-[11px] font-medium">Total Revenue</span>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <div className="flex items-center gap-1 px-2 py-[3px] bg-green-400/20 rounded-full">
                                      <TrendingUp className="w-[10px] h-[10px] text-green-300" />
                                      <span className="text-[9px] text-green-300 font-semibold">+24.5%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-2.5 py-1 bg-white/20 rounded-full backdrop-blur-sm text-[10px] font-semibold">
                                  Jan 2026
                                </div>
                              </div>
                              <h3 className="text-[28px] font-bold tracking-tight leading-none">₹1,40,500</h3>
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] text-blue-100">Monthly Goal</span>
                                  <span className="text-[9px] text-white font-semibold">75%</span>
                                </div>
                                <div className="h-[6px] bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full w-[75%] bg-white rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 px-4 py-3">
                            {[
                              { icon: ShoppingBag, value: '1,248', label: 'Orders', color: 'orange' },
                              { icon: Users, value: '8.9K', label: 'Customers', color: 'cyan' },
                              { icon: Wallet, value: '₹45K', label: 'Profit', color: 'green' },
                            ].map((stat, i) => (
                              <div key={i} className="bg-white p-2.5 rounded-[14px] shadow-sm border border-gray-100">
                                <div className={`w-[28px] h-[28px] rounded-[10px] flex items-center justify-center mb-1.5 ${stat.color === 'orange' ? 'bg-orange-100' :
                                  stat.color === 'cyan' ? 'bg-cyan-100' : 'bg-green-100'
                                  }`}>
                                  <stat.icon className={`w-[14px] h-[14px] ${stat.color === 'orange' ? 'text-orange-600' :
                                    stat.color === 'cyan' ? 'text-cyan-600' : 'text-green-600'
                                    }`} />
                                </div>
                                <div className="text-[15px] font-bold text-gray-900 leading-none">{stat.value}</div>
                                <div className="text-[9px] text-gray-500 mt-0.5">{stat.label}</div>
                              </div>
                            ))}
                          </div>

                          {/* Recent Orders */}
                          <div className="flex-1 mx-4 bg-white rounded-[16px] p-3 shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-[13px] font-semibold text-gray-900">Recent Orders</span>
                              <div className="flex items-center gap-1 text-primary">
                                <span className="text-[10px] font-medium">View All</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              {[
                                { name: 'Sports Jersey', customer: 'Amit K.', time: '2m', amount: '+₹1,450', color: 'orange', status: 'new' },
                                { name: 'Running Shoes', customer: 'Priya S.', time: '15m', amount: '+₹2,890', color: 'blue', status: 'paid' },
                                { name: 'Fitness Band', customer: 'Rahul M.', time: '1h', amount: '+₹799', color: 'purple', status: 'shipped' },
                              ].map((order, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-[12px] bg-gray-50/80">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center ${order.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                      order.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                      }`}>
                                      <ShoppingBag className="w-[16px] h-[16px]" />
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-semibold text-gray-900 leading-tight">{order.name}</div>
                                      <div className="text-[9px] text-gray-400 mt-0.5">{order.customer} • {order.time}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[11px] font-bold text-green-600">{order.amount}</div>
                                    <div className={`text-[8px] px-[6px] py-[2px] rounded-full mt-0.5 font-medium ${order.status === 'new' ? 'bg-orange-100 text-orange-600' :
                                      order.status === 'paid' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                      }`}>
                                      {order.status}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Navigation */}
                          <div className="px-4 py-2">
                            <div className="flex items-center justify-around py-2 bg-white/90 backdrop-blur-sm rounded-[18px] shadow-lg shadow-gray-200/50 border border-gray-100">
                              {[
                                { icon: Home, label: 'Home', active: true },
                                { icon: ShoppingBag, label: 'Orders', active: false },
                                { icon: PieChart, label: 'Stats', active: false },
                                { icon: MessageSquare, label: 'Chat', active: false },
                                { icon: User, label: 'Profile', active: false },
                              ].map((item, i) => (
                                <div key={i} className={`flex flex-col items-center gap-[2px] ${item.active ? 'text-primary' : 'text-gray-400'}`}>
                                  <div className={`p-[6px] rounded-[10px] ${item.active ? 'bg-primary/10' : ''}`}>
                                    <item.icon className="w-[18px] h-[18px]" fill={item.active ? 'currentColor' : 'none'} />
                                  </div>
                                  <span className="text-[8px] font-medium">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Home Indicator */}
                          <div className="flex justify-center pb-[8px] pt-[2px]">
                            <div className="w-[120px] h-[5px] bg-black rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Buttons */}
                <div className="absolute left-[-2.5px] top-[95px] w-[4px] h-[28px] bg-gradient-to-b from-[#9a9a9a] to-[#7a7a7a] rounded-l-[2px]" />
                <div className="absolute left-[-2.5px] top-[138px] w-[4px] h-[50px] bg-gradient-to-b from-[#9a9a9a] to-[#7a7a7a] rounded-l-[2px]" />
                <div className="absolute left-[-2.5px] top-[198px] w-[4px] h-[50px] bg-gradient-to-b from-[#9a9a9a] to-[#7a7a7a] rounded-l-[2px]" />
                <div className="absolute right-[-2.5px] top-[155px] w-[4px] h-[70px] bg-gradient-to-b from-[#9a9a9a] to-[#7a7a7a] rounded-r-[2px]" />

              </div>

              {/* Floating Elements */}

              {/* Top Right - Sales Notification */}
              <div className="absolute top-4 -right-4 lg:right-[-60px] z-20 animate-float">
                <div className="bg-white/95 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">Sales Up!</p>
                      <p className="text-[10px] text-green-600 font-medium">+24% today</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Left - Order Confirmed */}
              <div className="absolute bottom-20 -left-4 lg:left-[-60px] z-20 animate-float-delay">
                <div className="bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900">Order Confirmed!</p>
                      <p className="text-[10px] text-gray-500">₹2,450 received</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Center - Live Stats */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">Live</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="text-[11px]">
                    <span className="font-bold text-gray-900">1,247</span>
                    <span className="text-gray-500 ml-1">orders today</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Animated Demo Modal */}
      <AnimatedDemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  )
}