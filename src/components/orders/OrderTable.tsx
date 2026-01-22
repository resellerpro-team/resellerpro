'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

type Order = {
  id: string
  order_number: number
  created_at: string
  status: string
  payment_status: string
  total_amount: number
  total_profit: number 
  customers?: {
    id: string
    name: string
    phone: string
  } | null
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found</p>
        <Button asChild className="mt-4">
          <Link href="/orders/new">Create your first order</Link>
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500', // ✅ Changed from 'unpaid' to 'pending'
      cod: 'bg-orange-500',
      refunded: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className='space-y-4'>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.order_number}</TableCell>
                <TableCell>
                  {order.customers ? (
                    <div>
                      <p className="font-medium">{order.customers.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customers.phone}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No customer</span>
                  )}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(order.status)} text-white border-0`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getPaymentColor(order.payment_status)} text-white border-0`}
                  >
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{Number(order.total_amount || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {/* ✅ Changed from order.profit to order.total_profit */}
                  ₹{Number(order.total_profit || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="font-bold">#{order.order_number}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </span>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white border-0`}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-3 space-y-3">
              {/* Customer */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
                  {order.customers ? (
                    <div>
                      <p className="font-medium">{order.customers.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customers.phone}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No customer</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                  <p className="text-lg font-bold">₹{Number(order.total_amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-medium">
                    +₹{Number(order.total_profit || 0).toFixed(2)} profit
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge
                  variant="outline"
                  className={`${getPaymentColor(order.payment_status)} text-white border-0`}
                >
                  {order.payment_status}
                </Badge>
                <Button variant="ghost" size="sm" asChild className="h-8">
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}