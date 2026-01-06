'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface OrderItem {
  product_id: string
  product_name: string
  subtotal: string
  products?: {
    category?: string
  }
}

interface Order {
  order_items?: OrderItem[]
}

interface RevenueByCategoryChartProps {
  orders: Order[]
}

export function RevenueByCategoryChart({ orders }: RevenueByCategoryChartProps) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return []

    const categoryRevenue: Record<string, number> = {}

    orders.forEach(order => {
      order.order_items?.forEach((item: OrderItem) => {
        const category = item.products?.category || 'Uncategorized'
        const revenue = parseFloat(item.subtotal || '0')

        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0
        }
        categoryRevenue[category] += revenue
      })
    })

    return Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category: category.length > 15 ? category.substring(0, 15) + '...' : category,
        revenue: Math.round(revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 categories
  }, [orders])

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No category data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
        />
        <Legend />
        <Bar
          dataKey="revenue"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
          name="Revenue"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}