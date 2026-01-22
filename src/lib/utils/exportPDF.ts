import { getDateRangeString, formatDateTime } from './dateHelpers'
import { Enquiry, Product, Customer } from '@/types'

export interface OrderSummaryData {
    totalOrders: number
    totalRevenue: number
    totalProfit: number
    profitMargin: number
    avgOrderValue: number
    orders: any[]
    dateRange?: { from?: string; to?: string }
    businessName?: string
}

export interface EnquirySummaryData {
    totalEnquiries: number
    statusBreakdown: Record<string, number>
    recentEnquiries: Enquiry[]
    generatedAt: string
    businessName?: string
    dateRange?: { from?: string; to?: string }
}

export interface ProductSummaryData {
    totalProducts: number
    totalStockValue: number
    totalItems: number
    products: Product[]
    generatedAt: string
    businessName?: string
}

export interface CustomerSummaryData {
    totalCustomers: number
    totalSpend: number
    topCustomers: Customer[]
    generatedAt: string
    businessName?: string
}

export async function exportToPDF(data: OrderSummaryData | EnquirySummaryData | ProductSummaryData | CustomerSummaryData, filename: string) {
    // Dynamic import to reduce initial bundle size
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Professional Color Palette
    const navy: [number, number, number] = [30, 58, 138]        // Professional navy blue
    const teal: [number, number, number] = [13, 148, 136]       // Modern teal
    const emerald: [number, number, number] = [16, 185, 129]    // Success green
    const amber: [number, number, number] = [245, 158, 11]      // Warning amber
    const slate: [number, number, number] = [71, 85, 105]       // Neutral slate
    const lightGray: [number, number, number] = [248, 250, 252] // Very light gray
    const borderGray: [number, number, number] = [226, 232, 240] // Border gray

    let yPos = 15

    // ===== PROFESSIONAL HEADER =====
    // Header background - Subtle gradient effect using two rectangles
    doc.setFillColor(navy[0], navy[1], navy[2])
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Accent line
    doc.setFillColor(teal[0], teal[1], teal[2])
    doc.rect(0, 45, pageWidth, 2, 'F')

    // Company Name - Bold and prominent
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text((data.businessName || 'BUSINESS NAME').toUpperCase(), 15, 25)

    // Report Title
    let title = 'ANALYTICS SUMMARY REPORT'
    if ('totalEnquiries' in data) title = 'LEADS & ENQUIRIES REPORT'
    else if ('totalProducts' in data) title = 'INVENTORY SUMMARY REPORT'
    else if ('totalCustomers' in data) title = 'CUSTOMER ANALYSIS REPORT'

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255) // Light blue
    doc.text(title, 15, 35)

    // Date on the right
    doc.setFontSize(9)
    doc.setTextColor(180, 200, 255)
    doc.text(formatDateTime(new Date().toISOString()), pageWidth - 15, 25, { align: 'right' })
    doc.text('Generated', pageWidth - 15, 20, { align: 'right' })

    yPos = 55

    if ('totalOrders' in data) {
        return generateOrderSummary(doc, data, yPos, pageWidth, pageHeight, filename)
    } else if ('totalEnquiries' in data) {
        return generateEnquirySummary(doc, data, yPos, pageWidth, pageHeight, filename)
    } else if ('totalProducts' in data) {
        return generateProductSummary(doc, data, yPos, pageWidth, pageHeight, filename)
    } else if ('totalCustomers' in data) {
        return generateCustomerSummary(doc, data, yPos, pageWidth, pageHeight, filename)
    }
}

