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
import { formatCurrency } from '@/lib/utils/formatters'
import { Product } from '@/types'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'

export function ExportProducts({ products, businessName = 'ResellerPro', className }: { products: Product[], businessName?: string, className?: string }) {
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

  const handleExportCSV = async () => {
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const exportData = products.map(p => {
        const profit = p.selling_price - p.cost_price
        const margin = p.selling_price > 0 ? ((profit / p.selling_price) * 100).toFixed(2) : '0.00'
        const stockValue = (p.stock_quantity || 0) * p.cost_price

        return {
          'Product Name': p.name,
          'Category': p.category || 'Uncategorized',
          'SKU': p.sku || '-',
          'Stock Status': p.stock_status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          'Stock Qty': p.stock_quantity || 0,
          'Cost Price': formatCurrency(p.cost_price),
          'Selling Price': formatCurrency(p.selling_price),
          'Profit': formatCurrency(profit),
          'Margin %': `${margin}%`,
          'Total Stock Value': formatCurrency(stockValue)
        }
      })

      exportToCSV(exportData, 'Products_Inventory', {
        company: businessName,
        reportType: 'Inventory Report',
        generatedOn: new Date().toLocaleString('en-IN'),
        totalRecords: products.length
      })
      toast.success('✅ Inventory report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export inventory report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    try {
      const totalStockValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * p.cost_price), 0)
      const totalItems = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)

      const summaryData = {
        totalProducts: products.length,
        totalStockValue,
        totalItems,
        products: products.slice(0, 20), // Top 20 for summary
        generatedAt: new Date().toLocaleString('en-IN'),
        businessName
      }

      exportToPDF(summaryData, 'Products_Summary_PDF')
      toast.success('✅ Product summary PDF exported successfully!')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('Failed to export product summary')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className} disabled={isExporting || isCheckingSubscription}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Products
              {!isCheckingSubscription && !isPremium && <ProBadge />}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem onClick={handleExportCSV} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="font-medium">Detailed Inventory (CSV)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Complete inventory data, stock values, and profit margins
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="font-medium">Stock Summary (PDF)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Printable stock overview and value report
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
