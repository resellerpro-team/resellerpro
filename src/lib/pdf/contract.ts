
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface ContractData {
    userName: string
    planName: string
    amount: number
    startDate: string
    endDate: string
}

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Define Colors
    const primaryColor = rgb(0.1, 0.4, 0.8) // Brand Blue
    const lightBg = rgb(0.97, 0.98, 1.0) // Very light blue tinge for box
    const borderColor = rgb(0.85, 0.9, 0.95) // Subtle border
    const labelColor = rgb(0.4, 0.4, 0.4) // Dark Gray for labels
    const black = rgb(0, 0, 0)
    const footerColor = rgb(0.6, 0.6, 0.6)

    // --- HEADER ---
    page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: primaryColor
    })

    page.drawText('RESELLER PRO', {
        x: 50,
        y: height - 60,
        size: 24,
        font: fontBold,
        color: rgb(1, 1, 1)
    })

    page.drawText('Official Subscription Contract', {
        x: 50,
        y: height - 85,
        size: 14,
        font: fontRegular,
        color: rgb(0.9, 0.9, 0.9)
    })

    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    page.drawText(`Generated: ${today}`, {
        x: width - 200,
        y: height - 60,
        size: 10,
        font: fontRegular,
        color: rgb(1, 1, 1)
    })

    // --- SUBSCRIBER INFO SECTION ---
    let y = height - 160

    page.drawText('SUBSCRIBER INFORMATION', {
        x: 50,
        y,
        size: 10,
        font: fontBold,
        color: labelColor
    })

    y -= 10

    // Container Box Dimensions
    const boxHeight = 200 // Increased slightly to prevent cramped look
    const boxTop = y
    const boxWidth = width - 100

    // Draw Background Box (Main Frame)
    page.drawRectangle({
        x: 50,
        y: boxTop - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: lightBg,
        borderColor: borderColor,
        borderWidth: 1.5, // Slightly clearer border
    })

    // Helper for "Field" inside the box
    const drawField = (label: string, value: string, x: number, y: number) => {
        page.drawText(label.toUpperCase(), { x, y, size: 8, font: fontRegular, color: labelColor })
        page.drawText(value, { x, y: y - 18, size: 14, font: fontBold, color: black })
    }

    // Row 1: Subscriber Name
    // Box Top is at 'y' (approx height - 170). height=200.
    // Let's space headers at: Top-30, Top-90, Top-150
    let currentY = boxTop - 35
    drawField('Subscriber Name', data.userName, 70, currentY)

    // Divider Line 1
    currentY -= 35
    page.drawLine({
        start: { x: 50, y: currentY },
        end: { x: 50 + boxWidth, y: currentY },
        color: borderColor,
        thickness: 1
    })

    // Row 2: Plan & Amount
    currentY -= 30
    drawField('Subscription Plan', data.planName, 70, currentY)
    drawField('Amount Paid', `INR ${data.amount}`, 300, currentY)

    // Divider Line 2
    currentY -= 35
    page.drawLine({
        start: { x: 50, y: currentY },
        end: { x: 50 + boxWidth, y: currentY },
        color: borderColor,
        thickness: 1
    })

    // Row 3: Dates
    currentY -= 30
    drawField('Start Date', data.startDate, 70, currentY)
    drawField('Valid Until', data.endDate, 300, currentY)


    // --- TERMS & CONDITIONS ---
    y = boxTop - boxHeight - 50 // Ensures plenty of space after the box
    page.drawText('TERMS & CONDITIONS', {
        x: 50,
        y,
        size: 10,
        font: fontBold,
        color: labelColor
    })

    y -= 10
    // Header Line for Terms
    page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1,
        color: borderColor
    })

    y -= 25
    const terms = [
        '1. Subscription Access: This contract confirms your access to premium features.',
        '2. Non-Refundable: The subscription fee is non-refundable once processed.',
        '3. Expiry: Access will automatically be revoked on the "Valid Until" date unless renewed.',
        '4. Privacy: All user data is handled in accordance with our Privacy Policy.',
        '5. Support: For any billing discrepancies, please contact support@resellerpro.com.'
    ]

    for (const term of terms) {
        page.drawText(term, { x: 50, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) })
        y -= 15
    }

    // --- FOOTER ---
    const footerY = 40

    // Border above footer
    page.drawLine({
        start: { x: 50, y: footerY + 20 },
        end: { x: width - 50, y: footerY + 20 },
        color: borderColor,
        thickness: 1
    })

    const centerText = (text: string, font: any, size: number) => {
        const textWidth = font.widthOfTextAtSize(text, size)
        return (width - textWidth) / 2
    }

    const footerText = 'Generated by ResellerPro System'
    page.drawText(footerText, {
        x: centerText(footerText, fontRegular, 8),
        y: footerY,
        size: 8,
        font: fontRegular,
        color: footerColor
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
}
