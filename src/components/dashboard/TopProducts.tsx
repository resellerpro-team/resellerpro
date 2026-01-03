
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, TrendingDown } from 'lucide-react'
// import { getTopProducts, type TopProduct } from '@/app/dashboard/action'

export function TopProductsCard({ topProducts }: { topProducts: import('@/app/(dashboard)/dashboard/action').TopProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performers this month</CardDescription>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
          <div className="space-y-4">
            {topProducts.map((product) => (
              <TopProductItem
                key={product.id}
                name={product.name}
                sold={product.sold}
                revenue={`₹${product.revenue.toLocaleString('en-IN')}`}
                profit={`₹${product.profit.toLocaleString('en-IN')}`}
                trend={product.trend}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No product sales yet</p>
            <p className="text-sm">Add products and create orders to see top sellers</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopProductItem({
  name,
  sold,
  revenue,
  profit,
  trend,
}: {
  name: string
  sold: number
  revenue: string
  profit: string
  trend: 'up' | 'down'
}) {
  return (
    <div className="flex items-center gap-4 flex-nowrap">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{name}</p>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className=" h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{sold} sold</span>
          <span className='hidden sm:flex'>Revenue: {revenue}</span>
          <span className="text-green-600 font-medium">Profit: {profit}</span>
        </div>
      </div>
    </div>
  )
}