'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function openSection(id: string) {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return

  // If it's a <details> element, use the built-in API.
  if (el instanceof HTMLDetailsElement) {
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  // Fallback: add an "open" marker class/attribute and scroll into view.
  el.classList.add('open')
  el.setAttribute('data-open', 'true')
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Truck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateOrderStatus } from '@/app/(dashboard)/orders/actions'
import { STATUS_FLOW, STATUS_CONFIG } from '@/config/order-status'
import { generateStatusMessage } from '@/utils/whatsapp-helper'

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  orderNumber,
  customerName,
  customerPhone,
  orderItems = [],
  totalAmount = 0,
  shopName = 'Your Store',
  existingCourier,
  existingTracking,
  onStatusUpdated,
}: {
  orderId: string
  currentStatus: string
  orderNumber?: string
  customerName?: string
  customerPhone?: string
  orderItems?: string[]
  totalAmount?: number
  shopName?: string
  existingCourier?: string
  existingTracking?: string
  onStatusUpdated?: (status: string) => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState('')
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
  // Initialize from props if available
  const [lastUpdatedStatus, setLastUpdatedStatus] = useState('')
  const [lastCourierName, setLastCourierName] = useState('')
  const [lastTrackingNumber, setLastTrackingNumber] = useState('')
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)
  const [previousStatus, setPreviousStatus] = useState('')

  // Get allowed statuses based on current status
  const allowedStatuses = STATUS_FLOW[currentStatus] || []
  const isFinalStatus = allowedStatuses.length === 0

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStatus) {
      toast({
        title: 'No status selected',
        description: 'Please select a new status',
        variant: 'destructive',
      })
      return
    }

    // Validate shipping info if status is shipped
    if (selectedStatus === 'shipped' && (!courierName || !trackingNumber)) {
      toast({
        title: 'Missing shipping details',
        description: 'Please provide courier name and tracking number',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('status', selectedStatus)
      formData.append('notes', notes)

      if (selectedStatus === 'shipped') {
        formData.append('courierService', courierName)
        formData.append('trackingNumber', trackingNumber)
      }

      const result = await updateOrderStatus(formData)
      if (result.success) {
        // Store previous status for undo
        setPreviousStatus(currentStatus)

        // Clear any existing undo timeout
        if (undoTimeout) {
          clearTimeout(undoTimeout)
        }

        // Show toast with undo button
        const { dismiss } = toast({
          title: '✅ Status Updated',
          description: `Order status changed to ${STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG]?.label}.`,
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleUndo(currentStatus, selectedStatus)
                dismiss()
              }}
            >
              Undo
            </Button>
          ),
          duration: 5000,
        })

        // Set timeout to clear undo ability after 5 seconds
        const timeout = setTimeout(() => {
          setPreviousStatus('')
        }, 5000)
        setUndoTimeout(timeout)

        // Show WhatsApp button after successful update
        setLastUpdatedStatus(selectedStatus)

        if (selectedStatus === 'shipped') {
          setLastCourierName(courierName)
          setLastTrackingNumber(trackingNumber)
        }

        openSection('order-status')
        onStatusUpdated?.(selectedStatus)

        // Reset form
        setSelectedStatus('')
        setNotes('')
        setCourierName('')
        setTrackingNumber('')

        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update order status',
          variant: 'destructive',
        })
      }
    })
  }

  // Undo handler - only updates if API call succeeds
  const handleUndo = async (oldStatus: string, newStatus: string) => {
    // Clear the timeout immediately
    if (undoTimeout) {
      clearTimeout(undoTimeout)
      setUndoTimeout(null)
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('status', oldStatus)
      formData.append('isUndo', 'true') // Flag to bypass validation
      formData.append('notes', `Reverted from ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label} back to ${STATUS_CONFIG[oldStatus as keyof typeof STATUS_CONFIG]?.label}`)

      const result = await updateOrderStatus(formData)

      if (result.success) {
        // SUCCESS: Update state only after successful revert
        toast({
          title: '↩️ Status Reverted',
          description: `Order restored to ${STATUS_CONFIG[oldStatus as keyof typeof STATUS_CONFIG]?.label}.`,
        })

        setPreviousStatus('')
        setLastUpdatedStatus('')

        onStatusUpdated?.(oldStatus)
        router.refresh()
      } else {
        // FAILURE: Show error but don't change anything
        toast({
          title: 'Undo Failed',
          description: result.message || 'Could not revert. Status remains unchanged.',
          variant: 'destructive',
        })
        // Reset undo state but keep current status
        setPreviousStatus('')
      }
    })
  }

  const handleWhatsAppSend = () => {
    // Use last updated values if available (user just updated), otherwise fallback to props (persistent)
    const statusToSend = lastUpdatedStatus || currentStatus
    const trackingToSend = lastTrackingNumber || existingTracking
    const courierToSend = lastCourierName || existingCourier

    const message = generateStatusMessage(
      customerName || 'Customer',
      orderNumber || orderId,
      statusToSend,
      trackingToSend || undefined,
      courierToSend || undefined,
      { products: orderItems, totalAmount },
      shopName
    )
    window.open(
      `https://wa.me/${customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
    // Don't hide button, just clear "just updated" state
    setLastUpdatedStatus('')
  }

  // If order is in final status, show info message but still allow WhatsApp resend
  if (isFinalStatus) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This order is in a final state ({STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]?.label}).
            Status cannot be changed.
          </AlertDescription>
        </Alert>

        {/* WhatsApp Resend Button for Final States */}
        {customerPhone && (
          <div className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
              onClick={() => {
                const message = generateStatusMessage(
                  customerName || 'Customer',
                  orderNumber || orderId,
                  currentStatus, // Use current status since we can't change it
                  existingTracking || undefined,
                  existingCourier || undefined,
                  { products: orderItems, totalAmount },
                  shopName
                )
                window.open(
                  `https://wa.me/${customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                  '_blank'
                )
              }}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Resend {STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]?.label} Update via WhatsApp
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleStatusUpdate} className="space-y-4 overflow-visible">
        <div className="space-y-2">
          <Label htmlFor="status">Update Order Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select new status..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {allowedStatuses.map((status) => {
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {allowedStatuses.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Available transitions: {allowedStatuses.map(s =>
                STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label
              ).join(', ')}
            </p>
          )}
        </div>

        {selectedStatus === 'shipped' && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/50 animate-in fade-in-50 duration-300">
            <div className="space-y-2">
              <Label htmlFor="courierName">
                Courier Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courierName"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g., BlueDart, Delhivery, DTDC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">
                Tracking Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., BD123456789"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this status change..."
            rows={3}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !selectedStatus}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Update Status
            </>
          )}
        </Button>
      </form>

      {/* WhatsApp Button - Always visible if phone exists, BUT skip for pending status */}
      {customerPhone && (lastUpdatedStatus || currentStatus) !== 'pending' && (
        <div className="pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-green-50 hover:bg-green-100 border-green-500 text-green-700 animate-in fade-in-50 slide-in-from-top-2 duration-300"
            onClick={handleWhatsAppSend}
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Send {STATUS_CONFIG[(lastUpdatedStatus || currentStatus) as keyof typeof STATUS_CONFIG]?.label} Update via WhatsApp
          </Button>
        </div>
      )}
    </div>
  )
}