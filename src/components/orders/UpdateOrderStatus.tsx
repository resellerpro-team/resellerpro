'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
async function updateOrderStatus(formData: FormData) {
  try {
    const res = await fetch('/api/orders/update-status', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return {
      success: res.ok,
      message: data?.message,
      error: data?.error,
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Truck } from 'lucide-react'
import { ORDER_STATUSES } from '@/lib/utils/constants'
import { ShareDialog } from '@/components/shared/ShareDialog'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
      {pending ? 'Updating...' : 'Update & Notify Customer'}
    </Button>
  )
}

export function UpdateOrderStatus({ order }: { order: any }) {
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async (formData: FormData) => {
    // Manually add the selected status to the form data
    formData.append('status', selectedStatus)

    const result = await updateOrderStatus(formData)

    if (result.success) {
      toast({
        title: 'Status Updated!',
        description: result.message,
      })
      // Open the share dialog automatically on success
      setIsShareDialogOpen(true)
    } else {
      toast({
        title: 'Update Failed',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <form action={handleStatusUpdate} className="space-y-4">
        <input type="hidden" name="orderId" value={order.id} />

        <div className="space-y-2">
          <Label htmlFor="status">Change Order Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedStatus === 'shipped' && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/50 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="courierName">Courier Name</Label>
              <Input id="courierName" name="courierName" placeholder="e.g., BlueDart, Delhivery" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input id="trackingNumber" name="trackingNumber" placeholder="e.g., BD123456789" />
            </div>
          </div>
        )}
        
        <SubmitButton />
      </form>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        customerName={order.customers.name}
        customerPhone={order.customers.phone}
        orderNumber={order.order_number.toString()}
        orderStatus={selectedStatus}
      />
    </>
  )
}