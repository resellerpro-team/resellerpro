'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/services/notificationService'

// Define allowed status transitions
const STATUS_FLOW: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Final state
  cancelled: [], // Final state
}

// ========================================================
// HELPER: Check if user can create order
// ========================================================
async function canCreateOrder() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return { allowed: false, reason: 'No active subscription found' }
  }

  const orderLimit = subscription.plan?.order_limit

  // If unlimited (null), allow
  if (!orderLimit) {
    return { allowed: true }
  }

  // Check current month usage
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const { count: ordersThisMonth } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', periodStart.toISOString())

  const currentCount = ordersThisMonth || 0

  if (currentCount >= orderLimit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${orderLimit} orders. Please upgrade your plan to continue.`,
    }
  }

  return { allowed: true }
}

// ========================================================
// SERVER ACTION: CREATE A NEW ORDER
// ========================================================
export async function createOrder(
  prevState: { success: boolean; message: string },
  formData: FormData
) {

  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  // Check subscription limits BEFORE creating order
  const orderCheck = await canCreateOrder()

  if (!orderCheck.allowed) {
    return {
      success: false,
      message: orderCheck.reason || 'Cannot create order. Please check your subscription.',
    }
  }

  try {
    // Extract form data
    const customerId = formData.get('customerId') as string
    const itemsJson = formData.get('items') as string
    const paymentStatus = formData.get('paymentStatus') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const discount = parseFloat(formData.get('discount') as string) || 0
    const shippingCost = parseFloat(formData.get('shippingCost') as string) || 0
    const notes = (formData.get('notes') as string) || ''
    const subtotal = parseFloat(formData.get('subtotal') as string)
    const totalAmount = parseFloat(formData.get('totalAmount') as string)
    const totalCost = parseFloat(formData.get('totalCost') as string)


    // Validation
    if (!customerId) {
      return { success: false, message: 'Please select a customer' }
    }

    if (!itemsJson) {
      return { success: false, message: 'Please add at least one product' }
    }

    let items
    try {
      items = JSON.parse(itemsJson)
    } catch (e) {
      console.error('❌ JSON parse error:', e)
      return { success: false, message: 'Invalid items data' }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: 'Please add at least one product' }
    }

    if (!paymentStatus) {
      return { success: false, message: 'Please select payment status' }
    }

    if (isNaN(subtotal) || isNaN(totalAmount) || isNaN(totalCost)) {
      return { success: false, message: 'Invalid pricing data' }
    }


    // INSERT ORDER - WITH .select().single() TO GET THE CREATED ORDER!
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        subtotal: subtotal,
        discount: discount,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        total_cost: totalCost,
        payment_status: paymentStatus,
        payment_method: paymentMethod || null,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single()


    if (orderError) {
      console.error('Order creation error:', JSON.stringify(orderError, null, 2))
      return {
        success: false,
        message: `Database error: ${orderError.message || 'Unknown error'}`,
      }
    }

    if (!newOrder) {
      console.error(' No order returned from database')
      return { success: false, message: 'Failed to create order - no data returned' }
    }

    // Prepare order items
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_selling_price: item.unitPrice,
      unit_cost_price: item.unitCost,
    }))

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) {
      console.error('Order items error:', JSON.stringify(itemsError, null, 2))

      // Rollback: Delete the order
      await supabase.from('orders').delete().eq('id', newOrder.id)

      return {
        success: false,
        message: `Failed to add items: ${itemsError.message}`,
      }
    }

    // --- Deduct Stock & Check Low Stock ---
    try {
      for (const item of items) {
        if (!item.productId) continue

        const { data: newQuantity, error: stockError } = await supabase
          .rpc('deduct_product_stock', {
            p_product_id: item.productId,
            p_quantity: item.quantity,
          })

        if (stockError) {
          console.error(`⚠️ Failed to deduct stock for product ${item.productId}:`, stockError)
          continue
        }

        // Trigger LOW_STOCK notification if quantity <= 5
        if (newQuantity !== null && newQuantity <= 5) {
          await createNotification({
            userId: user.id,
            type: 'low_stock',
            title: 'Low stock alert',
            message: `${item.productName} is running low (${newQuantity} left)`,
            entityType: 'product',
            entityId: item.productId,
            priority: 'high',
          })
        }
      }
    } catch (stockError) {
      console.error('⚠️ Unexpected error during stock deduction:', stockError)
    }


    // Revalidate pages
    revalidatePath('/orders')
    revalidatePath('/dashboard')
    revalidatePath('/settings/subscription')


    return {
      success: true,
      message: `Order #${newOrder.order_number} created successfully!`,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error: ${error.message || 'Something went wrong'}`,
    }
  }
}

