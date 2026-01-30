import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EkodrixLoginForm from '@/components/ekodrix-panel/ekodrix-login-form'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Ekodrix Panel - Login',
  description: 'Secure admin access panel',
}

export default function EkodrixLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] text-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-900/60 to-black/80" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-emerald-600/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-teal-500/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Login Card */}
      <Card className="w-[420px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="text-center pb-2 pt-8 flex flex-col items-center">
          {/* Logo */}
          <div className="mx-auto mb-4 w-20 h-20 relative flex items-center justify-center">
            <Image 
              src="/ekodrix-icon.png" 
              alt="Ekodrix Logo" 
              fill
              className="object-contain mix-blend-screen"
              priority
            />
          </div>
          
          <CardTitle className="text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
            Ekodrix Panel
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </CardTitle>
          <p className="mt-2 text-sm text-gray-400">
            Secure Control Center Access
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <EkodrixLoginForm />
        </CardContent>
      </Card>

      {/* Version Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">
        ResellerPro Control Panel v1.0
      </div>
    </div>
  )
}
