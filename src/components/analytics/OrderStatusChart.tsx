'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Cell } from 'recharts'

interface Order {
  status: string
}

interface OrderStatusChartProps {
  orders: Order[]
}

const STATUS_COLORS = {
  pending: 'hsl(48, 96%, 53%)', // Yellow
  processing: 'hsl(217, 91%, 60%)', // Blue
  shipped: 'hsl(271, 91%, 65%)', // Purple
  delivered: 'hsl(142, 76%, 36%)', // Green
  cancelled: 'hsl(0, 84%, 60%)', // Red
}

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return []

    const statusCount: Record<string, number> = {}
    
    orders.forEach(order => {
      const status = order.status || 'pending'
      if (!statusCount[status]) {
        statusCount[status] = 0
      }
      statusCount[status]++
    })
    
    return STATUS_ORDER
      .filter(status => statusCount[status] > 0)
      .map(status => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: statusCount[status],
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
      }))
  }, [orders])

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No order status data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="status" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: any) => [value, 'Orders']}
        />
        <Legend />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Order Count">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}