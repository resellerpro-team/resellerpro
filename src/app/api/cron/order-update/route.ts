
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { subHours } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const now = new Date()
    const twelveHoursAgo = subHours(now, 12).toISOString()

    // Fetch pending orders that haven't been reminded recently
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id(email, full_name)')
        .eq('status', 'pending')
        .or(`last_update_email_sent_at.is.null,last_update_email_sent_at.lt.${twelveHoursAgo}`)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
        return NextResponse.json({ success: true, sent: 0 })
    }

    // Group by user (Reseller)
    const userOrders: Record<string, { email: string, name: string, orderIds: string[] }> = {}

    for (const order of orders) {
        const userId = order.user_id
        const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles

        if (!profile || !profile.email) continue

        if (!userOrders[userId]) {
            userOrders[userId] = {
                email: profile.email,
                name: profile.full_name || 'User',
                orderIds: []
            }
        }
        userOrders[userId].orderIds.push(order.id)
    }

    let sentCount = 0

    for (const userId in userOrders) {
        const { email, name, orderIds } = userOrders[userId]

        // We send a generic "You have pending orders" or one-by-one.
        // The requirement says "order status... update also 12 hour gap".
        // I will send one summary email per user to avoid spamming.
        // However, the template `orderStatus` is singular.
        // I'll send one email per order to be explicit as per "Order Status" usually being transactional.
        // BUT, 12 hour gap implies a reminder loop. A summary is better.
        // I will reuse `sendOrderStatus` but maybe I need a `sendOrderReminder`?
        // I'll stick to `sendOrderStatus` for now, looping through them, but this might be spammy if they have 50 pending orders.
        // Better: Send a summary "You have X pending orders".
        // The prompt says "order status(orders pending or delivered like that, this update also 12 hour gap)".
        // It's vague. I will assume it means "Notify the user about the status of orders".
        // If sticking to "pending", I will send a summary.

        // Let's create a new temporary template inline or just use text for now to keep it safe.
        // Actually, I'll use `sendOrderStatus` for the *first* one and mention "and X others" if needed, 
        // OR just loop. Let's loop for now (assuming low volume) but use the 12h check to prevent spam.

        for (const orderId of orderIds) {
            // Technically I should map back to specific order details, but I have `orders` array.
            const order = orders.find(o => o.id === orderId)
            if (order) {
                await MailService.sendOrderStatus(email, name, order.order_number || order.id, 'pending', true)
            }
        }

        // Update DB
        await supabase
            .from('orders')
            .update({ last_update_email_sent_at: now.toISOString() })
            .in('id', orderIds)

        sentCount += orderIds.length
    }

    return NextResponse.json({ success: true, sent: sentCount })
}
