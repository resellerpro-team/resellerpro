'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, Upload, X, Loader2, Trash2, AlertTriangle, Lock } from 'lucide-react'
import Image from 'next/image'
<<<<<<< HEAD
import Link from 'next/link'
=======
import { useQueryClient } from '@tanstack/react-query'
>>>>>>> 7704756db6d8889b3ccc6f260bc61f0f0e0ed6c6
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get existing images
  const existingImages = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [keepExistingImages, setKeepExistingImages] = useState<string[]>(existingImages)

  // Form state
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [category, setCategory] = useState(product.category || '')
  const [sku, setSku] = useState(product.sku || '')
  const [costPrice, setCostPrice] = useState(product.cost_price.toString())
  const [sellingPrice, setSellingPrice] = useState(product.selling_price.toString())
  const [stockQuantity, setStockQuantity] = useState(product.stock_quantity?.toString() || '0')
  const [stockStatus, setStockStatus] = useState(product.stock_status)

  // Calculate profit
  const profit = parseFloat(sellingPrice || '0') - parseFloat(costPrice || '0')
  const profitMargin = sellingPrice ? ((profit / parseFloat(sellingPrice)) * 100).toFixed(1) : '0'

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const totalImages = keepExistingImages.length + images.length + files.length
    if (totalImages > 5) {
      toast({
        title: 'Too many images',
        description: `Maximum 5 images allowed. You have ${keepExistingImages.length} existing image(s).`,
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

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageUrl: string) => {
    if (keepExistingImages.length === 1 && images.length === 0) {
      toast({
        title: 'Cannot remove last image',
        description: 'Please add at least one new image before removing the last existing image',
        variant: 'destructive',
      })
      return
    }
    setKeepExistingImages(keepExistingImages.filter(url => url !== imageUrl))
  }

  const uploadNewImages = async (userId: string): Promise<string[]> => {
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

  const deleteUnusedImages = async () => {
    const removedImages = existingImages.filter((url: string) => !keepExistingImages.includes(url))

    for (const url of removedImages) {
      try {
        const path = url.split('/product-images/')[1]
        if (path) {
          await supabase.storage.from('product-images').remove([path])
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive',
      })
      return
    }

    if (!costPrice || !sellingPrice) {
      toast({
        title: 'Validation Error',
        description: 'Cost price and selling price are required',
        variant: 'destructive',
      })
      return
    }

    const cost = parseFloat(costPrice)
    const selling = parseFloat(sellingPrice)

    if (cost < 0 || selling < 0) {
      toast({
        title: 'Validation Error',
        description: 'Prices cannot be negative',
        variant: 'destructive',
      })
      return
    }

    if (selling < cost) {
      toast({
        title: 'Warning',
        description: 'Selling price is less than cost price. You will have a negative profit margin.',
      })
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to edit products',
          variant: 'destructive',

        })
        setIsLoading(false)
        return
      }

      // Upload new images
      const newImageUrls = images.length > 0 ? await uploadNewImages(user.id) : []

      // Combine existing and new images
      const allImages = [...keepExistingImages, ...newImageUrls]

      if (allImages.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Product must have at least one image',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Update product in database
      const { error } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          sku: sku.trim() || null,
          cost_price: cost,
          selling_price: selling,
          stock_quantity: parseInt(stockQuantity),
          stock_status: stockStatus,
          image_url: allImages[0],
          images: allImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)

      if (error) {
        console.error('Database error:', error)
        toast({
          title: 'Update Failed',
          description: error.message || 'Failed to update product',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Delete removed images from storage
      await deleteUnusedImages()

      toast({
        title: 'Success! 🎉',
        description: `"${name}" has been updated successfully`,
      })

<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', product.id] })
=======
      // Invalidate products query
      queryClient.invalidateQueries({ queryKey: ['products'] })

>>>>>>> 7704756db6d8889b3ccc6f260bc61f0f0e0ed6c6
      router.push(`/products/${product.id}`)
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

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        setIsDeleting(false)
        return
      }

      // Delete all product images from storage
      for (const imageUrl of existingImages) {
        try {
          const path = imageUrl.split('/product-images/')[1]
          if (path) {
            await supabase.storage.from('product-images').remove([path])
          }
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }

      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) {
        console.error('Database error:', error)
        toast({
          title: 'Delete Failed',
          description: error.message || 'Failed to delete product',
          variant: 'destructive',
        })
        setIsDeleting(false)
        return
      }

      toast({
        title: 'Product Deleted',
        description: `"${product.name}" has been permanently deleted`,
      })

<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['products'] })
=======
      // Invalidate products query
      queryClient.invalidateQueries({ queryKey: ['products'] })

>>>>>>> 7704756db6d8889b3ccc6f260bc61f0f0e0ed6c6
      router.push('/products')
      router.refresh()
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
      setIsDeleting(false)
    }
  }

  const totalImages = keepExistingImages.length + images.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wireless Earbuds Pro"
              required
              disabled={isLoading}
            />
          </div>

          {/* Images Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Product Images <span className="text-destructive">*</span>
              </Label>
              <span className="text-sm text-muted-foreground">
                {totalImages} / 5 images
              </span>
            </div>

            {/* Existing Images */}
            {keepExistingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {keepExistingImages.map((imageUrl, index) => (
                    <div key={imageUrl} className="relative aspect-square group">
                      <Image
                        src={imageUrl}
                        alt={`Current ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imageUrl)}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">New Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square group">
                      <Image
                        src={preview}
                        alt={`New ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border-2 border-dashed border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Images */}
            {totalImages < 5 ? (
              <label className="flex items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors p-6 max-w-[200px]">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Add Image
                  </span>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Max 5MB
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            ) : (
              <div
                className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors p-6 max-w-[200px]"
                onClick={() => {
                  toast({
                    title: 'Limit Reached 🔒',
                    description: `You can only add up to 5 images per product. Upgrade to Business plan for more!`,
                    variant: 'default',
                    action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
                  })
                }}
              >
                <Lock className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <span className="text-sm font-medium text-muted-foreground/60">
                  Limit Reached
                </span>
                <span className="text-xs text-primary font-medium mt-1">
                  Upgrade Plan
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-primary mt-0.5">ℹ</span>
              <span>First image is the main product image. Supports JPG, PNG, WebP. Max 5 images, 5MB each.</span>
            </p>
          </div>

          {/* Pricing with Preview */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">
                  Cost Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="What you paid"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price">
                  Selling Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="What customer pays"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Profit Preview */}
            {costPrice && sellingPrice && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Profit per Unit</p>
                  <p className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                  <p className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category, Stock, and Status */}
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
              <Label htmlFor="stock_quantity">
                Stock Quantity <span className="text-destructive">*</span>
              </Label>
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
                  <SelectItem value="in_stock">✓ In Stock</SelectItem>
                  <SelectItem value="low_stock">⚠ Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">✗ Out of Stock</SelectItem>
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
              placeholder="Describe your product features, specifications, condition..."
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
            <p className="text-xs text-muted-foreground">
              Optional unique identifier for inventory tracking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Product
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>"{product.name}"</strong> and all its images.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}