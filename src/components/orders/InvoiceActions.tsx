'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download, Loader2, Share2, MessageCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface InvoiceActionsProps {
    orderNumber: string
    contentId: string
    customerPhone?: string
    customerName?: string
}

export function InvoiceActions({ orderNumber, contentId, customerPhone, customerName }: InvoiceActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile device
    useState(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    })

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

    const handleSharePDF = async () => {
        const element = document.getElementById(contentId)
        if (!element) {
            toast.error('Invoice content not found')
            return
        }

        // Check if Web Share API is available
        if (!navigator.share) {
            toast.error('Sharing is not supported on this browser. Please use download instead.')
            return
        }

        setIsSharing(true)
        const toastId = toast.loading('Preparing invoice to share...')

        try {
            // Generate canvas with high quality
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = pageWidth - 20
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20))

            // Convert PDF to blob
            const pdfBlob = pdf.output('blob')
            const fileName = `Invoice-${orderNumber}.pdf`

            // Create file for sharing
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

            // Check if files can be shared
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Invoice ${orderNumber}`,
                    text: `Invoice for order ${orderNumber}`,
                })
                toast.success('Invoice shared successfully', { id: toastId })
            } else {
                // Fallback to download
                pdf.save(fileName)
                toast.success('Sharing not available. Invoice downloaded instead.', { id: toastId })
            }
        } catch (error: any) {
            // User cancelled share or error occurred
            if (error.name === 'AbortError') {
                toast.info('Share cancelled', { id: toastId })
            } else {
                console.error('Share error:', error)
                toast.error('Failed to share. Please try downloading instead.', { id: toastId })
            }
        } finally {
            setIsSharing(false)
        }
    }

    const handleSendToWhatsApp = async () => {
        if (!customerPhone) {
            toast.error('Customer phone number not available')
            return
        }

        const element = document.getElementById(contentId)
        if (!element) {
            toast.error('Invoice content not found')
            return
        }

        // Check if Web Share API with files is available
        const canShareFiles = navigator.canShare && navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] })

        setIsGenerating(true)
        const toastId = toast.loading('Preparing invoice...')

        try {
            // Generate canvas with high quality
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = pageWidth - 20
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20))

            const pdfBlob = pdf.output('blob')
            const fileName = `Invoice-${orderNumber}.pdf`
            const cleanNumber = customerPhone.replace(/[^\d+]/g, '').replace('+', '')

            if (canShareFiles) {
                // TWO-STEP APPROACH: Share PDF via native API, then open WhatsApp chat
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

                try {
                    await navigator.share({
                        files: [file],
                        title: `Invoice ${orderNumber}`,
                        text: `Invoice for ${customerName || 'customer'} - Please select WhatsApp and send to ${customerPhone}`,
                    })

                    toast.success('Invoice shared! Opening WhatsApp chat...', { id: toastId })

                    // After sharing, open WhatsApp chat with the customer
                    setTimeout(() => {
                        const message = `Hi ${customerName || 'there'}! 👋\n\nYour invoice for order #${orderNumber} is ready.\n\nThank you for your business! 🙏`
                        const encodedMessage = encodeURIComponent(message)
                        window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank')
                    }, 1000)

                } catch (error: any) {
                    if (error.name === 'AbortError') {
                        toast.info('Share cancelled', { id: toastId })
                    } else {
                        throw error
                    }
                }
            } else {
                // FALLBACK: Download PDF and open WhatsApp with message
                pdf.save(fileName)
                const message = `Hi ${customerName || 'there'}! 👋\n\nYour invoice for order #${orderNumber} is ready.\n\nThank you for your business! 🙏`
                const encodedMessage = encodeURIComponent(message)
                window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank')
                toast.success('Invoice downloaded! Opening WhatsApp...', { id: toastId })
            }
        } catch (error) {
            console.error('PDF generation error:', error)
            toast.error('Failed to generate invoice', { id: toastId })
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

            {/* Send to Customer WhatsApp */}
            {customerPhone && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendToWhatsApp}
                    disabled={isSharing || isGenerating}
                    className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                    )}
                    Send to Customer
                </Button>
            )}

            {/* Show Share button on mobile devices (only if no customer phone) */}
            {isMobile && !customerPhone && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSharePDF}
                    disabled={isSharing || isGenerating}
                    className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                    {isSharing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Share2 className="mr-2 h-4 w-4" />
                    )}
                    Share Invoice
                </Button>
            )}

            <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating || isSharing}
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
