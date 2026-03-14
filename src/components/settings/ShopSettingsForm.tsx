'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Palette, Globe, Info, ExternalLink } from 'lucide-react'
import { updateShopSettings } from '@/app/(dashboard)/settings/actions'

interface ShopSettingsFormProps {
  profile: {
    id: string
    shop_slug?: string
    shop_description?: string
    shop_theme?: any
    business_name?: string
  }
}

export default function ShopSettingsForm({ profile }: ShopSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    shop_slug: profile.shop_slug || '',
    shop_description: profile.shop_description || '',
    primaryColor: profile.shop_theme?.primaryColor || '#4f46e5',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const data = new FormData()
      data.append('userId', profile.id)
      data.append('shop_slug', formData.shop_slug)
      data.append('shop_description', formData.shop_description)
      data.append('shop_theme', JSON.stringify({ primaryColor: formData.primaryColor }))

      const result = await updateShopSettings(data)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Shop settings updated successfully',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update shop settings',
          variant: 'destructive',
        })
      }
    })
  }

  const shopUrl = `resellerpro.in/${formData.shop_slug}`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shop URL */}
      <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Shop URL</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shop_slug">Custom Slug</Label>
          <div className="flex items-center gap-0">
            <div className="px-3 py-2 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">
              resellerpro.in/
            </div>
            <Input
              id="shop_slug"
              name="shop_slug"
              value={formData.shop_slug}
              onChange={handleChange}
              placeholder="your-shop-name"
              className="rounded-l-none"
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This is your unique store address. Only letters, numbers, and hyphens are allowed.
          </p>
        </div>
        
        {formData.shop_slug && (
          <div className="pt-2">
            <a 
              href={`/${formData.shop_slug}`} 
              target="_blank" 
              className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
            >
              Preview My Shop <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      {/* Shop Description */}
      <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Shop Info</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shop_description">Shop Description</Label>
          <Textarea
            id="shop_description"
            name="shop_description"
            value={formData.shop_description}
            onChange={handleChange}
            placeholder="Tell your customers about your business..."
            rows={4}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            A short description that appears on your shop page header.
          </p>
        </div>
      </div>

      {/* Shop Theme */}
      <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Theme Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer p-1"
                disabled={isPending}
              />
              <Input
                value={formData.primaryColor}
                onChange={handleChange}
                name="primaryColor"
                className="w-32 uppercase font-mono"
                maxLength={7}
                disabled={isPending}
              />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Preview Mockup</p>
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {profile.business_name?.slice(0, 2).toUpperCase() || 'SP'}
              </div>
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div 
              className="h-10 w-full rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Order Now
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Shop Settings'
          )}
        </Button>
      </div>
    </form>
  )
}
