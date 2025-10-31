'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Check, Copy, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

interface ShareDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  customerPhone: string
  orderNumber: string
  orderStatus: string
}

const getMessageTemplate = (status: string, name: string, orderNum: string): string => {
  switch (status.toLowerCase()) {
    case 'processing':
      return `Hi ${name}! Great news! Your order #${orderNum} is now being processed. We'll notify you again once it's shipped. Thank you for your patience! 🙏`
    case 'shipped':
      // We can add a placeholder for the tracking link
      return `Hi ${name}! Your order #${orderNum} has been shipped! 🚀 You can expect delivery in 2-4 business days. Tracking details will be shared shortly.`
    case 'delivered':
      return `Hi ${name}! 🎉 We're happy to let you know that your order #${orderNum} has been delivered. We hope you love your products! Please feel free to share your feedback.`
    default:
      return `Hi ${name}, here's an update on your order #${orderNum}. The status is now: ${status}.`
  }
}

export function ShareDialog({
  isOpen,
  onOpenChange,
  customerName,
  customerPhone,
  orderNumber,
  orderStatus,
}: ShareDialogProps) {
  const { toast } = useToast()
  const [isCopied, setIsCopied] = useState(false)
  
  const message = getMessageTemplate(orderStatus, customerName, orderNumber)

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    setIsCopied(true)
    toast({ title: 'Message copied to clipboard!' })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShare = (platform: 'whatsapp' | 'instagram') => {
    handleCopy()
    
    // Construct the correct URL to open the app
    // For WhatsApp, it pre-fills the phone number
    const whatsappUrl = `https://wa.me/91${customerPhone}`
    
    // For Instagram, it opens the DMs (no way to pre-fill user or message)
    const instagramUrl = `instagram://direct` 

    window.open(platform === 'whatsapp' ? whatsappUrl : instagramUrl, '_blank')
    onOpenChange(false) // Close the dialog after sharing
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Order Update</DialogTitle>
          <DialogDescription>
            A professional message has been generated. Copy and share it with your customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message to send:</Label>
            <Textarea id="message" value={message} readOnly rows={5} className="bg-muted" />
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {isCopied ? 'Copied!' : 'Copy Text'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleShare('whatsapp')} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Copy & Share on WhatsApp
            </Button>
            <Button onClick={() => handleShare('instagram')} variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Copy & Share on Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}