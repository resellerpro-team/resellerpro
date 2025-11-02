'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SmartPasteDialog } from '@/components/customers/SmartPasteDialog'
import type { ParsedCustomerData } from '@/lib/utils/whatsapp-parser'
import { createCustomer } from '../action'

export default function NewCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' })) // clear specific field error when typing
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Full name is required.'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.'
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit number.'
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 is required.'
    if (!formData.city.trim()) newErrors.city = 'City is required.'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSmartPaste = (data: ParsedCustomerData) => {
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      phone: data.phone || prev.phone,
      whatsapp: data.whatsapp || data.phone || prev.whatsapp,
      email: data.email || prev.email,
      addressLine1: data.addressLine1 || prev.addressLine1,
      addressLine2: data.addressLine2 || prev.addressLine2,
      city: data.city || prev.city,
      state: data.state || prev.state,
      pincode: data.pincode || prev.pincode,
    }))
    toast({
      title: 'Data filled! ✨',
      description: 'Customer form has been auto-filled. Please review and save.',
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // ✅ Client-side validation before submitting
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields before submitting.',
        variant: 'destructive',
        duration: 4000,
      })
      return
    }

    const formDataObj = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createCustomer(
          { success: false, message: '' },
          formDataObj
        )

        if (result.success) {
          toast({
            title: 'Customer Added! ✅',
            description: result.message,
            duration: 3000,
          })
          setTimeout(() => {
            router.push('/customers')
            router.refresh()
          }, 500)
        } else {
          if (result.errors) {
            const errorMessages = Object.entries(result.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n')
            toast({
              title: 'Validation Error',
              description: errorMessages,
              variant: 'destructive',
              duration: 5000,
            })
          } else {
            toast({
              title: 'Error',
              description: result.message || 'Failed to create customer',
              variant: 'destructive',
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error('Submit error:', error)
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
          duration: 5000,
        })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add New Customer</h1>
          <p className="text-muted-foreground">Fill in the details or use Smart Paste.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Enter the customer's contact and shipping details.</CardDescription>
          </div>
          <SmartPasteDialog onDataConfirmed={handleSmartPaste} />
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Rahul Sharma" required />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number" required />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="Same as phone (optional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., email@example.com" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Shipping Address</h3>
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 <span className="text-red-500">*</span></Label>
                <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="House no, Building, Street" />
                {errors.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Area, Landmark" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Kochi" />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Kerala" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                  <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g., 201301" />
                  {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any specific notes about this customer..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" asChild>
                <Link href="/customers">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Customer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
