'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Briefcase,
  Phone,
  Gift,
  Check,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from "@/hooks/use-toast"
import { signup } from '@/app/(auth)/signup/actions'

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    referralCode: '',
    agreeToTerms: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleBlur = (fieldId: string) => {
    setFocusedField(null)
    setTouchedFields(prev => new Set(prev).add(fieldId))
  }

  const isFieldValid = (fieldId: string): boolean => {
    if (!touchedFields.has(fieldId)) return true

    switch (fieldId) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case 'fullName':
        return formData.fullName.trim().length >= 2
      case 'phone':
        return formData.phone.trim().length >= 10
      case 'password':
        return formData.password.length >= 6
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const fd = new FormData()
      fd.append('fullName', formData.fullName)
      fd.append('businessName', formData.businessName)
      fd.append('email', formData.email)
      fd.append('phone', formData.phone)
      fd.append('password', formData.password)
      fd.append('referralCode', formData.referralCode)

      const result = await signup({ success: false, message: '' }, fd)

      if (!result.success) {
        toast({
          title: 'Signup Failed',
          description: result.message,
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      router.push('/dashboard')

    } catch (error: any) {
      console.error('Signup error:', error)
      toast({
        title: 'Signup Failed',
        description: error?.message || 'Unexpected error occurred.',
        variant: 'destructive'
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Side */}
            <div className="hidden lg:block space-y-10 px-4">
              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  Start selling
                  <span className="block bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    smarter today
                  </span>
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                  The simple platform for resellers. Manage orders, track inventory, and grow your business — all in one place.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  'Free forever to start',
                  'Manage products & inventory',
                  'Track orders & customers',
                  'Easy WhatsApp catalog sharing',
                  'Upgrade only when you grow'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Small Realistic Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500">Resellers joined</div>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">₹2L+</div>
                  <div className="text-sm text-slate-500">Orders managed</div>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">4.8</div>
                  <div className="text-sm text-slate-500">User rating</div>
                </div>
              </div>

              {/* Testimonial - Kerala Name, English Content */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    A
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      "Was tracking orders in Excel sheets. Now everything is in one place. Super easy to use and saves me hours every week!"
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">Arjun Nair</span> · Textile Reseller, Kochi
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Footer */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Setup takes less than 2 minutes</span>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full">
              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-2xl shadow-blue-500/10 p-8 lg:p-10">
                {/* Mobile Header */}
                <div className="lg:hidden mb-8 text-center">
                  <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                  <p className="text-slate-600 mt-2">Free forever · No credit card</p>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Get started free</h2>
                  <p className="text-slate-600">No credit card required · Free forever</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'fullName' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'fullName'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300'
                          } ${!isFieldValid('fullName') ? 'border-rose-300' : ''}`}
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => handleBlur('fullName')}
                        required
                        disabled={isLoading}
                      />
                      {touchedFields.has('fullName') && isFieldValid('fullName') && formData.fullName && (
                        <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium text-slate-700">
                      Business Name <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Briefcase className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'businessName' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <Input
                        id="businessName"
                        placeholder="Your store name"
                        className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'businessName'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300'
                          }`}
                        value={formData.businessName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('businessName')}
                        onBlur={() => handleBlur('businessName')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@email.com"
                          className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'email'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300'
                            } ${!isFieldValid('email') ? 'border-rose-300' : ''}`}
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => handleBlur('email')}
                          required
                          disabled={isLoading}
                        />
                        {touchedFields.has('email') && isFieldValid('email') && formData.email && (
                          <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 00000 00000"
                          className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'phone'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300'
                            } ${!isFieldValid('phone') ? 'border-rose-300' : ''}`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => handleBlur('phone')}
                          required
                          disabled={isLoading}
                        />
                        {touchedFields.has('phone') && isFieldValid('phone') && formData.phone && (
                          <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        className={`pl-11 pr-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'password'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300'
                          } ${!isFieldValid('password') ? 'border-rose-300' : ''}`}
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => handleBlur('password')}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-sm font-medium text-slate-700">
                      Referral Code <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Gift className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'referralCode' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <Input
                        id="referralCode"
                        placeholder="Enter code for ₹50 bonus"
                        className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'referralCode'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300'
                          }`}
                        value={formData.referralCode}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('referralCode')}
                        onBlur={() => handleBlur('referralCode')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      disabled={isLoading}
                      className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 font-medium hover:underline">
                        Terms
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Start free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Sign In Link */}
                  <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-700">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure & encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}