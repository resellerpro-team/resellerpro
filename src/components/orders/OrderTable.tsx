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
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkActionBar } from './BulkActionBar'
import { generateStatusMessage } from '@/utils/whatsapp-helper'

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
  // React hooks must be at the top, before any early returns
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  const handleWhatsAppShare = (order: Order) => {
    if (!order.customers?.phone) return

    const message = generateStatusMessage(
      order.customers.name,
      order.order_number.toString(),
      order.status,
      undefined, // Tracking - list view doesn't have it easily
      undefined, // Courier - list view doesn't have it easily
      {
        products: [], // We don't have items here, utility handles gracefully
        totalAmount: order.total_amount
      },
      'Our Store' // Optional business name
    )

    window.open(
      `https://wa.me/${order.customers.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  }

  // Selection Logic

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id))
  const activeStatus = selectedOrders[0]?.status

  const toggleAll = () => {
    const ordersOfActiveStatus = orders.filter((o) =>
      selectedIds.length > 0 ? o.status === activeStatus : o.status === orders[0]?.status
    )
    const allOfStatusSelected = selectedIds.length > 0 && selectedIds.length === ordersOfActiveStatus.length

    if (allOfStatusSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(ordersOfActiveStatus.map((o) => o.id))
    }
  }

  const toggleOne = (id: string, status: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id)
      }

      // Check if we can select this order (must match current selection's status)
      if (prev.length > 0 && status !== activeStatus) {
        return prev
      }

      return [...prev, id]
    })
  }

  const isSelectionDisabled = (orderStatus: string) => {
    return selectedIds.length > 0 && orderStatus !== activeStatus
  }

  return (
    <div className='relative space-y-4 pb-20'>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === orders.filter(o => o.status === activeStatus).length}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  disabled={orders.length === 0}
                />
              </TableHead>
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
            {orders.map((order) => {
              const isDisabled = isSelectionDisabled(order.status)
              return (
                <TableRow
                  key={order.id}
                  className={`
                    ${selectedIds.includes(order.id) ? 'bg-muted/50' : ''}
                    ${isDisabled ? 'opacity-40 select-none grayscale-[0.5]' : ''}
                  `}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={() => toggleOne(order.id, order.status)}
                      disabled={isDisabled}
                      aria-label={`Select order #${order.order_number}`}
                    />
                  </TableCell>
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
                      {order.customers?.phone && order.status !== 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleWhatsAppShare(order)}
                          title="Share Status Update"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards Header - Selection Controls */}
      <div className="md:hidden flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.length > 0 && selectedIds.length === orders.filter(o => o.status === activeStatus).length}
            onCheckedChange={toggleAll}
            aria-label="Select all compatible orders"
            disabled={orders.length === 0}
            className="h-5 w-5"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {selectedIds.length > 0 ? 'Batch Selection' : 'Select All'}
            </span>
            <span className="text-sm font-medium">
              {selectedIds.length > 0 ? `${activeStatus} orders` : 'Orders'}
            </span>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedIds([])}
            className="h-8 px-3 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            Clear ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-4">
        {orders.map((order) => {
          const isDisabled = isSelectionDisabled(order.status)
          const isSelected = selectedIds.includes(order.id)

          return (
            <Card
              key={order.id}
              onClick={() => !isDisabled && toggleOne(order.id, order.status)}
              className={`overflow-hidden transition-all duration-200 active:scale-[0.98] ${isSelected ? 'ring-2 ring-primary border-primary/20 bg-primary/5 shadow-md' : 'hover:border-primary/20'
                } ${isDisabled ? 'opacity-40 grayscale-[0.5] pointer-events-none' : 'cursor-pointer'}`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !isDisabled && toggleOne(order.id, order.status)}
                    disabled={isDisabled}
                    aria-label={`Select order #${order.order_number}`}
                    className="h-5 w-5"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">#{order.order_number}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white border-0 shadow-sm`}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-3 space-y-3">
                {/* Customer */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                    {order.customers ? (
                      <div>
                        <p className="font-medium text-sm">{order.customers.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{order.customers.phone}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No customer</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Amount</p>
                    <p className="text-base font-bold text-primary">₹{Number(order.total_amount || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-green-600 font-bold bg-green-500/10 px-1.5 py-0.5 rounded-full inline-block mt-1">
                      +₹{Number(order.total_profit || 0).toFixed(2)} profit
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <Badge
                    variant="outline"
                    className={`${getPaymentColor(order.payment_status)} text-white border-0 text-[10px] h-5`}
                  >
                    {order.payment_status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {order.customers?.phone && order.status !== 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsAppShare(order)
                        }}
                      >
                        <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Share
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 text-xs gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        currentStatus={activeStatus}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  )
}