'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Edit, Eye, Trash, Copy, Package, Loader2, AlertTriangle } from 'lucide-react'
import { WhatsAppShare } from './WhatsAppShare'
import { useToast } from '@/hooks/use-toast'

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
  created_at?: string
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabase = createClient()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const profit = product.selling_price - product.cost_price
  const profitMargin = ((profit / product.selling_price) * 100).toFixed(1)

  const stockColors = {
    in_stock: 'bg-green-500',
    low_stock: 'bg-yellow-500',
    out_of_stock: 'bg-red-500',
  }

  // DELETE HANDLER
  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to delete products',
          variant: 'destructive',
        })
        setIsDeleting(false)
        setShowDeleteDialog(false)
        return
      }

      // Get all images to delete
      const imagesToDelete: string[] = []

      if (product.images && product.images.length > 0) {
        imagesToDelete.push(...product.images)
      } else if (product.image_url) {
        imagesToDelete.push(product.image_url)
      }

      // Delete images from storage
      for (const imageUrl of imagesToDelete) {
        try {
          const path = imageUrl.split('/product-images/')[1]
          if (path) {
            const { error: storageError } = await supabase.storage
              .from('product-images')
              .remove([path])

            if (storageError) {
              console.error('Error deleting image:', storageError)
            }
          }
        } catch (error) {
          console.error('Error parsing image path:', error)
        }
      }

      // Delete product from database
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('user_id', user.id) // Security: only delete own products

      if (dbError) {
        console.error('Database error:', dbError)
        toast({
          title: 'Delete Failed',
          description: dbError.message || 'Failed to delete product',
          variant: 'destructive',
        })
        setIsDeleting(false)
        setShowDeleteDialog(false)
        return
      }

      // Success
      toast({
        title: 'Product Deleted ✓',
        description: `"${product.name}" has been permanently deleted`,
      })

      setShowDeleteDialog(false)
      router.refresh() // Refresh the page to show updated list
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // DUPLICATE HANDLER (Optional)
  const handleDuplicate = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        return
      }

      // Create duplicate with "(Copy)" suffix
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: `${product.name} (Copy)`,
          description: product.description,
          category: product.category,
          sku: product.sku ? `${product.sku}-COPY` : null,
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          stock_quantity: product.stock_quantity || 0,
          stock_status: product.stock_status,
          image_url: product.image_url,
          images: product.images,
        })
        .select()

      if (error) {
        toast({
          title: 'Duplicate Failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Product Duplicated ✓',
        description: `Created a copy of "${product.name}"`,
      })

      // Invalidate react-query cache to refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ['products'] })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative aspect-square bg-muted">
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/20" />
              </div>
            )}

            {/* Stock Badge */}
            <Badge
              className={`absolute top-3 left-3 ${stockColors[product.stock_status as keyof typeof stockColors]
                } text-white border-0 z-10`}
            >
              {product.stock_status.replace('_', ' ')}
            </Badge>

            {/* Low Stock Warning */}
            {product.stock_status === 'low_stock' && (
              <div className="absolute bottom-3 left-3 right-3 bg-yellow-500/90 text-white text-xs font-medium px-2 py-1.5 rounded backdrop-blur-sm z-10">
                Only {product.stock_quantity} left in stock!
              </div>
            )}

            {/* Out of Stock Overlay */}
            {product.stock_status === 'out_of_stock' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <Badge className="bg-red-500 text-white text-sm">Out of Stock</Badge>
              </div>
            )}
          </Link>

          {/* Quick Actions Menu - NOW OUTSIDE LINK */}
          <div
            className="absolute top-3 right-3 lg:opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/products/${product.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/products/${product.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* DELETE BUTTON WITH HANDLER */}
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <Link href={`/products/${product.id}`}>
            <div className="space-y-3">
              {/* Category & SKU */}
              <div className="flex items-center justify-between">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
                {product.sku && (
                  <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
                )}
              </div>

              {/* Product Name */}
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Pricing Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">₹{product.cost_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-lg text-primary">
                    ₹{product.selling_price.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Profit:</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{profit.toFixed(2)}</div>
                    <div className="text-xs text-green-600/80">{profitMargin}% margin</div>
                  </div>
                </div>

                {/* Stock Info */}
                {product.stock_quantity !== undefined && (
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium">{product.stock_quantity} units</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </CardContent>

        {/* WhatsApp Share Button */}
        <CardFooter className="p-4 pt-0">
          <WhatsAppShare product={product} variant="default" size="default" />
        </CardFooter>
      </Card>

      {/* DELETE CONFIRMATION DIALOG - FIXED */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Are you sure you want to delete <strong>"{product.name}"</strong>?
                </p>

                <p className="mt-4">This will permanently delete:</p>

                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Product information</li>
                  <li>All product images</li>
                  <li>Sales history (if any)</li>
                </ul>

                <p className="mt-4 text-destructive font-semibold">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Forever
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
