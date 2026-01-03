'use client'

import { useMemo } from 'react'
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts'

interface Order {
  payment_status: string
  total_amount: string
}

interface PaymentStatusChartProps {
  orders: Order[]
}

const COLORS = {
  paid: 'hsl(142, 76%, 36%)', // Green
  unpaid: 'hsl(48, 96%, 53%)', // Yellow
  cod: 'hsl(25, 95%, 53%)', // Orange
  refunded: 'hsl(0, 84%, 60%)', // Red
}

export function PaymentStatusChart({ orders }: PaymentStatusChartProps) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return []

    const statusRevenue: Record<string, number> = {}
    
    orders.forEach(order => {
      const status = order.payment_status || 'unpaid'
      const amount = parseFloat(order.total_amount || '0')
      
      if (!statusRevenue[status]) {
        statusRevenue[status] = 0
      }
      statusRevenue[status] += amount
    })
    
    return Object.entries(statusRevenue).map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: Math.round(value),
      color: COLORS[status as keyof typeof COLORS] || 'hsl(var(--muted))',
    }))
  }, [orders])

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No payment data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}