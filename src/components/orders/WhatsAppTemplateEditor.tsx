'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles, RotateCcw, Copy, Check, MessageSquare, Info, Eye, EyeOff } from 'lucide-react'
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
  { key: '{customerName}', description: 'Full name', shortLabel: 'Name' },
  { key: '{firstName}', description: 'First name', shortLabel: 'First' },
  { key: '{orderNumber}', description: 'Order ID', shortLabel: 'Order#' },
  { key: '{totalAmount}', description: 'Total amount', shortLabel: 'Amount' },
  { key: '{items}', description: 'Product list', shortLabel: 'Items' },
  { key: '{deliveryDate}', description: 'Delivery date', shortLabel: 'Date' },
  { key: '{trackingNumber}', description: 'Tracking #', shortLabel: 'Track#' },
  { key: '{shopName}', description: 'Business name', shortLabel: 'Shop' },
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
  const [showPreview, setShowPreview] = useState(true)

  // Ref for the textarea to track cursor position
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cursorPosRef = useRef<number>(0)

  // Track cursor position on every interaction
  const updateCursorPos = useCallback(() => {
    if (textareaRef.current) {
      cursorPosRef.current = textareaRef.current.selectionStart
    }
  }, [])

  // Reset when template changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setCustomMessage(currentMessage || defaultMessage)
      cursorPosRef.current = 0
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

  // INSERT AT CURSOR POSITION — the core fix
  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      // Fallback: append to end
      setCustomMessage((prev) => prev + variable)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = customMessage.substring(0, start)
    const after = customMessage.substring(end)
    const newMessage = before + variable + after
    const newCursorPos = start + variable.length

    setCustomMessage(newMessage)

    // Restore cursor position AFTER React re-render
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      cursorPosRef.current = newCursorPos
    })

    toast.success(`Inserted ${variable}`)
  }, [customMessage])

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 2000)
    toast.success('Copied!')
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden sm:rounded-2xl">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* HEADER */}
          <DialogHeader className="px-5 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/20">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base">
                    {TEMPLATE_NAMES[templateType]}
                  </DialogTitle>
                  <DialogDescription className="text-xs hidden sm:block">
                    Edit template with dynamic variables
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs tabular-nums h-6 px-2">
                  {characterCount} chars
                </Badge>
                {isModified && (
                  <Badge className="text-[10px] h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" variant="outline">
                    Modified
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* MAIN CONTENT — Side by Side on desktop, stacked on mobile */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full" style={{ minHeight: 0 }}>

              {/* LEFT: Editor + Variables */}
              <div className="flex flex-col border-r overflow-hidden">
                {/* Variable pills - compact inline row */}
                <div className="px-4 py-2.5 border-b bg-muted/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Insert Variable</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertVariable(v.key)}
                        title={`${v.key} — ${v.description}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                          bg-purple-50 text-purple-700 border border-purple-200
                          hover:bg-purple-100 hover:border-purple-300 hover:shadow-sm
                          dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700
                          dark:hover:bg-purple-900/40
                          transition-all cursor-pointer active:scale-95"
                      >
                        <span className="font-mono text-[10px]">{v.key}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyVariable(v.key); }}
                          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                          title="Copy variable"
                        >
                          {copiedVar === v.key ? (
                            <Check className="h-2.5 w-2.5 text-green-600" />
                          ) : (
                            <Copy className="h-2.5 w-2.5" />
                          )}
                        </button>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor textarea */}
                <div className="flex-1 p-4 flex flex-col min-h-0">
                  <Label htmlFor="message" className="sr-only">Message Template</Label>
                  <Textarea
                    ref={textareaRef}
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onSelect={updateCursorPos}
                    onClick={updateCursorPos}
                    onKeyUp={updateCursorPos}
                    className="flex-1 min-h-[200px] lg:min-h-0 font-mono text-sm resize-none
                      focus-visible:ring-purple-500 rounded-xl border-2
                      transition-colors"
                    placeholder="Type your WhatsApp message template here..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground">
                      Use <code className="px-1 py-0.5 rounded bg-muted text-[10px]">*bold*</code>{' '}
                      <code className="px-1 py-0.5 rounded bg-muted text-[10px]">_italic_</code>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden h-7 text-xs gap-1"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                  </div>
                </div>
              </div>

              {/* RIGHT: Live Preview — always visible on desktop, toggleable on mobile */}
              <div className={`flex flex-col overflow-hidden bg-muted/20 ${showPreview ? '' : 'hidden lg:flex'}`}>
                <div className="px-4 py-2.5 border-b flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold">Live Preview</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {/* WhatsApp Phone Mockup — compact and beautiful */}
                  <div className="max-w-sm mx-auto">
                    <div className="bg-[#e5ddd5] dark:bg-zinc-900/80 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden">
                      {/* WhatsApp Header */}
                      <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {(previewData?.shopName || 'O').charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold leading-tight">{previewData?.shopName || 'Our Store'}</div>
                          <div className="text-[10px] opacity-80 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Online
                          </div>
                        </div>
                      </div>

                      {/* Chat area with background pattern */}
                      <div className="p-3 min-h-[250px] lg:min-h-[350px] bg-[#dcd5c4] dark:bg-zinc-900/60 relative">
                        {/* Date chip */}
                        <div className="flex justify-center mb-3">
                          <span className="bg-white/80 dark:bg-zinc-800/80 px-3 py-0.5 rounded-md text-[10px] font-medium text-zinc-600 dark:text-zinc-400 shadow-sm">
                            TODAY
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div className="max-w-[90%] bg-white dark:bg-[#1f2c34] p-2.5 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-md relative">
                          {/* Bubble tail */}
                          <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-white dark:border-t-[#1f2c34] border-l-[8px] border-l-transparent" />
                          <div className="whitespace-pre-wrap text-[13px] leading-relaxed dark:text-zinc-200 break-words">
                            {renderedPreview}
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-1 flex justify-end items-center gap-0.5">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <Check className="h-3 w-3 text-sky-500" />
                          </div>
                        </div>
                      </div>

                      {/* Input bar mockup */}
                      <div className="bg-[#f0f0f0] dark:bg-zinc-800 px-3 py-2 flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-zinc-700 rounded-full px-3 py-1.5 text-xs text-zinc-400">
                          Type a message
                        </div>
                        <div className="h-7 w-7 rounded-full bg-[#075e54] flex items-center justify-center">
                          <svg className="h-3.5 w-3.5 text-white transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Info hint below phone */}
                    <div className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                          Variables like <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-800/30 px-1 rounded">{'{customerName}'}</code> will be replaced with real data when the message is sent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="px-5 py-3 border-t bg-muted/5 sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              {onReset && isModified && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving || isResetting}
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  {isResetting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Reset to Default</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onClose} disabled={isSaving || isResetting}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isResetting || !isModified}
                className="flex-1 sm:flex-none gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
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