// ========================================================
// SERVER ACTION: UPDATE ORDER STATUS (WITH VALIDATION)
// ========================================================
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  try {
    const orderId = formData.get('orderId') as string
    const newStatus = formData.get('status') as string
    const courierService = formData.get('courierService') as string
    const trackingNumber = formData.get('trackingNumber') as string
    const notes = formData.get('notes') as string

    if (!orderId || !newStatus) {
      return { success: false, message: 'Invalid data.' }
    }

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return { success: false, message: 'Order not found.' }
    }

    const currentStatus = order.status

    // Validate status transition
    const allowedStatuses = STATUS_FLOW[currentStatus] || []

    if (!allowedStatuses.includes(newStatus)) {
      const allowedLabels = allowedStatuses.map(s =>
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(', ')

      return {
        success: false,
        message: `Cannot change status from "${currentStatus}" to "${newStatus}". ${allowedStatuses.length > 0
          ? `Allowed transitions: ${allowedLabels}`
          : 'This order is in a final state and cannot be changed.'
          }`
      }
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    // Add delivery timestamp if status is delivered
    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Add tracking info if provided
    if (courierService) {
      updateData.courier_service = courierService
    }
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return { success: false, message: updateError.message }
    }

    // Insert status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: newStatus,
        notes: notes || null,
        courier_service: courierService || null,
        tracking_number: trackingNumber || null,
        changed_by: user.id,
      })

    if (historyError) {
      console.error('⚠️ Error inserting status history:', historyError)
    }

    // Revalidate pages
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: `Order #${order.order_number} status updated to "${newStatus}".`
    }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      message: error.message || 'Failed to update status',
    }
  }
}

// ========================================================
// HELPER: Get allowed next statuses for an order
// ========================================================
export async function getAllowedStatusTransitions(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, allowedStatuses: [] }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    return { success: false, allowedStatuses: [] }
  }

  const allowedStatuses = STATUS_FLOW[order.status] || []

  return {
    success: true,
    currentStatus: order.status,
    allowedStatuses
  }
}

// ========================================================
// SERVER ACTION: UPDATE PAYMENT STATUS
// ========================================================
export async function updatePaymentStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  try {
    const orderId = formData.get('orderId') as string
    const paymentStatus = formData.get('paymentStatus') as string
    const paymentMethod = formData.get('paymentMethod') as string

    if (!orderId || !paymentStatus) {
      return { success: false, message: 'Invalid data.' }
    }

    const updateData: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    }

    if (paymentMethod) {
      updateData.payment_method = paymentMethod
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating payment status:', error)
      return { success: false, message: error.message }
    }

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: `Payment status updated to "${paymentStatus}".`,
    }
  } catch (error: any) {
    console.error('Error updating payment status:', error)
    return {
      success: false,
      message: error.message || 'Failed to update payment status',
    }
  }
}

// ========================================================
// SERVER ACTION: DELETE ORDER
// ========================================================
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  try {

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting order:', error)

      // Trigger SYSTEM_ALERT
      await createNotification({
        userId: user.id,
        type: 'system_alert',
        title: 'System alert',
        message: `Failed to delete order: ${error.message}`,
        entityType: 'system',
        priority: 'high',
      })

      return { success: false, message: error.message }
    }

    revalidatePath('/orders')
    revalidatePath('/dashboard')
    revalidatePath('/settings/subscription')

    return {
      success: true,
      message: 'Order deleted successfully',
    }
  } catch (error: any) {
    console.error(' Error deleting order:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete order',
    }
  }
}

// ========================================================
// EXPORT: Check if user can create order (for UI)
// ========================================================
export { canCreateOrder }