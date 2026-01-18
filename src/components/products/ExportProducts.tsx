'use client'

import { ExportButton } from '@/components/shared/ExportButton'
import { exportToCSV } from '@/lib/utils/export'
import { formatCurrency } from '@/lib/utils/formatters'
import { Product } from '@/types'

export function ExportProducts({ products }: { products: Product[] }) {

  const handleExport = async () => {
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
        reportType: 'Inventory Report',
        generatedOn: new Date().toLocaleString('en-IN'),
        totalRecords: products.length
    })
  }

  return (
    <ExportButton 
      onExport={handleExport}
      featureName="exporting products"
    />
  )
}
