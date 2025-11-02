'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type Product = {
  name: string
  cost_price: number
  selling_price: number
  stock_quantity?: number
  stock_status: string
  category?: string
}

export function ExportProducts({ products }: { products: Product[] }) {
  const handleExport = () => {
    // Prepare CSV data
    const headers = ['Name', 'Cost Price', 'Selling Price', 'Profit', 'Margin %', 'Stock', 'Status', 'Category']
    
    const rows = products.map(p => {
      const profit = p.selling_price - p.cost_price
      const margin = ((profit / p.selling_price) * 100).toFixed(2)
      
      return [
        p.name,
        p.cost_price,
        p.selling_price,
        profit,
        margin,
        p.stock_quantity || 0,
        p.stock_status,
        p.category || 'Uncategorized'
      ]
    })

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}