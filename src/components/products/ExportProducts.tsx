'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'

type Product = {
  name: string
  cost_price: number
  selling_price: number
  stock_quantity?: number
  stock_status: string
  category?: string
}

export function ExportProducts({ products }: { products: Product[] }) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

  const handleExport = () => {
    // Check subscription before export
    if (!isPremium) {
      setShowUpgradePrompt(true)
      return
    }

    setIsExporting(true)
    
    // Simulate a small delay for better UX or just proceed
    setTimeout(() => {
        try {
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
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }, 500)
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleExport}
        disabled={isExporting || isCheckingSubscription}
      >
        {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Download className="mr-2 h-4 w-4" />
        )}
        Export CSV
        {!isCheckingSubscription && !isPremium && <ProBadge />}
      </Button>

      <UpgradePrompt 
        open={showUpgradePrompt} 
        onOpenChange={setShowUpgradePrompt}
        feature="exporting products"
      />
    </>
  )
}