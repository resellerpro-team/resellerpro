'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Briefcase, Sparkles, Phone, Gift, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from "@/hooks/use-toast"
import { signup } from '@/app/(auth)/signup/actions'

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralField, setShowReferralField] = useState(false)

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
      setShowReferralField(true)
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
      // Prepare FormData for server action
      const fd = new FormData()
      fd.append('fullName', formData.fullName)
      fd.append('businessName', formData.businessName)
      fd.append('email', formData.email)
      fd.append('phone', formData.phone)
      fd.append('password', formData.password)
      fd.append('referralCode', formData.referralCode)

      const result = await signup({ success: false, message: '' }, fd)

      // --------------------------
      // Handle server-side errors
      // --------------------------
      if (!result.success) {
        toast({
          title: 'Signup Failed',
          description: result.message,
          variant: 'destructive'
        })

        setIsLoading(false)
        return
      }



      // Show verification toast and redirect to login
      toast({
        title: 'Verify your email',
        description: 'We’ve sent a confirmation link to your email. Please verify to continue.',
      })

      setIsLoading(false)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/signin')
      }, 2000)

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
    <div className="min-h-screen flex items-center justify-center p-4 ">
      {/* Animated background elements */}


      <Card className="w-full max-w-4xl relative z-10 backdrop-blur-sm shadow-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side - Logo and Description */}
          <div className="hidden md:flex flex-col items-center justify-center p-6 bg-blue-600 rounded-t-xl">
            <div className="flex h-20 w-20 items-center justify-center bg-white shadow-2xl mb-4 rounded-2xl overflow-hidden p-2 border border-white/20">
              <NextImage
                src="/logo.png"
                alt="ResellerPro Logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white text-center mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-base text-white/90 text-center">
              Start your reselling journey today
            </CardDescription>
          </div>

          <div className="block md:hidden items-center justify-center p-6  rounded-t-xl">
            <CardTitle className="text-2xl font-bold text-black text-center mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-base text-black text-center">
              Start your reselling journey today
            </CardDescription>
          </div>

          {/* Right Side - Form Fields */}
          <CardContent className="pt-3 pb-3">
            <div className="space-y-3">
              {/* Two Column Layout for Name and Business */}
              <div className="grid grid-cols-1 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                      id="fullName"
                      placeholder="Rahul Kumar"
                      className="pl-10 h-8"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-1">
                  <Label htmlFor="businessName" className="text-sm font-medium">Business Name (Optional)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                      id="businessName"
                      placeholder="Rahul's Store"
                      className="pl-10 h-8"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Email and Phone */}
              <div className="grid grid-cols-1 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-8"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-10 h-8"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="pl-10 pr-10 h-8"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Referral Code */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-4 w-4 text-gray" />
                  <Label htmlFor="referralCode" className="text-sm font-medium">Referral Code (Optional)</Label>
                </div>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  className="h-8"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-black font-small">
                  Use a referral code to earn ₹50 wallet credit instantly.
                </p>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2 p-2.5 bg-gray-50 dark:bg-gray-800/50">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 font-medium hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 font-medium hover:underline">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                className="w-full h-9 text-sm font-semibold bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-3 md:col-span-2">
            <p className="w-full text-center text-sm font-bold text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
