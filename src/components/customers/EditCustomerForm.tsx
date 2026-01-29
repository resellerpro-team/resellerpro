'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateCustomer } from '@/app/(dashboard)/customers/action'
import { useQueryClient } from '@tanstack/react-query'

interface Customer {
  id: string
  name: string
  phone: string
  whatsapp: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  notes: string | null
}

interface EditCustomerFormProps {
  customer: Customer
  customerId: string
}

function SubmitButton({ customerId }: { customerId: string }) {
  const { pending } = useFormStatus()
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" asChild type="button">
        <Link href={`/customers/${customerId}`}>Cancel</Link>
      </Button>

      <Button type="submit" disabled={pending}>
        <Save className="mr-2 h-4 w-4" />
        {pending ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}

export default function EditCustomerForm({ customer, customerId }: EditCustomerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [state, formAction] = useFormState(updateCustomer, {
    success: false,
    message: '',
  })

  useEffect(() => {
    if (state.success) {
      // Invalidate customers query
      queryClient.invalidateQueries({ queryKey: ['customers'] })

      toast({
        title: 'Customer Updated! ✅',
        description: state.message,
      })
      router.push(`/customers/${customerId}`)
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, router, toast, customerId, queryClient])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">

          {/* Hidden ID Field */}
          <input type="hidden" name="id" value={customerId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer.name}
                placeholder="e.g., Rahul Sharma"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-red-600">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone}
                placeholder="10-digit mobile number"
                required
              />
              {state.errors?.phone && (
                <p className="text-sm text-red-600">{state.errors.phone[0]}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={customer.whatsapp || ''}
                placeholder="Same as phone (optional)"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email || ''}
                placeholder="e.g., email@example.com"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-600">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Shipping Address</h3>

            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                name="address_line1"
                defaultValue={customer.address_line1 || ''}
                placeholder="House no, Building, Street"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                name="address_line2"
                defaultValue={customer.address_line2 || ''}
                placeholder="Area, Landmark"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={customer.city || ''}
                  placeholder="e.g., Kochi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={customer.state || ''}
                  placeholder="e.g., Kerala"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  defaultValue={customer.pincode || ''}
                  placeholder="e.g., 201301"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={customer.notes || ''}
              placeholder="Any specific notes about this customer..."
            />
          </div>

          {/* Actions */}
          <SubmitButton customerId={customerId} />

        </form>
      </CardContent>
    </Card>
  )
}
