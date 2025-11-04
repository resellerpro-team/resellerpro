'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCSV } from '@/lib/utils/export'
import { toast } from 'sonner'

interface ExportButtonProps {
  orders: any[]
  dateRange?: { from?: string; to?: string }
}

export function ExportButton({ orders, dateRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportOrders = () => {
    setIsExporting(true)
    try {
      const exportData = orders.map(order => ({
        'Order Number': order.order_number,
        'Date': new Date(order.created_at).toLocaleDateString('en-IN'),
        'Customer': order.customers?.name || 'N/A',
        'Total Amount': parseFloat(order.total_amount || 0).toFixed(2),
        'Profit': parseFloat(order.profit || 0).toFixed(2),
        'Status': order.status,
        'Payment Status': order.payment_status,
        'Payment Method': order.payment_method || 'N/A',
      }))

      const filename = dateRange?.from && dateRange?.to
        ? `analytics_${dateRange.from}_to_${dateRange.to}`
        : 'analytics_all_time'

      exportToCSV(exportData, filename)
      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSummary = () => {
    setIsExporting(true)
    try {
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      const totalProfit = orders.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0)
      const avgOrderValue = totalRevenue / (orders.length || 1)

      const summaryData = [
        { Metric: 'Total Orders', Value: orders.length },
        { Metric: 'Total Revenue', Value: `₹${totalRevenue.toFixed(2)}` },
        { Metric: 'Total Profit', Value: `₹${totalProfit.toFixed(2)}` },
        { Metric: 'Profit Margin', Value: `${((totalProfit / totalRevenue) * 100).toFixed(2)}%` },
        { Metric: 'Average Order Value', Value: `₹${avgOrderValue.toFixed(2)}` },
      ]

      const filename = dateRange?.from && dateRange?.to
        ? `summary_${dateRange.from}_to_${dateRange.to}`
        : 'summary_all_time'

      exportToCSV(summaryData, filename)
      toast.success('Summary exported successfully!')
    } catch (error) {
      toast.error('Failed to export summary')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportOrders}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Detailed Report (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSummary}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Summary (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}