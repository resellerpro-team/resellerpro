'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles, RotateCcw, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

type MessageTemplate = 'order_confirmation' | 'payment_reminder' | 'shipped_update' | 'delivered_confirmation' | 'follow_up'

interface WhatsAppTemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  templateType: MessageTemplate
  defaultMessage: string
  currentMessage?: string
  onSave: (customMessage: string) => Promise<void>
  onReset?: () => Promise<void>
  previewData?: {
    customerName: string
    firstName: string
    orderNumber: string
    totalAmount: string
    items: string
    deliveryDate: string
    trackingNumber: string
    shopName: string
  }
}

const TEMPLATE_NAMES: Record<MessageTemplate, string> = {
  order_confirmation: 'Order Confirmation',
  payment_reminder: 'Payment Reminder',
  shipped_update: 'Shipped Update',
  delivered_confirmation: 'Delivered Confirmation',
  follow_up: 'Follow-up Message',
}

const AVAILABLE_VARIABLES = [
  { key: '{customerName}', description: 'Customer full name' },
  { key: '{firstName}', description: 'Customer first name' },
  { key: '{orderNumber}', description: 'Order number/ID' },
  { key: '{totalAmount}', description: 'Order total amount' },
  { key: '{items}', description: 'Product list' },
  { key: '{deliveryDate}', description: 'Expected delivery date' },
  { key: '{trackingNumber}', description: 'Tracking number' },
  { key: '{shopName}', description: 'Your business name' },
]

export function WhatsAppTemplateEditor({
  isOpen,
  onClose,
  templateType,
  defaultMessage,
  currentMessage,
  onSave,
  onReset,
  previewData,
}: WhatsAppTemplateEditorProps) {
  const [customMessage, setCustomMessage] = useState(currentMessage || defaultMessage)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  // Reset when template changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setCustomMessage(currentMessage || defaultMessage)
    }
  }, [isOpen, currentMessage, defaultMessage, templateType])

  const handleSave = async () => {
    if (!customMessage.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      await onSave(customMessage)
      toast.success('Template saved successfully!')
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!onReset) return

    setIsResetting(true)
    try {
      await onReset()
      setCustomMessage(defaultMessage)
      toast.success('Template reset to default')
      onClose()
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Failed to reset template')
    } finally {
      setIsResetting(false)
    }
  }

  const insertVariable = (variable: string) => {
    setCustomMessage((prev) => prev + variable)
    toast.success(`Added ${variable}`)
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 2000)
    toast.success('Variable copied!')
  }

  const characterCount = customMessage.length
  const isModified = customMessage !== (currentMessage || defaultMessage)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Customize {TEMPLATE_NAMES[templateType]}
          </DialogTitle>
          <DialogDescription>
            Personalize your WhatsApp message template. Use variables to insert dynamic content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <Label htmlFor="message" className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Message Template</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {characterCount} characters
                </Badge>
              </Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Type your message here..."
              />
            </div>

            {/* Preview */}
            <div>
              <Label className="text-sm font-medium mb-2">Preview (Live)</Label>
              <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
                <div className="whitespace-pre-wrap text-sm font-mono">
                  {customMessage
                    .replace(/{customerName}/g, previewData?.customerName || 'John Doe')
                    .replace(/{firstName}/g, previewData?.firstName || 'John')
                    .replace(/{orderNumber}/g, previewData?.orderNumber || '#ORD-12345')
                    .replace(/{totalAmount}/g, previewData?.totalAmount || '2,499')
                    .replace(/{items}/g, previewData?.items || '2x Premium Product\n1x Accessory Kit')
                    .replace(/{deliveryDate}/g, previewData?.deliveryDate || '25 Jan 2026')
                    .replace(/{trackingNumber}/g, previewData?.trackingNumber || 'TRK123456789')
                    .replace(/{shopName}/g, previewData?.shopName || 'Your Store')}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Variables Sidebar */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Available Variables</Label>
              <ScrollArea className="h-[520px]">
                <div className="space-y-2 pr-4">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <div
                      key={variable.key}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <code className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {variable.key}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={() => copyVariable(variable.key)}
                        >
                          {copiedVar === variable.key ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{variable.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-7"
                        onClick={() => insertVariable(variable.key)}
                      >
                        Insert
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            {onReset && isModified && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving || isResetting}
                className="gap-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                  </>
                )}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose} disabled={isSaving || isResetting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isResetting || !isModified} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
