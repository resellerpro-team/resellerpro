'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Key, Loader2, Eye, EyeOff, Shield, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  // Password strength calculation
  const calculateStrength = (password: string): number => {
    let score = 0
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 15
    if (/[a-z]/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 15
    if (/[0-9]/.test(password)) score += 15
    if (/[^a-zA-Z0-9]/.test(password)) score += 15
    return Math.min(score, 100)
  }

  const strength = calculateStrength(newPassword)

  const getStrengthLabel = () => {
    if (strength < 30) return { label: 'Weak', color: 'text-red-500' }
    if (strength < 60) return { label: 'Fair', color: 'text-yellow-500' }
    if (strength < 80) return { label: 'Good', color: 'text-blue-500' }
    return { label: 'Strong', color: 'text-green-500' }
  }

  const strengthInfo = getStrengthLabel()

  const passwordRequirements = [
    { met: newPassword.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
    { met: /[a-z]/.test(newPassword), label: 'One lowercase letter' },
    { met: /[0-9]/.test(newPassword), label: 'One number' },
    { met: /[^a-zA-Z0-9]/.test(newPassword), label: 'One special character' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords don\'t match',
        description: 'Please ensure both passwords are identical.',
        variant: 'destructive'
      })
      return
    }

    if (strength < 50) {
      toast({
        title: 'Password too weak',
        description: 'Please choose a stronger password.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.'
      })

      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Password Strength Meter */}
            {newPassword && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password Strength</span>
                  <span className={strengthInfo.color}>{strengthInfo.label}</span>
                </div>
                <Progress value={strength} className="h-2" />
                
                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
