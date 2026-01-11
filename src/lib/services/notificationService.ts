import { createClient } from '@/lib/supabase/server'

export type NotificationType =
    | 'enquiry_followup_due'
    | 'wallet_credited'
    | 'subscription_expiring_soon'
    | 'low_stock'
    | 'system_alert'

export type EntityType =
    | 'enquiry'
    | 'product'
    | 'wallet'
    | 'subscription'
    | 'system'

export type Priority = 'high' | 'normal' | 'low'

export interface CreateNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    entityType?: EntityType
    entityId?: string
    priority?: Priority
}

/**
 * Creates a notification in the database.
 * This service is designed to be used server-side.
 * It fails silently (logs error) to not break core business flows.
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                entity_type: params.entityType,
                entity_id: params.entityId,
                priority: params.priority || 'normal',
            })

        if (error) {
            console.error('[NotificationService] Failed to create notification:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error('[NotificationService] Unexpected error creating notification:', error)
        return { success: false, error }
    }
}

/**
 * Marks a notification as read for a specific user.
 */
export async function markAsRead(notificationId: string, userId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .eq('user_id', userId)

        if (error) {
            console.error('[NotificationService] Failed to mark as read:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error('[NotificationService] Unexpected error marking as read:', error)
        return { success: false, error }
    }
}

/**
 * Marks all notifications as read for a specific user.
 */
export async function markAllAsRead(userId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) {
            console.error('[NotificationService] Failed to mark all as read:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error('[NotificationService] Unexpected error marking all as read:', error)
        return { success: false, error }
    }
}

/**
 * Checks and triggers notifications for due follow-ups and expiring subscriptions.
 */
export async function checkTimeBasedNotifications(userId: string) {
    try {
        const supabase = await createClient()
        const today = new Date().toISOString().split('T')[0]

        // 1. Check Enquiry Follow-ups (Due Today)
        const { data: dueEnquiries } = await supabase
            .from('enquiries')
            .select('id, customer_name, followup_date')
            .eq('user_id', userId)
            .lte('followup_date', today)
            .eq('followup_notified', false)
            .neq('status', 'converted')

        if (dueEnquiries && dueEnquiries.length > 0) {
            for (const enquiry of dueEnquiries) {
                const isOverdue = enquiry.followup_date < today

                await createNotification({
                    userId,
                    type: 'enquiry_followup_due',
                    title: isOverdue ? '⚠️ Overdue Follow-up' : 'Follow-up due',
                    message: isOverdue
                        ? `You missed a follow-up with ${enquiry.customer_name}`
                        : `Follow up with ${enquiry.customer_name}`,
                    entityType: 'enquiry',
                    entityId: enquiry.id,
                    priority: 'high',
                })

                await supabase
                    .from('enquiries')
                    .update({ followup_notified: true })
                    .eq('id', enquiry.id)
            }
        }

        // 2. Check Idle Enquiries (> 24h, status 'new', no followup_date)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: idleEnquiries } = await supabase
            .from('enquiries')
            .select('id, customer_name, created_at')
            .eq('user_id', userId)
            .eq('status', 'new')
            .is('followup_date', null)
            .lt('created_at', yesterday)
            .eq('followup_notified', false) // Reuse this flag or similar logic

        if (idleEnquiries && idleEnquiries.length > 0) {
            for (const enquiry of idleEnquiries) {
                await createNotification({
                    userId,
                    type: 'system_alert', // Use system_alert or new type
                    title: 'Unassigned Enquiry',
                    message: `Please set a follow-up for ${enquiry.customer_name}`,
                    entityType: 'enquiry',
                    entityId: enquiry.id,
                    priority: 'high',
                })

                // Mark as notified so we don't spam 24h checks
                await supabase
                    .from('enquiries')
                    .update({ followup_notified: true })
                    .eq('id', enquiry.id)
            }
        }

        // 2. Check Subscription Expiry (7, 3, 1 days)
        const now = new Date()
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('id, current_period_end, expiry_notified_at')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (subscription) {
            const expiryDate = new Date(subscription.current_period_end)
            const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            // Check if we should notify for 7, 3, or 1 days
            const notifyDays = [7, 3, 1]
            const lastNotifiedAt = subscription.expiry_notified_at ? new Date(subscription.expiry_notified_at) : null

            for (const days of notifyDays) {
                if (diffDays <= days && diffDays > 0) {
                    // Check if already notified for this "bucket" today or recently
                    // To keep it simple: if expiry_notified_at is null OR the gap is > some time
                    // or just check if diffDays has changed since last notification.
                    // For MVP, we'll just check if we haven't notified in the last 24 hours.
                    const hoursSinceLastNotify = lastNotifiedAt ? (now.getTime() - lastNotifiedAt.getTime()) / (1000 * 60 * 60) : 999

                    if (hoursSinceLastNotify > 24) {
                        await createNotification({
                            userId,
                            type: 'subscription_expiring_soon',
                            title: 'Subscription expiring soon',
                            message: `Your plan expires in ${diffDays} days`,
                            entityType: 'subscription',
                            entityId: subscription.id,
                            priority: 'high',
                        })

                        await supabase
                            .from('user_subscriptions')
                            .update({ expiry_notified_at: now.toISOString() })
                            .eq('id', subscription.id)

                        break // Only notify once per check
                    }
                }
            }
        }

        return { success: true }
    } catch (error) {
        console.error('[NotificationService] Error checking time-based notifications:', error)
        return { success: false, error }
    }
}
