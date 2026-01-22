'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, Pencil, RotateCcw, Sparkles, CheckCircle2, CreditCard, Truck, RefreshCw, Crown } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { WhatsAppTemplateEditor } from '@/components/orders/WhatsAppTemplateEditor'
import { toast } from 'sonner'

type MessageTemplate = 'order_confirmation' | 'payment_reminder' | 'shipped_update' | 'delivered_confirmation' | 'follow_up'

interface TemplateCustomization {
  id: string
  template_type: MessageTemplate
  custom_message: string
}

const DEFAULT_TEMPLATES: Record<MessageTemplate, string> = {
  order_confirmation: `Hi {firstName}!

Your order #{orderNumber} has been *CONFIRMED!*

*Order Summary:*
━━━━━━━━━━━━━━━━━
{items}
━━━━━━━━━━━━━━━━━

*Total Amount:* Rs.{totalAmount}
*Expected Delivery:* {deliveryDate}

We'll keep you updated at every step!

Thank you for choosing *{shopName}*!`,

  payment_reminder: `Hi {firstName}!

Your order #{orderNumber} is ready!

*Items:*
{items}

*PENDING PAYMENT:* Rs.{totalAmount}

Please complete the payment so we can ship your order.

Need help? Just reply to this message!

Thank you,
*{shopName}*`,

  shipped_update: `Great news, {firstName}!

Your order #{orderNumber} has been *SHIPPED!*

*Items on the way:*
{items}

*Tracking Details:*
Tracking Number: {trackingNumber}

Track your order in real-time!

*Expected Delivery:* {deliveryDate}
*Order Value:* Rs.{totalAmount}

Your order is on its way!

*{shopName}*`,

  delivered_confirmation: `Hi {firstName}!

Fantastic news! Your order #{orderNumber} has been *DELIVERED SUCCESSFULLY!*

*Delivered Items:*
{items}

*Order Value:* Rs.{totalAmount}

We hope you absolutely love your purchase!

*Quick Feedback Request:*
How was your experience with us?

Please rate us (1-5 stars)
Your feedback means a lot!

Thank you for choosing *{shopName}*!
We look forward to serving you again!`,

  follow_up: `Hi {firstName}!

Thank you for your recent order #{orderNumber} with *{shopName}*!

*Your Recent Purchase:*
{items}

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
*{shopName}* Team`
}

const TEMPLATE_INFO: Record<MessageTemplate, { name: string; description: string; icon: any; color: string; isPremium: boolean }> = {
  order_confirmation: {
    name: 'Order Confirmation',
    description: 'Sent when order is placed and confirmed',
    icon: CheckCircle2,
    color: 'text-green-600',
    isPremium: false
  },
  payment_reminder: {
    name: 'Payment Reminder',
    description: 'Remind customers to complete payment',
    icon: CreditCard,
    color: 'text-yellow-600',
    isPremium: true
  },
  shipped_update: {
    name: 'Shipped Update',
    description: 'Notify when order is shipped with tracking',
    icon: Truck,
    color: 'text-blue-600',
    isPremium: true
  },
  delivered_confirmation: {
    name: 'Delivered Confirmation',
    description: 'Confirm delivery and request feedback',
    icon: CheckCircle2,
    color: 'text-purple-600',
    isPremium: true
  },
  follow_up: {
    name: 'Follow-up Message',
    description: 'Engage customers after purchase',
    icon: RefreshCw,
    color: 'text-orange-600',
    isPremium: true
  }
}

export function WhatsAppTemplatesClient() {
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()
  const router = useRouter()
  
  const [customTemplates, setCustomTemplates] = useState<Record<string, string>>({})
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)

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
        console.error('Error loading templates:', error)
        toast.error('Failed to load custom templates')
      } finally {
        setLoadingTemplates(false)
      }
    }

    loadCustomTemplates()
  }, [])

  const handleEdit = (template: MessageTemplate) => {
    // Customization is key premium feature
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

      toast.success('Template saved successfully!')
    } catch (error) {
      toast.error('Failed to save template')
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

      toast.success('Template reset to default')
    } catch (error) {
      toast.error('Failed to reset template')
      throw error
    }
  }

  const templateKeys = Object.keys(TEMPLATE_INFO) as MessageTemplate[]

  if (isCheckingSubscription) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-8 w-8" />
          WhatsApp Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your WhatsApp message templates for order communications
        </p>
      </div>

      {/* Premium Banner */}
      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-lg">Unlock All Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Get access to all 5 templates plus customization with Premium
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/settings/subscription#pricing')} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid gap-4">
        {templateKeys.map((templateKey) => {
          const info = TEMPLATE_INFO[templateKey]
          const Icon = info.icon
          const isCustomized = !!customTemplates[templateKey]
          const isLocked = !isPremium && info.isPremium
          const currentMessage = customTemplates[templateKey] || DEFAULT_TEMPLATES[templateKey]

          return (
            <Card key={templateKey} className={isLocked ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <Icon className={`h-5 w-5 ${info.color}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {info.name}
                        {isCustomized && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Customized
                          </Badge>
                        )}
                        {isLocked && <ProBadge />}
                      </CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isCustomized && !isLocked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetTemplate()}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                    )}
                    <Button
                      variant={isLocked || (!isPremium && !isLocked) ? 'outline' : 'outline'}
                      size="sm"
                      onClick={() => handleEdit(templateKey)}
                      className="gap-2"
                      disabled={loadingTemplates}
                    >
                      {isLocked ? (
                        <>
                          <Crown className="h-4 w-4 text-amber-600" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Pencil className="h-4 w-4" />
                          {!isPremium ? <Crown className="h-3 w-3 ml-1 text-amber-600" /> : 'Edit'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                    {currentMessage.substring(0, 200)}
                    {currentMessage.length > 200 && '...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              '{customerName}',
              '{firstName}',
              '{orderNumber}',
              '{totalAmount}',
              '{items}',
              '{deliveryDate}',
              '{trackingNumber}',
              '{shopName}'
            ].map((variable) => (
              <code key={variable} className="px-2 py-1 rounded bg-muted font-mono text-xs">
                {variable}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      {isPremium && editingTemplate && (
        <WhatsAppTemplateEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingTemplate(null)
          }}
          templateType={editingTemplate}
          defaultMessage={DEFAULT_TEMPLATES[editingTemplate]}
          currentMessage={customTemplates[editingTemplate]}
          onSave={handleSaveTemplate}
          onReset={handleResetTemplate}
        />
      )}
    </div>
  )
}

function ProBadge() {
  return (
    <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
      <Crown className="h-3 w-3" />
      Pro
    </Badge>
  )
}