async function generateOrderSummary(doc: any, data: OrderSummaryData, startY: number, pageWidth: number, pageHeight: number, filename: string) {
    const autoTable = (await import('jspdf-autotable')).default

    // Check for autoTable availability
    if (typeof autoTable !== 'function') {
        console.error('jspdf-autotable not loaded properly')
        return
    }

    // Professional Color Palette
    const navy: [number, number, number] = [30, 58, 138]        // Professional navy blue
    const teal: [number, number, number] = [13, 148, 136]       // Modern teal
    const emerald: [number, number, number] = [16, 185, 129]    // Success green
    const amber: [number, number, number] = [245, 158, 11]      // Warning amber
    const slate: [number, number, number] = [71, 85, 105]       // Neutral slate
    const lightGray: [number, number, number] = [248, 250, 252] // Very light gray
    const borderGray: [number, number, number] = [226, 232, 240] // Border gray

    let yPos = startY

    // ===== PERIOD BADGE =====
    const periodText = getDateRangeString(data.dateRange?.from, data.dateRange?.to)
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.roundedRect(15, yPos, 80, 10, 2, 2, 'F')
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.roundedRect(15, yPos, 80, 10, 2, 2, 'S')

    doc.setFontSize(8)
    doc.setTextColor(slate[0], slate[1], slate[2])
    doc.setFont('helvetica', 'bold')
    doc.text(`PERIOD: ${periodText.toUpperCase()}`, 17, yPos + 7)

    yPos += 20

    // ===== KEY METRICS GRID =====
    const metrics = [
        {
            label: 'Total Orders',
            value: data.totalOrders.toString(),
            color: navy
        },
        {
            label: 'Revenue',
            value: `Rs. ${data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
            color: emerald
        },
        {
            label: 'Profit',
            value: `Rs. ${data.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
            color: teal
        },
        {
            label: 'Profit Margin',
            value: `${data.profitMargin.toFixed(1)}%`,
            color: amber
        },
    ]

    const boxWidth = 46
    const boxHeight = 28
    const spacing = 3
    const startX = 15

    metrics.forEach((metric, index) => {
        const x = startX + (boxWidth + spacing) * index

        // Card background with subtle shadow effect
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'F')

        // Colored top border
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
        doc.roundedRect(x, yPos, boxWidth, 3, 2, 2, 'F')

        // Border
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
        doc.setLineWidth(0.3)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'S')

        // Label
        doc.setFontSize(7)
        doc.setTextColor(slate[0], slate[1], slate[2])
        doc.setFont('helvetica', 'normal')
        doc.text(metric.label, x + 4, yPos + 10)

        // Value
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2])
        doc.text(metric.value, x + 4, yPos + 20)
    })

    yPos += boxHeight + 4

    // Average Order Value - Full width card
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(startX, yPos, boxWidth * 4 + spacing * 3, 18, 2, 2, 'F')

    doc.setFillColor(navy[0], navy[1], navy[2])
    doc.roundedRect(startX, yPos, boxWidth * 4 + spacing * 3, 3, 2, 2, 'F')

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.3)
    doc.roundedRect(startX, yPos, boxWidth * 4 + spacing * 3, 18, 2, 2, 'S')

    doc.setFontSize(8)
    doc.setTextColor(slate[0], slate[1], slate[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Average Order Value', startX + 4, yPos + 10)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(navy[0], navy[1], navy[2])
    doc.text(`Rs. ${data.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, startX + 50, yPos + 10)

    yPos += 26

    // ===== ORDER STATUS BREAKDOWN =====
    const statusCounts = data.orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
    }, {})

    if (Object.keys(statusCounts).length > 0) {
        // Section Header
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('ORDER STATUS BREAKDOWN', 15, yPos)

        yPos += 6

        const statusData = Object.entries(statusCounts).map(([status, count]) => [
            status.charAt(0).toUpperCase() + status.slice(1),
            (count as number).toString(),
            `${((count as number / data.totalOrders) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count', 'Percentage']],
            body: statusData as any,
            theme: 'plain',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [30, 58, 138] },
                1: { halign: 'center' },
                2: { halign: 'right', textColor: [13, 148, 136] }
            },
            margin: { left: 15, right: 15 }
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : yPos + 8
    }

    // ===== PAYMENT METHOD BREAKDOWN =====
    const paymentCounts = data.orders.reduce((acc: any, order: any) => {
        const method = order.payment_method || 'Not Specified'
        acc[method] = (acc[method] || 0) + 1
        return acc
    }, {})

    if (Object.keys(paymentCounts).length > 0 && yPos < pageHeight - 55) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('PAYMENT METHODS', 15, yPos)

        yPos += 6

        const paymentData = Object.entries(paymentCounts).map(([method, count]) => [
            method,
            (count as number).toString(),
            `${((count as number / data.totalOrders) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Method', 'Count', 'Percentage']],
            body: paymentData as any,
            theme: 'plain',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [30, 58, 138] },
                1: { halign: 'center' },
                2: { halign: 'right', textColor: [13, 148, 136] }
            },
            margin: { left: 15, right: 15 }
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : yPos + 8
    }

    // ===== TOP 5 CUSTOMERS =====
    const customerRevenue = data.orders.reduce((acc: any, order: any) => {
        const customerName = order.customers?.name || 'Unknown'
        if (!acc[customerName]) {
            acc[customerName] = { count: 0, revenue: 0 }
        }
        acc[customerName].count++
        acc[customerName].revenue += parseFloat(order.total_amount || 0)
        return acc
    }, {})

    const topCustomers = Object.entries(customerRevenue)
        .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
        .slice(0, 5)

    if (topCustomers.length > 0 && yPos < pageHeight - 65) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('TOP 5 CUSTOMERS', 15, yPos)

        yPos += 6

        const customerData = topCustomers.map(([name, data]: any) => [
            name,
            data.count.toString(),
            `Rs. ${data.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Customer Name', 'Orders', 'Total Revenue']],
            body: customerData as any,
            theme: 'plain',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [30, 58, 138] },
                1: { halign: 'center' },
                2: { halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        })
    }

    // Professional Footer for Orders
    renderFooter(doc, pageWidth, pageHeight, data.businessName, `Total Orders: ${data.totalOrders}`)

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
}

async function generateEnquirySummary(doc: any, data: EnquirySummaryData, startY: number, pageWidth: number, pageHeight: number, filename: string) {
    const autoTable = (await import('jspdf-autotable')).default

    // Professional Color Palette
    const navy: [number, number, number] = [30, 58, 138]
    const teal: [number, number, number] = [13, 148, 136]
    const slate: [number, number, number] = [71, 85, 105]
    const lightGray: [number, number, number] = [248, 250, 252]
    const borderGray: [number, number, number] = [226, 232, 240]

    let yPos = startY

    // ===== TOTAL ENQUIRIES CARD =====
    // Full width card
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(15, yPos, 60, 20, 2, 2, 'F')

    // Left colored border
    doc.setFillColor(navy[0], navy[1], navy[2])
    doc.roundedRect(15, yPos, 2, 20, 2, 2, 'F')

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.3)
    doc.roundedRect(15, yPos, 60, 20, 2, 2, 'S')

    doc.setFontSize(9)
    doc.setTextColor(slate[0], slate[1], slate[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Total Leads', 22, yPos + 8)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(navy[0], navy[1], navy[2])
    doc.text(data.totalEnquiries.toString(), 22, yPos + 16)

    yPos += 30

    // ===== STATUS BREAKDOWN =====
    if (Object.keys(data.statusBreakdown).length > 0) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('LEAD STATUS BREAKDOWN', 15, yPos)

        yPos += 6

        const statusData = Object.entries(data.statusBreakdown).map(([status, count]) => [
            status.replace('_', ' ').toUpperCase(),
            count.toString(),
            `${((count / data.totalEnquiries) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count', 'Percentage']],
            body: statusData,
            theme: 'plain',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [30, 58, 138] },
                1: { halign: 'center' },
                2: { halign: 'right', textColor: [13, 148, 136] }
            },
            margin: { left: 15, right: 15 }
        })

        yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 15
    }

    // ===== RECENT ENQUIRIES =====
    if (data.recentEnquiries.length > 0 && yPos < pageHeight - 65) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('RECENT LEADS', 15, yPos)

        yPos += 6

        const enquiriesData = data.recentEnquiries.map(e => [
            formatDateTime(e.created_at),
            e.customer_name || 'N/A',
            e.product_name || '-',
            e.status ? e.status.replace('_', ' ').toUpperCase() : '-'
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Customer', 'Interest', 'Status']],
            body: enquiriesData,
            theme: 'plain',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { textColor: [71, 85, 105] },
                1: { fontStyle: 'bold', textColor: [30, 58, 138] },
                3: { halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        })
    }

    // Professional Footer
    renderFooter(doc, pageWidth, pageHeight, data.businessName, `Total Leads: ${data.totalEnquiries}`)

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
}

async function generateProductSummary(doc: any, data: ProductSummaryData, startY: number, pageWidth: number, pageHeight: number, filename: string) {
    const autoTable = (await import('jspdf-autotable')).default
    const navy: [number, number, number] = [30, 58, 138]
    const teal: [number, number, number] = [13, 148, 136]
    const slate: [number, number, number] = [71, 85, 105]
    const borderGray: [number, number, number] = [226, 232, 240]

    let yPos = startY

    // ===== METRICS =====
    const metrics = [
        { label: 'Total Products', value: data.totalProducts.toString(), color: navy },
        { label: 'Stock Value', value: `Rs. ${data.totalStockValue.toLocaleString('en-IN')}`, color: teal },
        { label: 'Total Items', value: data.totalItems.toString(), color: slate },
    ]

    const boxWidth = 55
    const boxHeight = 25
    const spacing = 10
    const startX = 15

    metrics.forEach((metric, index) => {
        const x = startX + (boxWidth + spacing) * index
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'F')
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
        doc.roundedRect(x, yPos, boxWidth, 3, 2, 2, 'F')
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
        doc.setLineWidth(0.3)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'S')

        doc.setFontSize(8)
        doc.setTextColor(slate[0], slate[1], slate[2])
        doc.text(metric.label, x + 5, yPos + 10)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2])
        doc.text(metric.value, x + 5, yPos + 18)
    })

    yPos += 35

    // ===== PRODUCT TABLE =====
    if (data.products.length > 0) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('TOP PRODUCTS INVENTORY', 15, yPos)
        yPos += 6

        const tableData = data.products.map(p => [
            p.name,
            (p.stock_quantity || 0).toString(),
            `Rs. ${p.cost_price.toLocaleString('en-IN')}`,
            p.stock_status.replace('_', ' ').toUpperCase()
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Product', 'Qty', 'Cost', 'Status']],
            body: tableData,
            theme: 'plain',
            headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontSize: 9, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
            columnStyles: { 0: { fontStyle: 'bold', textColor: [30, 58, 138] } },
            margin: { left: 15, right: 15 }
        })
    }

    renderFooter(doc, pageWidth, pageHeight, data.businessName, `Total Stock Value: Rs. ${data.totalStockValue.toLocaleString('en-IN')}`)
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
}

async function generateCustomerSummary(doc: any, data: CustomerSummaryData, startY: number, pageWidth: number, pageHeight: number, filename: string) {
    const autoTable = (await import('jspdf-autotable')).default
    const navy: [number, number, number] = [30, 58, 138]
    const teal: [number, number, number] = [13, 148, 136]
    const slate: [number, number, number] = [71, 85, 105]
    const borderGray: [number, number, number] = [226, 232, 240]

    let yPos = startY

    // ===== METRICS =====
    const metrics = [
        { label: 'Total Customers', value: data.totalCustomers.toString(), color: navy },
        { label: 'Total Spend', value: `Rs. ${data.totalSpend.toLocaleString('en-IN')}`, color: teal },
    ]

    const boxWidth = 80
    const boxHeight = 25
    const spacing = 10
    const startX = 15

    metrics.forEach((metric, index) => {
        const x = startX + (boxWidth + spacing) * index
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'F')
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
        doc.roundedRect(x, yPos, boxWidth, 3, 2, 2, 'F')
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
        doc.setLineWidth(0.3)
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'S')

        doc.setFontSize(8)
        doc.setTextColor(slate[0], slate[1], slate[2])
        doc.text(metric.label, x + 5, yPos + 10)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2])
        doc.text(metric.value, x + 5, yPos + 18)
    })

    yPos += 35

    // ===== TOP CUSTOMERS TABLE =====
    if (data.topCustomers.length > 0) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(navy[0], navy[1], navy[2])
        doc.text('TOP CUSTOMERS BY SPEND', 15, yPos)
        yPos += 6

        const tableData = data.topCustomers.map(c => [
            c.name,
            (c.total_orders || 0).toString(),
            `Rs. ${(c.total_spent || 0).toLocaleString('en-IN')}`,
            c.city || '-'
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Customer', 'Orders', 'Total Spent', 'City']],
            body: tableData,
            theme: 'plain',
            headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontSize: 9, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
            columnStyles: { 0: { fontStyle: 'bold', textColor: [30, 58, 138] } },
            margin: { left: 15, right: 15 }
        })
    }

    renderFooter(doc, pageWidth, pageHeight, data.businessName, `Total Customers: ${data.totalCustomers}`)
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
}

function renderFooter(doc: any, pageWidth: number, pageHeight: number, businessName: string | undefined, rightText: string) {
    // Professional Color Palette
    const navy: [number, number, number] = [30, 58, 138]
    const slate: [number, number, number] = [71, 85, 105]
    const borderGray: [number, number, number] = [226, 232, 240]

    // ===== PROFESSIONAL FOOTER =====
    const footerY = pageHeight - 15

    // Footer background
    doc.setFillColor(248, 250, 252)
    doc.rect(0, footerY - 8, pageWidth, 23, 'F')

    // Top border
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.5)
    doc.line(0, footerY - 8, pageWidth, footerY - 8)

    doc.setFontSize(7)
    doc.setTextColor(slate[0], slate[1], slate[2])
    doc.setFont('helvetica', 'normal')

    // Left: Page number
    doc.text('Page 1 of 1', 15, footerY)

    // Center: Generation time
    doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, footerY, { align: 'center' })

    // Right: Custom text (Total Orders/Leads)
    doc.text(rightText, pageWidth - 15, footerY, { align: 'right' })

    // Company tagline
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(navy[0], navy[1], navy[2])
    doc.text(`${businessName || 'Business'} Report`, pageWidth / 2, footerY + 5, { align: 'center' })
}