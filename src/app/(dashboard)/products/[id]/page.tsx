export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Package } from 'lucide-react'
import Link from 'next/link'
import ImageGallery from './ImageGallery'

export default async function ProductDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params 

  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) return notFound()

  const profit = product.selling_price - product.cost_price
  const profitMargin = ((profit / product.selling_price) * 100).toFixed(1)

  // Get all images (from images array or fallback to image_url)
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
    ? [product.image_url] 
    : []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">
            {product.sku ? `SKU: ${product.sku}` : `ID: ${id}`}
          </p>
        </div>
        <Button asChild>
          <Link href={`/products/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          {allImages.length > 0 ? (
            <ImageGallery images={allImages} productName={product.name} />
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Package className="h-32 w-32 text-muted-foreground/20" />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category || 'Uncategorized'}</Badge>
              <Badge
                className={
                  product.stock_status === 'in_stock'
                    ? 'bg-green-500 hover:bg-green-600'
                    : product.stock_status === 'low_stock'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-red-500 hover:bg-red-600'
                }
              >
                {product.stock_status.replace('_', ' ')}
              </Badge>
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="text-lg font-semibold">₹{product.cost_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selling Price</p>
                <p className="text-lg font-semibold text-primary">₹{product.selling_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit per Unit</p>
                <p className="text-lg font-semibold text-green-600">₹{profit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-lg font-semibold text-green-600">{profitMargin}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Quantity</p>
                <p className="text-lg font-semibold">{product.stock_quantity || 0} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold">
                  ₹{((product.stock_quantity || 0) * product.selling_price).toLocaleString()}
                </p>
              </div>
            </div>

            {product.sku && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-mono text-sm">{product.sku}</p>
              </div>
            )}

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>Created: {new Date(product.created_at).toLocaleDateString()}</p>
              {product.updated_at && (
                <p>Last updated: {new Date(product.updated_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}