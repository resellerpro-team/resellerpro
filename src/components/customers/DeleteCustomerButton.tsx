'use client'

import { useState, useTransition } from 'react'
import { deleteCustomer } from '@/app/(dashboard)/customers/action'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

import { useQueryClient } from '@tanstack/react-query'

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  // Controls the pop-up dialog
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCustomer(customerId)

      if (result.success) {
        toast({
          title: "Customer Deleted",
          description: result.message,
        })

        // Invalidate queries to update lists if we are on a list page
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        queryClient.invalidateQueries({ queryKey: ['customers-stats'] })

        // Only push if we are on the detail page (logic might need check, but safe default)
        // If we are in the list, pushing to /customers is fine (no-op or reload of same route)
        // But we want to avoid hard reload.
        // Let's assume this button is used on detail page mainly or list. 
        // Best approach: Invalidate and let the UI react. 
        // If we are deleting from a list, router.push is not needed.
        // If we are deleting from details, we need to go back.
        // Let's keep router.push for navigation safety but remove router.refresh()
        router.push("/customers")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      {/* Delete Button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="h-5 w-5 text-red-500" />
        Delete
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Customer?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all related data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
