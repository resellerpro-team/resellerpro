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
import { formatDate } from '@/lib/utils/dateHelpers'
import { Enquiry } from '@/types'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'

interface ExportEnquiriesProps {
  enquiries: Enquiry[]
  businessName?: string
}

export function ExportEnquiries({ enquiries, businessName = 'ResellerPro' }: ExportEnquiriesProps) {
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
      const exportData = enquiries.map(e => ({
        'Customer Name': e.customer_name || 'N/A',
        'Phone': e.phone || '-',
        'Product Interest': e.product_name || '-',
        'Status': e.status ? e.status.replace('_', ' ').toUpperCase() : '-',
        'Message': e.message || '-',
        'Date': formatDate(e.created_at)
      }))

      exportToCSV(exportData, 'Enquiries_Leads', {
        company: businessName,
        reportType: 'Enquiries & Leads Report',
        generatedOn: new Date().toLocaleString('en-IN'),
        totalRecords: enquiries.length
      })
      toast.success('✅ Leads report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export leads report')
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
      const summaryData = {
        totalEnquiries: enquiries.length,
        statusBreakdown: enquiries.reduce((acc: any, e) => {
          const status = e.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {}),
        recentEnquiries: enquiries.slice(0, 10),
        generatedAt: new Date().toLocaleString('en-IN'),
        businessName
      }

      exportToPDF(summaryData, 'Enquiries_Summary_PDF')
      toast.success('✅ Leads summary PDF exported successfully!')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('Failed to export leads summary')
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
              Export Leads
              {!isCheckingSubscription && !isPremium && <ProBadge />}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem onClick={handleExportCSV} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="font-medium">Leads Database (CSV)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            All lead details, status, and product interests
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="flex-col items-start gap-1 py-3 cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="font-medium">Leads Summary (PDF)</span>
            {!isPremium && <ProBadge />}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Daily lead generation overview report
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
