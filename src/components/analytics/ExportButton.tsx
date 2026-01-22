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
import { formatCurrency, formatNumber, getReadableDate, getReadableMonth } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'

interface ExportButtonProps {
  orders: any[]
  dateRange?: { from?: string; to?: string }
  businessName?: string
}

export function ExportButton({ orders, dateRange, businessName = 'ResellerPro' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

  // Helper function to get product summary from order items
  const getProductSummary = (order: any): string => {
    if (!order.order_items || order.order_items.length === 0) return 'N/A'
    return order.order_items
      .map((item: any) => `${item.quantity}x ${item.products?.name || 'Unknown'}`)
      .join(', ')
  }

  // Helper function to get total quantity
  const getTotalQuantity = (order: any): number => {
    if (!order.order_items || order.order_items.length === 0) return 0
    return order.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
  }

  // Helper function to get profit percentage
  const getProfitPercentage = (order: any): string => {
    const totalAmount = parseFloat(order.total_amount || 0)
    const profit = parseFloat(order.profit || 0)
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
    // Check subscription before export - direct redirect
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
        'Total Amount': formatCurrency(parseFloat(order.total_amount || 0)),
        'Cost Price': formatCurrency(parseFloat(order.cost_price || order.total_cost || (parseFloat(order.total_amount || 0) - parseFloat(order.profit || 0)))),
        'Profit': formatCurrency(parseFloat(order.profit || 0)),
        'Profit %': `${getProfitPercentage(order)}%`,
        'Status': order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A',
        'Payment Status': order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'N/A',
        'Payment Method': order.payment_method ? order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1) : 'N/A',
        'Shipping Address': getFullAddress(order.customers),
      }))

      // Generate readable filename
      const filename = dateRange?.from && dateRange?.to
        ? `Orders_${getReadableMonth(dateRange.from)}_Detailed`
        : `Orders_${getReadableDate()}_AllTime`

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
    // Check subscription before export - direct redirect
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    try {
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      const totalProfit = orders.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0)
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
        : `Analytics_${getReadableDate()}_Summary`

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
                Export Report
                {!isCheckingSubscription && !isPremium && <ProBadge />}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          <DropdownMenuItem onClick={handleExportOrders} className="flex-col items-start gap-1 py-3">
            <div className="flex items-center gap-2 w-full">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="font-medium">Detailed Orders (CSV)</span>
              {!isPremium && <ProBadge />}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Complete order data with all transaction details
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportSummary} className="flex-col items-start gap-1 py-3">
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="font-medium">Analytics Summary (PDF)</span>
              {!isPremium && <ProBadge />}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Executive overview with charts and key metrics
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </>
  )
}