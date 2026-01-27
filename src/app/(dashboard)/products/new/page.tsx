'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Upload, X, Loader2, WifiOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue'
import { RequireVerification } from '@/components/shared/RequireVerification'


export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const { queueAction, isOnline } = useOfflineQueue()

  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [sku, setSku] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('10')
  const [stockStatus, setStockStatus] = useState('in_stock')

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and one decimal point, prevent negative numbers and other symbols
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCostPrice(value)
      // Auto-fill selling price with the same value
      setSellingPrice(value)
    }
  }

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSellingPrice(value)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload maximum 5 images',
        variant: 'destructive',
      })
      return
    }

    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: 'Files too large',
        description: 'Each image must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    setImages([...images, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const uploadImages = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(urlData.publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name) {
      toast({
        title: 'Error',
        description: 'Product name is required',
        variant: 'destructive',
      })
      return
    }

    if (!costPrice || !sellingPrice) {
      toast({
        title: 'Error',
        description: 'Cost price and selling price are required',
        variant: 'destructive',
      })
      return
    }

    if (parseFloat(sellingPrice) < parseFloat(costPrice)) {
      toast({
        title: 'Error',
        description: 'Selling price cannot be less than cost price',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // If offline, queue the action
      if (!isOnline) {
        const payload = {
          name,
          description: description || null,
          category: category || null,
          sku: sku || null,
          cost_price: parseFloat(costPrice),
          selling_price: parseFloat(sellingPrice),
          stock_quantity: parseInt(stockQuantity),
          stock_status: stockStatus,
        }

        queueAction('CREATE_PRODUCT', payload)

        if (images.length > 0) {
          toast({
            title: 'Product queued (Text only) 📌',
            description: 'Images cannot be saved while offline. Please edit the product later to add images.',
            duration: 5000,
          })
        } else {
          toast({
            title: 'Product queued for sync 📌',
            description: 'This will sync automatically when you\'re back online.',
            duration: 3000,
          })
        }

        setTimeout(() => {
          router.push('/products')
        }, 500)
        return
      }

      // Get current user (Online path)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Upload images
      const imageUrls = images.length > 0 ? await uploadImages(user.id) : []

      // Create product in database
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          category: category || null,
          sku: sku || null,
          cost_price: parseFloat(costPrice),
          selling_price: parseFloat(sellingPrice),
          stock_quantity: parseInt(stockQuantity),
          stock_status: stockStatus,
          image_url: imageUrls[0] || null,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)

        // Cleanup uploaded images
        for (const url of imageUrls) {
          const path = url.split('/product-images/')[1]
          if (path) {
            await supabase.storage.from('product-images').remove([path])
          }
        }

        toast({
          title: 'Error',
          description: 'Failed to create product: ' + error.message,
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      toast({
        title: 'Success',
        description: `Product "${product.name}" created successfully!`,
      })

      router.push('/products')
      router.refresh()
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <RequireVerification autoOpen={true}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">Fill in the details to add a new product to your catalog.</p>
          </div>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">You're offline</p>
              <p className="text-xs text-amber-700">Product will be queued and synced when you're back online.
                <span className="font-semibold"> Note: Images cannot be saved while offline.</span>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Wireless Earbuds"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Images Upload */}
              <div className="space-y-2">
                <Label>Product Images (up to 5, max 5MB each)</Label>
                <div className="grid grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  First image will be the main product image. Max 5 images, 5MB each.
                </p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price (₹) *</Label>
                  <Input
                    id="cost_price"
                    type="text"
                    inputMode="decimal"
                    value={costPrice}
                    onChange={handleCostPriceChange}
                    placeholder="What you pay"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Selling Price (₹) *</Label>
                  <Input
                    id="selling_price"
                    type="text"
                    inputMode="decimal"
                    value={sellingPrice}
                    onChange={handleSellingPriceChange}
                    placeholder="What customer pays"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Category and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Electronics"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Available units"
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select
                    value={stockStatus}
                    onValueChange={setStockStatus}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g., WE-BLK-001"
                  disabled={isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating product...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Product
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </RequireVerification>
  )
}