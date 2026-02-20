'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageCircle, Pencil, RotateCcw, Sparkles, CheckCircle2,
  CreditCard, Truck, RefreshCw, Crown, ChevronDown, ChevronUp,
  Copy, Check, Send, Package
} from 'lucide-react'
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

const TEMPLATE_INFO: Record<MessageTemplate, {
  name: string
  description: string
  icon: any
  gradient: string
  bgColor: string
  borderColor: string
  isPremium: boolean
  triggerText: string
}> = {
  order_confirmation: {
    name: 'Order Confirmation',
    description: 'Auto-sent when a new order is placed',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    isPremium: false,
    triggerText: 'Triggers: Order Created'
  },
  payment_reminder: {
    name: 'Payment Reminder',
    description: 'Nudge customers to complete pending payments',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    isPremium: true,
    triggerText: 'Triggers: Manual / Pending Orders'
  },
  shipped_update: {
    name: 'Shipped Update',
    description: 'Notify customers with tracking details',
    icon: Truck,
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    isPremium: true,
    triggerText: 'Triggers: Status → Shipped'
  },
  delivered_confirmation: {
    name: 'Delivered Confirmation',
    description: 'Confirm delivery and request a review',
    icon: Package,
    gradient: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    isPremium: true,
    triggerText: 'Triggers: Status → Delivered'
  },
  follow_up: {
    name: 'Follow-up Message',
    description: 'Re-engage customers after purchase',
    icon: RefreshCw,
    gradient: 'from-orange-500 to-rose-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    isPremium: true,
    triggerText: 'Triggers: Manual / Post-Delivery'
  }
}

const AVAILABLE_VARIABLES = [
  { key: '{customerName}', description: 'Customer full name' },
  { key: '{firstName}', description: 'First name only' },
  { key: '{orderNumber}', description: 'Order ID / number' },
  { key: '{totalAmount}', description: 'Total order amount' },
  { key: '{items}', description: 'Ordered product list' },
  { key: '{deliveryDate}', description: 'Expected delivery' },
  { key: '{trackingNumber}', description: 'Shipment tracking #' },
  { key: '{shopName}', description: 'Your business name' },
]

export function WhatsAppTemplatesClient() {
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()
  const router = useRouter()

  const [customTemplates, setCustomTemplates] = useState<Record<string, string>>({})
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

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

  const handleResetTemplate = async (templateKey?: MessageTemplate) => {
    const target = templateKey || editingTemplate
    if (!target) return

    try {
      const response = await fetch('/api/templates/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: target }),
      })

      if (!response.ok) throw new Error('Failed to reset')

      setCustomTemplates((prev) => {
        const newTemplates = { ...prev }
        delete newTemplates[target]
        return newTemplates
      })

      toast.success('Template reset to default')
    } catch (error) {
      toast.error('Failed to reset template')
      throw error
    }
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 2000)
    toast.success('Copied!')
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
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <MessageCircle className="h-5 w-5" />
            </div>
            WhatsApp Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize order notification messages sent via WhatsApp
          </p>
        </div>
        <Badge variant="outline" className="h-7 w-fit">
          {templateKeys.length} Templates
        </Badge>
      </div>

      {/* Premium Banner */}
      {!isPremium && (
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden relative">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Unlock Template Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Edit all 5 templates with your own branding and style
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/settings/subscription#pricing')} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shrink-0">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="space-y-3">
        {templateKeys.map((templateKey) => {
          const info = TEMPLATE_INFO[templateKey]
          const Icon = info.icon
          const isCustomized = !!customTemplates[templateKey]
          const isLocked = !isPremium && info.isPremium
          const currentMessage = customTemplates[templateKey] || DEFAULT_TEMPLATES[templateKey]
          const isExpanded = expandedCard === templateKey

          return (
            <Card
              key={templateKey}
              className={`transition-all duration-200 hover:shadow-md ${
                isLocked ? 'opacity-60 hover:opacity-75' : ''
              } ${info.borderColor}`}
            >
              {/* Card Header — Always visible */}
              <div className="p-4 flex items-center gap-3">
                {/* Icon with gradient */}
                <div className={`p-2 rounded-lg bg-gradient-to-br ${info.gradient} text-white shadow-sm shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{info.name}</h3>
                    {isCustomized && (
                      <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 px-1.5">
                        <Sparkles className="h-2.5 w-2.5" />
                        Custom
                      </Badge>
                    )}
                    {isLocked && <ProBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{info.triggerText}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isCustomized && !isLocked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleResetTemplate(templateKey); }}
                      title="Reset to default"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant={isLocked ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleEdit(templateKey)}
                    disabled={loadingTemplates}
                    className={`gap-1.5 h-8 text-xs ${
                      isLocked
                        ? ''
                        : `bg-gradient-to-r ${info.gradient} hover:opacity-90 text-white shadow-sm`
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Crown className="h-3 w-3 text-amber-600" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3 w-3" />
                        Edit
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setExpandedCard(isExpanded ? null : templateKey)}
                    title={isExpanded ? "Collapse" : "Preview message"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expandable Preview */}
              {isExpanded && (
                <div className={`px-4 pb-4 border-t ${info.bgColor}`}>
                  <div className="pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {isCustomized ? 'Custom Template' : 'Default Template'}
                      </span>
                    </div>

                    {/* WhatsApp-style bubble */}
                    <div className="max-w-lg">
                      <div className="bg-white dark:bg-zinc-800 rounded-xl rounded-tl-sm p-3 shadow-sm border">
                        <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 break-words">
                          {currentMessage}
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <Check className="h-3 w-3 text-sky-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Variables Reference Card */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Dynamic Variables Reference
          </CardTitle>
          <CardDescription className="text-xs">
            Click to copy — paste these into your templates for auto-personalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => copyVariable(v.key)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors text-left group cursor-pointer"
              >
                <div>
                  <code className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{v.key}</code>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{v.description}</p>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedVar === v.key ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>
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
          onReset={() => handleResetTemplate()}
        />
      )}
    </div>
  )
}

function ProBadge() {
  return (
    <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
      <Crown className="h-2.5 w-2.5" />
      Pro
    </Badge>
  )
}
