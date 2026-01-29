// components/products/WhatsAppShare.tsx
'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, Download, Copy, Check } from 'lucide-react'
import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useEffect } from 'react'

type Product = {
  id: string
  name: string
  description?: string
  image_url: string | null
  images?: string[]
  cost_price: number
  selling_price: number
  stock_quantity?: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  category?: string
  sku?: string
}

interface WhatsAppShareProps {
  product: Product
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function WhatsAppShare({ product, variant = 'outline', size = 'sm' }: WhatsAppShareProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch customers when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers()
    }
  }, [open])

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .not('phone', 'is', null)
        .order('name')
        .limit(100)

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setPhoneNumber(customer.phone)
    }
  }

  // Get all available images
  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  const formatProductMessage = () => {
    const stockStatus = product.stock_status === 'in_stock'
      ? 'In Stock'
      : product.stock_status === 'low_stock'
        ? 'Low Stock'
        : 'Out of Stock'

    let message = `*${product.name}*\n`
    message += `━━━━━━━━━━━━━━━━━━━\n\n`

    if (product.description) {
      message += `${product.description}\n\n`
    }

    message += `*Price:* ₹${product.selling_price.toLocaleString()}\n`
    message += `*Availability:* ${stockStatus}\n`

    if (product.category) {
      message += `*Category:* ${product.category}\n`
    }

    // Add images
    if (product.images && product.images.length > 0) {
      message += `\n *Product Images:*\n`
      product.images.forEach((img, idx) => {
        message += `${idx + 1}. ${img}\n`
      })
    } else if (product.image_url) {
      message += `\n *Product Image:*\n${product.image_url}\n`
    }

    message += `\n━━━━━━━━━━━━━━━━━━━\n`
    message += ` *Interested? Contact us to order!*`

    return message
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatProductMessage())
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Message copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy message',
        variant: 'destructive',
      })
    }
  }

  const downloadProductCard = async () => {
    setDownloading(true)
    try {
      // Get the current image URL
      const imageUrl = allImages[selectedImageIndex]

      if (!imageUrl) {
        toast({
          title: 'No Image',
          description: 'No image available to download',
          variant: 'destructive',
        })
        setDownloading(false)
        return
      }

      // Fetch the image
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // Create download link
      const link = document.createElement('a')
      const imageName = allImages.length > 1
        ? `${product.name.replace(/[^a-z0-9]/gi, '_')}_image_${selectedImageIndex + 1}.png`
        : `${product.name.replace(/[^a-z0-9]/gi, '_')}.png`

      link.download = imageName
      link.href = URL.createObjectURL(blob)
      link.click()

      // Clean up
      URL.revokeObjectURL(link.href)

      toast({
        title: 'Downloaded!',
        description: `Product image ${allImages.length > 1 ? `${selectedImageIndex + 1}` : ''} saved successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Could not download image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  const shareToWhatsApp = () => {
    if (!phoneNumber) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a phone number to continue',
        variant: 'destructive',
      })
      return
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '')

    if (cleanNumber.replace('+', '').length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code',
        variant: 'destructive',
      })
      return
    }

    const message = formatProductMessage()
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')

    toast({
      title: 'Opening WhatsApp...',
      description: 'Message will be sent with product details and images.',
    })

    setPhoneNumber('')
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+\-\s()]/g, '')
    setPhoneNumber(cleaned)
  }

  const getStockBadge = () => {
    switch (product.stock_status) {
      case 'in_stock':
        return <Badge className="bg-green-500 text-white">In Stock</Badge>
      case 'low_stock':
        return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>
      case 'out_of_stock':
        return <Badge className="bg-red-500 text-white">Out of Stock</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Share Product on WhatsApp
          </DialogTitle>
          <DialogDescription>
            Share product details with your customers
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="gap-2">
              <Download className="h-4 w-4" />
              Image Card
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Text Message
            </TabsTrigger>
          </TabsList>

          {/* Image Card Tab */}
          <TabsContent value="image" className="space-y-4">
            {/* Image Selector for Multiple Images */}
            {allImages.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Image to Download</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                      />
                      {selectedImageIndex === idx && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: Image {selectedImageIndex + 1} of {allImages.length}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-base font-semibold">Product Card Preview</Label>

              {/* Downloadable Product Card */}
              <div
                ref={cardRef}
                className="bg-white p-6 rounded-lg border-2 space-y-4 w-full max-w-[500px] mx-auto"
              >
                {/* Header */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                  )}
                </div>

                {/* Product Image - Show selected image */}
                {allImages.length > 0 && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={allImages[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* Price & Status */}
                <div className="space-y-3 py-4 border-t border-b">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Price</p>
                    <p className="text-3xl font-bold text-blue-600">₹{product.selling_price.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Availability</p>
                      {product.stock_status === 'in_stock' && (
                        <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                          ✓ In Stock
                        </span>
                      )}
                      {product.stock_status === 'low_stock' && (
                        <span className="inline-block mt-1 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                          ⚠ Limited Stock
                        </span>
                      )}
                      {product.stock_status === 'out_of_stock' && (
                        <span className="inline-block mt-1 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                          ✗ Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                {product.category && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">📦 Category: {product.category}</span>
                  </div>
                )}

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg text-center border border-green-100">
                  <p className="text-base font-bold text-green-700">
                    📱 Contact us to order now!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={downloadProductCard}
                disabled={downloading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-bounce" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download {allImages.length > 1 ? `Image ${selectedImageIndex + 1}` : 'Image'}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {allImages.length > 1
                  ? `💡 Downloads clean product image without text overlays`
                  : `💡 Downloads the product image only, without title or price`
                }
              </p>
            </div>
          </TabsContent>

          {/* Text Message Tab */}
          <TabsContent value="text" className="space-y-4">
            {/* Customer Selector + Phone Number Input */}
            <div className="space-y-4">
              {/* Customer Dropdown */}
              <div className="space-y-3">
                <Label htmlFor="customer" className="text-base font-semibold">
                  Select Customer (Optional)
                </Label>
                {customers.length === 0 && !loadingCustomers ? (
                  <p className="text-xs text-muted-foreground p-4 border rounded-md text-center">No customers found with phone numbers.</p>
                ) : (
                  <SearchableSelect
                    options={customers.map((c): SearchableSelectOption => ({
                      value: c.id,
                      label: c.name,
                      subtitle: c.phone,
                    }))}
                    value={selectedCustomer}
                    onValueChange={handleCustomerSelect}
                    placeholder={loadingCustomers ? "Loading customers..." : "Choose from your customers"}
                    searchPlaceholder="Search customers..."
                    emptyMessage="No customers found."
                    disabled={loadingCustomers}
                  />
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or enter manually</span>
                </div>
              </div>

              {/* Manual Phone Number Input */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g., +919876543210"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      shareToWhatsApp()
                    }
                  }}
                  className="text-base h-12"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Include country code (e.g., +91 for India)
                </p>
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Message Preview</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-background border rounded-lg p-4 max-h-[250px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {formatProductMessage()}
                </pre>
              </div>
            </div>

            <Button
              onClick={shareToWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}