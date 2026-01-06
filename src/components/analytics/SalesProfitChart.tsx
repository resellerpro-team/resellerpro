'use client'

import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { format, parseISO, eachDayOfInterval, startOfDay } from 'date-fns'

interface Order {
  created_at: string
  total_amount: string
  profit: string
}

interface SalesProfitChartProps {
  orders: Order[]
  dateRange: { from: string; to: string }
}

export function SalesProfitChart({ orders, dateRange }: SalesProfitChartProps) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return []

    const from = parseISO(dateRange.from)
    const to = parseISO(dateRange.to)

    // Get all days in the range
    const days = eachDayOfInterval({ start: from, end: to })

    // Group orders by date
    const ordersByDate: Record<string, { sales: number; profit: number }> = {}

    orders.forEach(order => {
      const date = format(startOfDay(parseISO(order.created_at)), 'yyyy-MM-dd')
      if (!ordersByDate[date]) {
        ordersByDate[date] = { sales: 0, profit: 0 }
      }
      ordersByDate[date].sales += parseFloat(order.total_amount || '0')
      ordersByDate[date].profit += parseFloat(order.profit || '0')
    })

    // Create chart data for all days
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const data = ordersByDate[dateKey] || { sales: 0, profit: 0 }

      return {
        date: format(day, 'MMM dd'),
        sales: Math.round(data.sales),
        profit: Math.round(data.profit),
      }
    })
  }, [orders, dateRange])

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available for this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
          formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Sales"
          dot={{ fill: 'hsl(var(--primary))' }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="hsl(142, 76%, 36%)"
          strokeWidth={2}
          name="Profit"
          dot={{ fill: 'hsl(142, 76%, 36%)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}