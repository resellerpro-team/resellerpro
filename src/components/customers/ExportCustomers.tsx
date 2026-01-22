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
import { formatDate } from '@/lib/utils/dateHelpers'
import { Customer } from '@/types'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'

interface ExportCustomersProps {
  customers: Customer[]
  businessName?: string
}

export function ExportCustomers({ customers, businessName = 'ResellerPro' }: ExportCustomersProps) {
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()
  
  const handleExportCSV = async () => {
    if (!isPremium) {
      router.push('/settings/subscription#pricing')
      return
    }

    setIsExporting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const exportData = customers.map(c => ({
        'Name': c.name,
        'Phone': c.phone || '-',
        'Email': c.email || '-',
        'Total Orders': c.total_orders || 0,
        'Total Spend': formatCurrency(parseFloat(String(c.total_spent || 0))),
        'Address': c.address || '-',
        'City': c.city || '-',
        'State': c.state || '-',
        'Pincode': c.pincode || '-',
        'Joined Date': formatDate(c.created_at || '')
      }))

      exportToCSV(exportData, 'Customers_List', {
        company: businessName,
        reportType: 'Customer Database',
        generatedOn: new Date().toLocaleString('en-IN'),
        totalRecords: customers.length
      })
      toast.success('✅ Customer database exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export customer database')
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
      const totalCustomers = customers.length
      const totalSpend = customers.reduce((sum, c) => sum + parseFloat(String(c.total_spent || 0)), 0)
      const topCustomers = [...customers]
        .sort((a, b) => parseFloat(String(b.total_spent || 0)) - parseFloat(String(a.total_spent || 0)))
        .slice(0, 10)

      const summaryData = {
        totalCustomers,
        totalSpend,
        topCustomers,
        generatedAt: new Date().toLocaleString('en-IN'),
        businessName
      }

      exportToPDF(summaryData, 'Customers_Summary_PDF')
      toast.success('✅ Customer summary PDF exported successfully!')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('Failed to export customer summary')
    } finally {
      setIsExporting(false)
    }
  }

  return (
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
              Export Customers
              {!isCheckingSubscription && !isPremium && <ProBadge />}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem onClick={handleExportCSV} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="font-medium">Customer Database (CSV)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Full customer profiles, spending history, and contact info
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="font-medium">Customer Analysis (PDF)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Top customers and spending analysis overview
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
