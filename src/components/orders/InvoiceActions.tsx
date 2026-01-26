'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface InvoiceActionsProps {
    orderNumber: string
    contentId: string
}

export function InvoiceActions({ orderNumber, contentId }: InvoiceActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPDF = async () => {
        const element = document.getElementById(contentId)
        if (!element) {
            toast.error('Invoice content not found')
            return
        }

        setIsGenerating(true)
        const toastId = toast.loading('Generating PDF...')

        try {
            // Capture canvas with higher scale for better quality
            // Use windowWidth to ensure we capture the full desktop layout correctly
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200, // Force a desktop-like width for the capture
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)

            // Calculate PDF dimensions (A4 size is approx 595 x 842 px at 72dpi)
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = pageWidth - 20 // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20))
            pdf.save(`Invoice-${orderNumber}.pdf`)

            toast.success('Invoice downloaded successfully', { id: toastId })
        } catch (error) {
            console.error('PDF generation error:', error)
            toast.error('Failed to generate PDF. Please try printing to PDF instead.', { id: toastId })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-3 mb-6 print:hidden">
            {/* <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button> */}
            <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
                {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download Invoice
            </Button>
        </div>
    )
}
