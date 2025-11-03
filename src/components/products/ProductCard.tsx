// components/products/ProductCard.tsx
import Link from 'next/link'
import Image from 'next/image'
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

export function ProductCard({ product }: { product: Product }) {
  const profit = product.selling_price - product.cost_price
  const profitMargin = ((profit / product.selling_price) * 100).toFixed(1)

  const stockColors = {
    in_stock: 'bg-green-500',
    low_stock: 'bg-yellow-500',
    out_of_stock: 'bg-red-500',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-muted">
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
            className={`absolute top-3 left-3 ${
              stockColors[product.stock_status as keyof typeof stockColors]
            } text-white border-0`}
          >
            {product.stock_status.replace('_', ' ')}
          </Badge>

          {/* Quick Actions Menu */}
          <div 
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
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
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Low Stock Warning */}
          {product.stock_status === 'low_stock' && (
            <div className="absolute bottom-3 left-3 right-3 bg-yellow-500/90 text-white text-xs font-medium px-2 py-1.5 rounded backdrop-blur-sm">
              Only {product.stock_quantity} left in stock!
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock_status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge className="bg-red-500 text-white text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

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
                <span className="text-xs text-muted-foreground font-mono">
                  {product.sku}
                </span>
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
                  <div className="font-bold text-green-600">
                    ₹{profit.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600/80">
                    {profitMargin}% margin
                  </div>
                </div>
              </div>

              {/* Stock Info */}
              {product.stock_quantity !== undefined && (
                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-medium">
                    {product.stock_quantity} units
                  </span>
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
  )
}