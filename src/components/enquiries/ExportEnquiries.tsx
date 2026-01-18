'use client'

import { ExportButton } from '@/components/shared/ExportButton'
import { exportToCSV } from '@/lib/utils/export'
import { formatDate } from '@/lib/utils/dateHelpers'
import { Enquiry } from '@/types'

interface ExportEnquiriesProps {
  enquiries: Enquiry[]
}

export function ExportEnquiries({ enquiries }: ExportEnquiriesProps) {

  const handleExport = () => {
    const exportData = enquiries.map(e => ({
      'Customer Name': e.customer_name || 'N/A',
      'Phone': e.phone || '-',
      'Product Interest': e.product_name || '-',
      'Status': e.status ? e.status.replace('_', ' ').toUpperCase() : '-',
      'Message': e.message || '-',
      'Date': formatDate(e.created_at)
    }))

    exportToCSV(exportData, 'Enquiries_Leads', {
      reportType: 'Enquiries & Leads Report',
      generatedOn: new Date().toLocaleString('en-IN'),
      totalRecords: enquiries.length
    })
  }

  return (
    <ExportButton 
      onExport={handleExport}
      featureName="exporting enquiries"
    />
  )
}
