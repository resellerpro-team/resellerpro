'use client'

import { ExportButton } from '@/components/shared/ExportButton'
import { exportToCSV } from '@/lib/utils/export'
import { formatCurrency } from '@/lib/utils/formatters'
import { formatDate } from '@/lib/utils/dateHelpers'
import { Customer } from '@/types'

interface ExportCustomersProps {
  customers: Customer[]
}

export function ExportCustomers({ customers }: ExportCustomersProps) {
  
  const handleExport = () => {
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
      reportType: 'Customer Database',
      generatedOn: new Date().toLocaleString('en-IN'),
      totalRecords: customers.length
    })
  }

  return (
    <ExportButton 
      onExport={handleExport}
      featureName="exporting customers"
    />
  )
}
