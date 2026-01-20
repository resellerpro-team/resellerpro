'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCSV } from '@/lib/utils/export'
import { exportToPDF } from '@/lib/utils/exportPDF'
import { formatDate, getDayName, getDate, getMonthName, getYear } from '@/lib/utils/dateHelpers'
import { formatCurrency, getReadableDate, getReadableMonth } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'
import { Order } from '@/types'

interface ExportOrdersProps {
  orders: Order[]
  dateRange?: { from?: string; to?: string }
  businessName?: string
}

export function ExportOrders({ orders, dateRange, businessName = 'ResellerPro' }: ExportOrdersProps) {
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

  // Helper function to get product summary from order items
  const getProductSummary = (order: Order): string => {
    if (!order.order_items || order.order_items.length === 0) return 'N/A'
    return order.order_items
      .map((item: any) => `${item.quantity}x ${item.products?.name || 'Unknown'}`)
      .join(', ')
  }

  // Helper function to get total quantity
  const getTotalQuantity = (order: Order): number => {
    if (!order.order_items || order.order_items.length === 0) return 0
    return order.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
  }

  // Helper function to get profit percentage
  const getProfitPercentage = (order: Order): string => {
    const totalAmount = parseFloat(String(order.total_amount || 0))
    const profit = parseFloat(String(order.profit || 0))
    if (totalAmount === 0) return '0.00'
    return ((profit / totalAmount) * 100).toFixed(2)
  }

  // Helper function to get full address
  const getFullAddress = (customer: any): string => {
    if (!customer) return 'N/A'
    const parts = [
      customer.address,
      customer.city,
      customer.state,
      customer.pincode
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  const handleExportOrders = () => {
    // Direct redirect for non-premium users
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    try {
      const exportData = orders.map(order => ({
        'Order Number': order.order_number,
        'Order Date': formatDate(order.created_at),
        'Day': getDayName(order.created_at),
        'Date': getDate(order.created_at),
        'Month': getMonthName(order.created_at),
        'Year': getYear(order.created_at),
        'Customer Name': order.customers?.name || 'N/A',
        'Customer Phone': order.customers?.phone || 'N/A',
        'Product Details': getProductSummary(order),
        'Total Quantity': getTotalQuantity(order),
        'Total Amount': formatCurrency(parseFloat(String(order.total_amount || 0))),
        'Cost Price': formatCurrency(parseFloat(String(order.cost_price || order.total_cost || (parseFloat(String(order.total_amount || 0)) - parseFloat(String(order.profit || 0)))))),
        'Profit': formatCurrency(parseFloat(String(order.profit || 0))),
        'Profit %': `${getProfitPercentage(order)}%`,
        'Status': order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A',
        'Payment Status': order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'N/A',
        'Payment Method': order.payment_method ? order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1) : 'N/A',
        'Shipping Address': getFullAddress(order.customers),
        'Notes': order.notes || '-'
      }))

      // Generate readable filename
      const filename = dateRange?.from && dateRange?.to
        ? `Orders_${getReadableMonth(dateRange.from)}_Detailed`
        : `Orders_${getReadableDate()}_Export`

      exportToCSV(exportData, filename, {
        company: businessName,
        reportType: 'Detailed Orders Report',
        dateRange: dateRange?.from && dateRange?.to 
          ? `${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
          : 'All Time',
        generatedOn: new Date().toLocaleString('en-IN', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        }),
        totalRecords: orders.length
      })
      toast.success('✅ Detailed report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export detailed report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSummary = () => {
    // Direct redirect for non-premium users
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    try {
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0)
      const totalProfit = orders.reduce((sum, o) => sum + parseFloat(String(o.profit || 0)), 0)
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      const avgOrderValue = totalRevenue / (orders.length || 1)

      const summaryData = {
        totalOrders: orders.length,
        totalRevenue,
        totalProfit,
        profitMargin,
        avgOrderValue,
        orders,
        dateRange,
        businessName
      }

      // Generate readable filename
      const filename = dateRange?.from && dateRange?.to
        ? `Analytics_${getReadableMonth(dateRange.from)}_Summary`
        : `Orders_${getReadableDate()}_Summary`

      exportToPDF(summaryData, filename)
      toast.success('✅ Summary PDF exported successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export summary PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting || isCheckingSubscription}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Orders
                {!isCheckingSubscription && !isPremium && <ProBadge />}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          <DropdownMenuItem onClick={handleExportOrders} className="flex-col items-start gap-1 py-3 cursor-pointer">
            <div className="flex items-center gap-2 w-full">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="font-medium">Detailed CSV Export</span>
              {!isPremium && <ProBadge />}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Full data: customer info, items, P&L, shipping
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportSummary} className="flex-col items-start gap-1 py-3 cursor-pointer">
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="font-medium">Summary Report (PDF)</span>
              {!isPremium && <ProBadge />}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Printable overview with totals & charts
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </>
  )
}
