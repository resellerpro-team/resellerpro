'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageCircle, CheckCircle2, CreditCard, Truck, RefreshCw, Pencil, Crown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { WhatsAppTemplateEditor } from './WhatsAppTemplateEditor'

type MessageTemplate = 'order_confirmation' | 'payment_reminder' | 'shipped_update' | 'delivered_confirmation' | 'follow_up'

interface WhatsAppOrderMessagesProps {
  orderNumber: string
  customerName: string
  customerPhone: string
  orderStatus: string
  paymentStatus: string
  totalAmount: string | number
  itemsText: string
  trackingNumber?: string
  courierService?: string
  shopName?: string
  expectedDeliveryDate?: string
}

interface TemplateCustomization {
  id: string
  template_type: MessageTemplate
  custom_message: string
}

export function WhatsAppOrderMessages({
  orderNumber,
  customerName,
  customerPhone,
  orderStatus,
  paymentStatus,
  totalAmount,
  itemsText,
  trackingNumber,
  courierService,
  shopName = 'Our Store',
  expectedDeliveryDate,
}: WhatsAppOrderMessagesProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()
  
  const [sending, setSending] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<Record<string, string>>({})
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)

  // Load custom templates on mount
  useEffect(() => {
    async function loadCustomTemplates() {
      try {
        const response = await fetch('/api/templates/customize')
        if (response.ok) {
          const data = await response.json()
          const templatesMap: Record<string, string> = {}
          data.templates?.forEach((t: TemplateCustomization) => {
            templatesMap[t.template_type] = t.custom_message
          })
          setCustomTemplates(templatesMap)
        }
      } catch (error) {
        console.error('Error loading custom templates:', error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    loadCustomTemplates()
  }, [])

  const formatWhatsAppNumber = (phone: string): string | null => {
    if (!phone) return null
    let cleaned = phone.replace(/[^\d+]/g, '')
    cleaned = cleaned.replace(/^0+/, '')
    
    if (cleaned.startsWith('+')) {
      if (cleaned.length >= 11) return cleaned
      return null
    }
    
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`
    }
    
    if (cleaned.length === 10) {
      return `+91${cleaned}`
    }
    
    if (cleaned.length >= 11 && cleaned.length <= 15) {
      return `+${cleaned}`
    }
    
    return null
  }

  const getDeliveryDate = (): string => {
    if (expectedDeliveryDate) {
      return new Date(expectedDeliveryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 6)
    return estimatedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDefaultMessage = (template: MessageTemplate): string => {
    const firstName = customerName.split(' ')[0]
    const productsFormatted = itemsText || 'Your order items'

    switch (template) {
      case 'order_confirmation':
        return `Hi ${firstName}!

Your order #${orderNumber} has been *CONFIRMED!*

*Order Summary:*
━━━━━━━━━━━━━━━━━
${productsFormatted}
━━━━━━━━━━━━━━━━━

*Total Amount:* Rs.${totalAmount}
*Expected Delivery:* ${getDeliveryDate()}

We'll keep you updated at every step!

Thank you for choosing *${shopName}*!`

      case 'payment_reminder':
        return `Hi ${firstName}!

Your order #${orderNumber} is ready!

*Items:*
${productsFormatted}

*PENDING PAYMENT:* Rs.${totalAmount}

Please complete the payment so we can ship your order.

Need help? Just reply to this message!

Thank you,
*${shopName}*`

      case 'shipped_update':
        return `Great news, ${firstName}!

Your order #${orderNumber} has been *SHIPPED!*

*Items on the way:*
${productsFormatted}

${trackingNumber ? `*Tracking Details:*
Tracking Number: ${trackingNumber}${courierService ? `
Courier: ${courierService}` : ''}

Track your order in real-time!` : `Tracking details will be shared soon.`}

*Expected Delivery:* ${getDeliveryDate()}
*Order Value:* Rs.${totalAmount}

Your order is on its way!

*${shopName}*`

      case 'delivered_confirmation':
        return `Hi ${firstName}!

Fantastic news! Your order #${orderNumber} has been *DELIVERED SUCCESSFULLY!*

*Delivered Items:*
${productsFormatted}

*Order Value:* Rs.${totalAmount}

We hope you absolutely love your purchase!

*Quick Feedback Request:*
How was your experience with us?

Please rate us (1-5 stars)
Your feedback means a lot!

Thank you for choosing *${shopName}*!
We look forward to serving you again!`

      case 'follow_up':
        return `Hi ${firstName}!

Thank you for your recent order #${orderNumber} with *${shopName}*!

*Your Recent Purchase:*
${productsFormatted}

We hope you're loving it!

*What's New:*
- Fresh stock just arrived
- Exclusive deals for our valued customers
- New product categories

*Need Support?*
- Questions about your order?
- Looking for something specific?
- Want product recommendations?

Just reply - we're here to help!

Stay connected for special offers!

Best regards,
*${shopName}* Team`

      default:
        return ''
    }
  }

  const replacementVariables = (message: string): string => {
    const firstName = customerName.split(' ')[0]
    const productsFormatted = itemsText || 'Your order items'

    return message
      .replace(/{customerName}/g, customerName)
      .replace(/{firstName}/g, firstName)
      .replace(/{orderNumber}/g, orderNumber)
      .replace(/{totalAmount}/g, String(totalAmount))
      .replace(/{items}/g, productsFormatted)
      .replace(/{deliveryDate}/g, getDeliveryDate())
      .replace(/{trackingNumber}/g, trackingNumber || 'Not available yet')
      .replace(/{shopName}/g, shopName)
  }

  const generateMessage = (template: MessageTemplate): string => {
    // Use custom template if available, otherwise default
    const baseMessage = customTemplates[template] || getDefaultMessage(template)
    return replacementVariables(baseMessage)
  }

  const sendWhatsAppMessage = (template: MessageTemplate) => {
    setSending(true)

    try {
      const formattedPhone = formatWhatsAppNumber(customerPhone)

      if (!formattedPhone) {
        toast({
          title: 'Invalid Phone Number',
          description: `Cannot send WhatsApp message. Phone: ${customerPhone || 'Not provided'}`,
          variant: 'destructive',
        })
        setSending(false)
        return
      }

      const message = generateMessage(template)

      if (!message) {
        toast({
          title: 'Error',
          description: 'Failed to generate message template',
          variant: 'destructive',
        })
        setSending(false)
        return
      }

      const encodedMessage = encodeURIComponent(message)
      const whatsappPhone = formattedPhone.replace('+', '')
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      const templateNames = {
        order_confirmation: 'Order Confirmation',
        payment_reminder: 'Payment Reminder',
        shipped_update: 'Shipped Update',
        delivered_confirmation: 'Delivered Confirmation',
        follow_up: 'Follow-up Message',
      }

      toast({
        title: 'WhatsApp Opened',
        description: `${templateNames[template]} ready to send to ${customerName}`,
      })
    } catch (error) {
      console.error('WhatsApp send error:', error)
      toast({
        title: 'Error',
        description: 'Failed to open WhatsApp. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleTemplateClick = (template: MessageTemplate, isPremiumTemplate: boolean) => {
    // Free users can only use order_confirmation
    if (!isPremium && isPremiumTemplate) {
      router.push('/settings/subscription#pricing')
      return
    }

    sendWhatsAppMessage(template)
  }

  const handleEditClick = (template: MessageTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Customization is a premium feature
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  const handleSaveTemplate = async (customMessage: string) => {
    if (!editingTemplate) return

    try {
      const response = await fetch('/api/templates/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_type: editingTemplate,
          custom_message: customMessage,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      setCustomTemplates((prev) => ({
        ...prev,
        [editingTemplate]: customMessage,
      }))
    } catch (error) {
      throw error
    }
  }

  const handleResetTemplate = async () => {
    if (!editingTemplate) return

    try {
      const response = await fetch('/api/templates/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: editingTemplate }),
      })

      if (!response.ok) throw new Error('Failed to reset')

      setCustomTemplates((prev) => {
        const newTemplates = { ...prev }
        delete newTemplates[editingTemplate]
        return newTemplates
      })
    } catch (error) {
      throw error
    }
  }

  const hasValidPhone = !!formatWhatsAppNumber(customerPhone)

  const templates: Array<{
    type: MessageTemplate
    label: string
    icon: any
    iconColor: string
    isPremium: boolean
  }> = [
    { type: 'order_confirmation', label: 'Order Confirmation', icon: CheckCircle2, iconColor: 'text-green-600', isPremium: false },
    { type: 'payment_reminder', label: 'Payment Reminder', icon: CreditCard, iconColor: 'text-yellow-600', isPremium: true },
    { type: 'shipped_update', label: 'Shipped Update', icon: Truck, iconColor: 'text-blue-600', isPremium: true },
    { type: 'delivered_confirmation', label: 'Delivered Confirmation', icon: CheckCircle2, iconColor: 'text-purple-600', isPremium: true },
    { type: 'follow_up', label: 'Follow-up Message', icon: RefreshCw, iconColor: 'text-orange-600', isPremium: true },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={sending || !hasValidPhone || isCheckingSubscription || loadingTemplates}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {sending ? 'Opening...' : loadingTemplates ? 'Loading...' : 'Send WhatsApp Update'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Choose Message Template</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {templates.map((template, index) => {
            const Icon = template.icon
            const isLocked = !isPremium && template.isPremium

            return (
              <div key={template.type}>
                <DropdownMenuItem
                  onClick={() => handleTemplateClick(template.type, template.isPremium)}
                  className={`cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
                  disabled={isLocked}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${template.iconColor}`} />
                      <span>{template.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isLocked && <ProBadge />}
                      
                      {!loadingTemplates && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-6 w-6 ${!isPremium ? 'opacity-50 hover:opacity-100 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600' : ''}`}
                          onClick={(e) => handleEditClick(template.type, e)}
                          title={!isPremium ? "Customize with Premium" : "Edit Template"}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
                {index === 0 && <DropdownMenuSeparator />}
              </div>
            )
          })}

          {!hasValidPhone && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                ⚠️ Invalid phone number
              </div>
            </>
          )}

          {!isPremium && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <Button
                  size="sm"
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => router.push('/settings/subscription#pricing')}
                >
                  <Crown className="h-4 w-4 text-amber-600" />
                  Unlock All Templates
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isPremium && editingTemplate && (
        <WhatsAppTemplateEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingTemplate(null)
          }}
          templateType={editingTemplate}
          defaultMessage={getDefaultMessage(editingTemplate)}
          currentMessage={customTemplates[editingTemplate]}
          onSave={handleSaveTemplate}
          onReset={handleResetTemplate}
          previewData={{
            customerName,
            firstName: customerName.split(' ')[0],
            orderNumber,
            totalAmount: String(totalAmount),
            items: itemsText || 'Your order items',
            deliveryDate: getDeliveryDate(),
            trackingNumber: trackingNumber || 'Not available yet',
            shopName,
          }}
        />
      )}
    </>
  )
}
