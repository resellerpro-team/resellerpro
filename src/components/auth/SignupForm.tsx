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

    // Global Enter key handler
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Only trigger if not already handled by an element (e.g. focused button)
        // and if not currently loading
        if (!isLoading) {
          // Find the form and submit it
          const form = document.querySelector('form')
          if (form) {
            // We can't easily call handleSubmit directly with the correct Event type
            // but we can trigger a submit event on the form
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [searchParams, isLoading])

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
    const { id, value } = e.target

    // Special handling for phone number - only allow digits
    if (id === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '')
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10)
      setFormData({ ...formData, [id]: limitedValue })
      return
    }

    setFormData({ ...formData, [id]: value })
  }

  const handleBlur = (fieldId: string) => {
    setFocusedField(null)
    setTouchedFields(prev => new Set(prev).add(fieldId))
  }

  // TEACHING NOTE: Frontend validation for UX (instant feedback)
  // This matches our backend validation rules but provides immediate user feedback
  // Remember: This is NOT for security - users can bypass this easily
  // The REAL validation happens on the backend
  const isFieldValid = (fieldId: string): boolean => {
    if (!touchedFields.has(fieldId)) return true

    switch (fieldId) {
      case 'email':
        // Basic email format check
        // Length checks: min 5 ("a@b.c") max 254 (RFC 5321)
        const email = formData.email.trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return email.length >= 5 && email.length <= 254 && emailRegex.test(email)

      case 'fullName':
        // Allow short names like "Li", "Xi"
        // Max 50 for database/UI constraints
        const name = formData.fullName.trim()
        return name.length >= 2 && name.length <= 50

      case 'businessName':
        // Business name is now mandatory
        const bName = formData.businessName.trim()
        return bName.length >= 2 && bName.length <= 50

      case 'phone':
        // Phone validation: 10 digits, first digit 1-9 (Now mandatory)
        if (!formData.phone) return false
        const phoneDigits = formData.phone.replace(/\D/g, '')
        if (phoneDigits.length !== 10) return false
        if (phoneDigits[0] === '0') return false // First digit cannot be 0
        return true

      case 'password':
        // Min 8 chars (NIST/OWASP standard)
        // Max 72 chars (bcrypt limit) - but we don't show this to users
        return formData.password.length >= 8 && formData.password.length <= 72

      default:
        return true
    }
  }

  // TEACHING NOTE: Validate ALL fields before submitting
  // This prevents invalid data from reaching the backend
  // Even though backend validates too, we catch errors early for better UX
  const validateAllFields = (): boolean => {
    // Mark all fields as touched to show validation outlines
    const allFields = ['fullName', 'businessName', 'email', 'phone', 'password']
    setTouchedFields(new Set(allFields))

    const errors: string[] = []

    // 1. Validate full name (Matched to UI order)
    const name = formData.fullName.trim()
    if (!name) {
      errors.push('Full name is required')
    } else if (name.length < 2) {
      errors.push('Name must be at least 2 characters')
    } else if (name.length > 50) {
      errors.push('Name must not exceed 50 characters')
    }

    // 2. Validate business name
    const bName = formData.businessName.trim()
    if (!bName) {
      errors.push('Business name is required')
    } else if (bName.length < 2) {
      errors.push('Business name must be at least 2 characters')
    } else if (bName.length > 50) {
      errors.push('Business name must not exceed 50 characters')
    }

    // 3. Validate email
    const email = formData.email.trim()
    if (!email) {
      errors.push('Email is required')
    } else if (email.length < 5) {
      errors.push('Email must be at least 5 characters')
    } else if (email.length > 254) {
      errors.push('Email must not exceed 254 characters')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address')
    }

    // 4. Validate phone number
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (!phoneDigits) {
      errors.push('Phone number is required')
    } else if (phoneDigits.length !== 10) {
      errors.push('Phone number must be exactly 10 digits')
    } else if (phoneDigits[0] === '0') {
      errors.push('Please enter a valid mobile number (cannot start with 0)')
    }

    // 5. Validate password
    if (!formData.password) {
      errors.push('Password is required')
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters')
    } else if (formData.password.length > 72) {
      errors.push('Password must not exceed 72 characters')
    }

    // Validate terms checkbox
    if (!formData.agreeToTerms) {
      errors.push('Please accept the terms and conditions')
    }

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0], // Show first error
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate ALL fields (including terms) before proceeding
    if (!validateAllFields()) {
      return // Stop here if validation fails
    }

    // All validation passed - now submit
    setIsLoading(true)

    try {
      // TEACHING NOTE: Normalize data before sending to backend
      // - Trim whitespace (users often copy-paste with extra spaces)
      // - Lowercase email (emails are case-insensitive)
      // This ensures data consistency and prevents duplicate accounts
      const fd = new FormData()
      fd.append('fullName', formData.fullName.trim())
      fd.append('businessName', formData.businessName.trim())
      fd.append('email', formData.email.trim().toLowerCase())
      fd.append('phone', formData.phone.trim())
      fd.append('password', formData.password) // Don't trim passwords - spaces might be intentional
      fd.append('referralCode', formData.referralCode.trim().toUpperCase())

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

      // Success! Show toast and redirect
      toast({
        title: 'Success!',
        description: result.message,
      })

      setIsLoading(false)

      // Use window.location.href for proper session redirect
      if (result.redirectUrl) {
        setTimeout(() => {
          window.location.href = result.redirectUrl!
        }, 100)
      } else {
        // Fallback to /dashboard if no redirectUrl provided
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
      }

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">

            {/* Left Side */}
            <div className="hidden lg:block space-y-8 px-4">
              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                  Start selling
                  <span className="block bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    smarter today
                  </span>
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                  The simple platform for resellers. Manage orders, track inventory, and grow your business — all in one place.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
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
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Small Realistic Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">50+</div>
                  <div className="text-sm text-slate-500">Resellers joined</div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">₹2L+</div>
                  <div className="text-sm text-slate-500">Orders managed</div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">4.8</div>
                  <div className="text-sm text-slate-500">User rating</div>
                </div>
              </div>

              {/* Testimonial - Kerala Name, English Content */}
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/50 p-6">
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
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      "Was tracking orders in Excel sheets. Now everything is in one place. Super easy to use and saves me hours every week!"
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Arjun Nair</span> · Textile Reseller, Kochi
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
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-blue-500/10 dark:shadow-none p-6 lg:p-8">
                {/* Mobile Header */}
                <div className="lg:hidden mb-8 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Free forever · No credit card</p>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Get started free</h2>
                  <p className="text-slate-600 dark:text-slate-400">No credit card required · Free forever</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'fullName' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                        <Input
                          id="fullName"
                          placeholder="Your name"
                          className={`pl-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'fullName'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300 dark:hover:border-slate-600'
                            } ${!isFieldValid('fullName') ? 'border-rose-300 dark:border-rose-500/50' : ''}`}
                          value={formData.fullName}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => handleBlur('fullName')}
                          required
                          disabled={isLoading}
                          maxLength={50}
                        />
                      </div>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Business Name
                      </Label>
                      <div className="relative">
                        <Briefcase className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'businessName' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                        <Input
                          id="businessName"
                          placeholder="Store name"
                          className={`pl-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'businessName'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300 dark:hover:border-slate-600'
                            } ${!isFieldValid('businessName') ? 'border-rose-300 dark:border-rose-500/50' : ''}`}
                          value={formData.businessName}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('businessName')}
                          onBlur={() => handleBlur('businessName')}
                          disabled={isLoading}
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@email.com"
                          className={`pl-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'email'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300 dark:hover:border-slate-600'
                            } ${!isFieldValid('email') ? 'border-rose-300 dark:border-rose-500/50' : ''}`}
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => handleBlur('email')}
                          required
                          disabled={isLoading}
                          maxLength={254}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="98765XXXXX"
                          className={`pl-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'phone'
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'hover:border-slate-300 dark:hover:border-slate-600'
                            } ${!isFieldValid('phone') ? 'border-rose-300 dark:border-rose-500/50' : ''}`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => handleBlur('phone')}
                          required
                          disabled={isLoading}
                          pattern="[1-9][0-9]{9}"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                        }`} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        className={`pl-11 pr-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'password'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300 dark:hover:border-slate-600'
                          } ${!isFieldValid('password') ? 'border-rose-300 dark:border-rose-500/50' : ''}`}
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => handleBlur('password')}
                        required
                        disabled={isLoading}
                        minLength={8}
                        maxLength={72}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Referral Code <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Gift className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'referralCode' ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
                        }`} />
                      <Input
                        id="referralCode"
                        placeholder="Code for bonus"
                        className={`pl-11 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${focusedField === 'referralCode'
                          ? 'border-blue-600 ring-4 ring-blue-600/10'
                          : 'hover:border-slate-300 dark:hover:border-slate-600'
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
                  <div className="flex items-start gap-3 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      disabled={isLoading}
                      className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms-and-conditions" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        Terms
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy-policy" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Start free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Sign In Link */}
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/signin" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>

              {/* Trust Badge */}
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
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