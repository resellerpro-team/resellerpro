'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, User, Mail, Phone, Building } from 'lucide-react'
import { updateProfile, uploadAvatar } from '@/app/(dashboard)/settings/actions'

type UserData = {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url: string
  business_name: string
  created_at: string
}

export default function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user.full_name,
    phone: user.phone,
    business_name: user.business_name,
  })

  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Avatar image must be less than 2MB',
        variant: 'destructive',
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      const result = await uploadAvatar(formData)

      if (result.success && result.avatarUrl) {
        setAvatarUrl(result.avatarUrl)
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully',
        })
        router.refresh()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name is required',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const data = new FormData()
      data.append('userId', user.id)
      data.append('full_name', formData.full_name)
      data.append('phone', formData.phone)
      data.append('business_name', formData.business_name)

      const result = await updateProfile(data)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update profile',
          variant: 'destructive',
        })
      }
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} alt={formData.full_name} />
          <AvatarFallback className="text-2xl">
            {formData.full_name ? getInitials(formData.full_name) : <User />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingAvatar}
                asChild
              >
                <span>
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Change Avatar
                    </>
                  )}
                </span>
              </Button>
            </div>
          </Label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            disabled={isUploadingAvatar}
          />
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name *
          </div>
        </Label>
        <Input
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
          disabled={isPending}
        />
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </div>
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </div>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          disabled={isPending}
        />
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business_name">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Name
          </div>
        </Label>
        <Input
          id="business_name"
          name="business_name"
          value={formData.business_name}
          onChange={handleInputChange}
          placeholder="Enter your business name"
          disabled={isPending}
        />
      </div>

      {/* Account Info */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Member since: {new Date(user.created_at).toLocaleDateString('en-IN', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}