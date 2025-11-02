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
import { MoreVertical, Edit, Eye, Trash, Package } from 'lucide-react'

type Product = {
  id: string
  name: string
  image_url: string | null
  cost_price: number
  selling_price: number
  stock_quantity?: number
  stock_status: string
  category?: string
  sku?: string
}

export function ProductRow({ product }: { product: Product }) {
  const profit = product.selling_price - product.cost_price
  const profitMargin = ((profit / product.selling_price) * 100).toFixed(1)

  const stockColors = {
    in_stock: 'bg-green-500',
    low_stock: 'bg-yellow-500',
    out_of_stock: 'bg-red-500',
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
      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[120px]">
        <div className="text-sm text-muted-foreground">
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
          className={`${
            stockColors[product.stock_status as keyof typeof stockColors]
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
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}