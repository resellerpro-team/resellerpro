'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sparkles, RotateCcw, Copy, Check, Layout, MessageSquare, Info, ChevronRight, Calculator } from 'lucide-react'
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

  const renderedPreview = customMessage
    .replace(/{customerName}/g, previewData?.customerName || 'John Doe')
    .replace(/{firstName}/g, previewData?.firstName || 'John')
    .replace(/{orderNumber}/g, previewData?.orderNumber || '#ORD-12345')
    .replace(/{totalAmount}/g, previewData?.totalAmount || '2,499')
    .replace(/{items}/g, previewData?.items || '2x Premium Product\n1x Accessory Kit')
    .replace(/{deliveryDate}/g, previewData?.deliveryDate || '25 Jan 2026')
    .replace(/{trackingNumber}/g, previewData?.trackingNumber || 'TRK123456789')
    .replace(/{shopName}/g, previewData?.shopName || 'Our Store')

  const VariableCard = ({ variable }: { variable: { key: string; description: string } }) => (
    <div
      key={variable.key}
      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all border-l-4 border-l-purple-500 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <code className="text-xs font-bold text-purple-600 dark:text-purple-400">
          {variable.key}
        </code>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={() => copyVariable(variable.key)}
        >
          {copiedVar === variable.key ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{variable.description}</p>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs h-8 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 border-purple-100 dark:border-purple-800"
        onClick={() => insertVariable(variable.key)}
      >
        Insert Variable
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden sm:rounded-2xl">
        <div className="flex flex-col h-full max-h-[95vh]">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  Customize {TEMPLATE_NAMES[templateType]}
                </DialogTitle>
                <DialogDescription className="hidden sm:block">
                  Personalize your WhatsApp template with dynamic variables.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="h-7 bg-muted/30">
                {characterCount} chars
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 border-b bg-muted/10">
              <TabsList className="h-12 w-full justify-start bg-transparent gap-6">
                <TabsTrigger value="editor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 gap-2">
                  <Layout className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="variables" className="md:hidden data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 gap-2">
                  <Info className="h-4 w-4" />
                  Variables
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                {/* Editor Section */}
                <div className="md:col-span-8 flex flex-col h-full border-r">
                  <TabsContent value="editor" className="flex-1 m-0 flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto">
                    <div className="flex-1 flex flex-col">
                      <Label htmlFor="message" className="sr-only">Message Template</Label>
                      <Textarea
                        id="message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="flex-1 min-h-[300px] md:min-h-full font-mono text-sm resize-none focus-visible:ring-purple-500 rounded-xl"
                        placeholder="Type your WhatsApp message template here..."
                      />
                    </div>

                    {/* Quick variables for mobile editor */}
                    <div className="space-y-2 md:hidden">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Insert</Label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_VARIABLES.slice(0, 6).map((v) => (
                          <Button
                            key={v.key}
                            variant="secondary"
                            size="sm"
                            className="h-8 text-[11px] rounded-full px-3"
                            onClick={() => insertVariable(v.key)}
                          >
                            {v.key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="md:block hidden flex-1 m-0 p-4 md:p-6 bg-muted/30 overflow-y-auto">
                    <div className="max-w-md mx-auto h-full flex flex-col">
                      <Label className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Live WhatsApp Preview
                      </Label>

                      {/* WhatsApp Phone Mockup */}
                      <div className="flex-1 bg-[#e5ddd5] dark:bg-zinc-900/80 rounded-2xl border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative min-h-[400px]">
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white p-3 flex items-center gap-2 shadow-md z-10">
                          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                            {(previewData?.shopName || 'O').charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{previewData?.shopName || 'Our Store'}</div>
                            <div className="text-[10px] opacity-80 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                              Online
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Content Area */}
                        <ScrollArea className="flex-1 p-4 relative bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:400px]">
                          <div className="flex flex-col space-y-4">
                            {/* Date info */}
                            <div className="self-center bg-sky-100/80 dark:bg-zinc-800/80 px-3 py-1 rounded-lg text-[10px] font-medium text-zinc-600 dark:text-zinc-400 shadow-sm backdrop-blur-sm">
                              TODAY
                            </div>

                            {/* Message Bubble */}
                            <div className="self-start max-w-[85%] bg-white dark:bg-[#1f2c34] p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-md relative text-sm border-l-0">
                              <div className="whitespace-pre-wrap leading-relaxed dark:text-zinc-200">
                                {renderedPreview}
                              </div>
                              <div className="text-[9px] text-zinc-400 mt-1 flex justify-end items-center gap-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <Check className="h-3 w-3 text-sky-500" />
                              </div>
                              {/* Bubble tail */}
                              <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white dark:border-t-[#1f2c34] border-l-[10px] border-l-transparent" />
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variables" className="md:hidden m-0 p-4 space-y-4 h-full overflow-y-auto">
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30 flex gap-3">
                        <Info className="h-5 w-5 text-purple-600 shrink-0" />
                        <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                          Tap <b>Insert</b> to add a variable to your message. These are placeholders that automatically fill with real customer or order data.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {AVAILABLE_VARIABLES.map((variable) => (
                          <VariableCard key={variable.key} variable={variable} />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </div>

                {/* Sidebar Section (Desktop) */}
                <div className="hidden md:block md:col-span-4 bg-muted/5 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        Dynamic Variables
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Insert these into your template.
                      </p>

                      <ScrollArea className="h-[430px] pr-3">
                        <div className="space-y-3">
                          {AVAILABLE_VARIABLES.map((variable) => (
                            <VariableCard key={variable.key} variable={variable} />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="p-4 rounded-xl border bg-card/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                        <Sparkles className="h-3 w-3" />
                        Quick Tips
                      </div>
                      <ul className="text-[11px] space-y-2 text-muted-foreground list-disc pl-3 leading-relaxed">
                        <li>Use *bold texts* for emphasis</li>
                        <li>Use _italic texts_ for styling</li>
                        <li>Keep messages clear and short</li>
                        <li>Add expressive emojis 💼</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>

          <DialogFooter className="p-6 border-t bg-muted/5 sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              {onReset && isModified && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={isSaving || isResetting}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  {isResetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Reset to Default</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={onClose} disabled={isSaving || isResetting}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isResetting || !isModified}
                className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Template
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
