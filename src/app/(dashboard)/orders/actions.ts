'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canCreateOrder } from '../settings/subscription/actions'


// Define allowed status transitions
const STATUS_FLOW: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Final state
  cancelled: [], // Final state
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  const { allowed, reason } = await canCreateOrder()
  if (!allowed) {
    return {
      success: false,
      message: reason || 'Cannot create order. Please check your subscription.',
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

    // Create the main order record
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
        status: 'pending', // Default status
      })
      .select('id, order_number')
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      return {
        success: false,
        message: `Database error: ${orderError.message}`,
      }
    }

    if (!newOrder) {
      return { success: false, message: 'Failed to create order' }
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
      console.error('❌ Order items error:', itemsError)

      // Rollback: Delete the order
      await supabase.from('orders').delete().eq('id', newOrder.id)

      return {
        success: false,
        message: `Failed to add items: ${itemsError.message}`,
      }
    }

    // Revalidate pages
    revalidatePath('/orders')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Order #${newOrder.order_number} created successfully!`,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    }
  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
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

  const {
    data: { user },
  } = await supabase.auth.getUser()
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
        message: `Cannot change status from "${currentStatus}" to "${newStatus}". ${
          allowedStatuses.length > 0 
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
      console.error('Error inserting status history:', historyError)
      // Don't fail the update for this
    }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()
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