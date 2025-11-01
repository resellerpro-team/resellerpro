'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

type Order = {
  id: string
  order_number: string
  created_at: string
  status: string
  payment_status: string
  total_amount: number
  profit: number
  customers: {
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
      unpaid: 'bg-yellow-500',
      cod: 'bg-orange-500',
      refunded: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="rounded-md border">
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
              <TableCell className="font-medium">{order.order_number}</TableCell>
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
                <Badge className={`${getStatusColor(order.status)} text-white`}>
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
                ₹{order.total_amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                ₹{order.profit.toFixed(2)}
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
  )
}