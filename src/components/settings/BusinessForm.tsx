'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Building, MapPin, Phone, Mail, Globe, CreditCard, FileText } from 'lucide-react'
import { updateBusinessInfo } from '@/app/(dashboard)/settings/actions'

type BusinessData = {
  id: string
  business_name: string
  gstin: string
  business_address: string
  business_phone: string
  business_email: string
  business_website: string
  pan_number: string
}

export default function BusinessForm({ business }: { business: BusinessData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    business_name: business.business_name,
    gstin: business.gstin,
    business_address: business.business_address,
    business_phone: business.business_phone,
    business_email: business.business_email,
    business_website: business.business_website,
    pan_number: business.pan_number,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateGSTIN = (gstin: string) => {
    if (!gstin) return true // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstinRegex.test(gstin.toUpperCase())
  }

  const validatePAN = (pan: string) => {
    if (!pan) return true // Optional field
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    return panRegex.test(pan.toUpperCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate GSTIN
    if (formData.gstin && !validateGSTIN(formData.gstin)) {
      toast({
        title: 'Invalid GSTIN',
        description: 'Please enter a valid GSTIN (e.g., 29ABCDE1234F1Z5)',
        variant: 'destructive',
      })
      return
    }

    // Validate PAN
    if (formData.pan_number && !validatePAN(formData.pan_number)) {
      toast({
        title: 'Invalid PAN',
        description: 'Please enter a valid PAN (e.g., ABCDE1234F)',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const data = new FormData()
      data.append('userId', business.id)
      data.append('business_name', formData.business_name)
      data.append('gstin', formData.gstin.toUpperCase())
      data.append('business_address', formData.business_address)
      data.append('business_phone', formData.business_phone)
      data.append('business_email', formData.business_email)
      data.append('business_website', formData.business_website)
      data.append('pan_number', formData.pan_number.toUpperCase())

      const result = await updateBusinessInfo(data)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Business information updated successfully',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update business information',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business_name" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Business Name *
        </Label>
        <Input
          id="business_name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          placeholder="Your Business Name"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          This will appear on invoices and receipts
        </p>
      </div>

      {/* GSTIN */}
      <div className="space-y-2">
        <Label htmlFor="gstin" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          GSTIN (Optional)
        </Label>
        <Input
          id="gstin"
          name="gstin"
          value={formData.gstin}
          onChange={handleChange}
          placeholder="29ABCDE1234F1Z5"
          maxLength={15}
          disabled={isPending}
          className="uppercase"
        />
        <p className="text-xs text-muted-foreground">
          15-character Goods and Services Tax Identification Number
        </p>
      </div>

      {/* PAN Number */}
      <div className="space-y-2">
        <Label htmlFor="pan_number" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          PAN Number (Optional)
        </Label>
        <Input
          id="pan_number"
          name="pan_number"
          value={formData.pan_number}
          onChange={handleChange}
          placeholder="ABCDE1234F"
          maxLength={10}
          disabled={isPending}
          className="uppercase"
        />
        <p className="text-xs text-muted-foreground">
          10-character Permanent Account Number
        </p>
      </div>

      {/* Business Address */}
      <div className="space-y-2">
        <Label htmlFor="business_address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Business Address
        </Label>
        <Textarea
          id="business_address"
          name="business_address"
          value={formData.business_address}
          onChange={handleChange}
          placeholder="Enter your complete business address"
          rows={4}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Full address including city, state, and PIN code
        </p>
      </div>

      {/* Business Phone */}
      <div className="space-y-2">
        <Label htmlFor="business_phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Business Phone
        </Label>
        <Input
          id="business_phone"
          name="business_phone"
          type="tel"
          value={formData.business_phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          disabled={isPending}
        />
      </div>

      {/* Business Email */}
      <div className="space-y-2">
        <Label htmlFor="business_email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Business Email
        </Label>
        <Input
          id="business_email"
          name="business_email"
          type="email"
          value={formData.business_email}
          onChange={handleChange}
          placeholder="contact@yourbusiness.com"
          disabled={isPending}
        />
      </div>

      {/* Business Website */}
      <div className="space-y-2">
        <Label htmlFor="business_website" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website (Optional)
        </Label>
        <Input
          id="business_website"
          name="business_website"
          type="url"
          value={formData.business_website}
          onChange={handleChange}
          placeholder="https://yourbusiness.com"
          disabled={isPending}
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Complete business information helps create professional invoices and builds trust with your customers.
        </p>
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