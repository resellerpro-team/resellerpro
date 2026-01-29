// components/products/ProductRow.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { MoreVertical, Edit, Eye, Trash, Copy, Package } from 'lucide-react'
import { WhatsAppShare } from './WhatsAppShare'

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

export function ProductRow({ product }: { product: Product }) {
  const profit = product.selling_price - product.cost_price
  const profitMargin = ((profit / product.selling_price) * 100).toFixed(1)

  const stockColors = {
    in_stock: 'bg-green-500',
    low_stock: 'bg-yellow-500',
    out_of_stock: 'bg-red-500',
  }

  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // DUPLICATE HANDLER
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

  // DELETE HANDLER
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Product Deleted',
        description: `"${product.name}" has been removed.`,
      })

      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products-stats'] }) // Refresh stats too
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/20" />
            </div>
          )}
        </div>
      </Link>

      {/* Name & Category */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
          {product.sku && (
            <span className="text-xs text-muted-foreground font-mono">
              SKU: {product.sku}
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex flex-col items-end gap-1 min-w-[80px] sm:min-w-[120px]">
        <div className="text-sm text-muted-foreground hidden sm:block">
          Cost: ₹{product.cost_price.toFixed(2)}
        </div>
        <div className="text-lg font-semibold text-primary">
          ₹{product.selling_price.toFixed(2)}
        </div>
      </div>

      {/* Profit */}
      <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
        <div className="font-semibold text-green-600">
          ₹{profit.toFixed(2)}
        </div>
        <div className="text-xs text-green-600/80">
          {profitMargin}% margin
        </div>
      </div>

      {/* Stock */}
      <div className="hidden lg:flex flex-col items-center gap-1 min-w-[100px]">
        <Badge
          className={`${stockColors[product.stock_status as keyof typeof stockColors]
            } text-white border-0`}
        >
          {product.stock_status.replace('_', ' ')}
        </Badge>
        {product.stock_quantity !== undefined && (
          <span className="text-xs text-muted-foreground">
            {product.stock_quantity} units
          </span>
        )}
      </div>

      {/* WhatsApp Share Button */}
      <div className="flex-shrink-0">
        <WhatsAppShare product={product} variant="outline" size="sm" />
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
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
          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}