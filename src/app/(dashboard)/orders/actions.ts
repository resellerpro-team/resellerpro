'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canCreateOrder } from '../settings/subscription/actions';

// ========================================================
// SERVER ACTION: CREATE A NEW ORDER
// ========================================================
export async function createOrder(p0: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  const { allowed, reason } = await canCreateOrder()
  if (!allowed) {
    return { 
      success: false, 
      message: reason || 'Cannot create order. Please check your subscription.' 
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
    const notes = formData.get('notes') as string || ''
    const subtotal = parseFloat(formData.get('subtotal') as string)
    const totalAmount = parseFloat(formData.get('totalAmount') as string)
    const totalCost = parseFloat(formData.get('totalCost') as string)

    // Debug logs
    console.log('📝 Order Data:', {
      customerId,
      paymentStatus,
      paymentMethod,
      discount,
      shippingCost,
      subtotal,
      totalAmount,
      totalCost,
      itemsCount: itemsJson ? JSON.parse(itemsJson).length : 0
    })

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
      })
      .select('id, order_number')
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      return { 
        success: false, 
        message: `Database error: ${orderError.message}` 
      }
    }

    if (!newOrder) {
      return { success: false, message: 'Failed to create order' }
    }

    console.log('✅ Order created:', newOrder)

    // Prepare order items
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_selling_price: item.unitPrice,
      unit_cost_price: item.unitCost,
    }))

    console.log('📦 Creating order items:', orderItemsData.length)

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
        message: `Failed to add items: ${itemsError.message}` 
      }
    }

    console.log('✅ Order items created')

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
      message: `Error: ${error.message || 'Something went wrong'}` 
    }
  }
}
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  try {
    const orderId = formData.get('orderId') as string
    const status = formData.get('status') as string
    const courierService = formData.get('courierService') as string
    const trackingNumber = formData.get('trackingNumber') as string

    if (!orderId || !status) {
      return { success: false, message: 'Invalid data.' }
    }

    // Prepare update data
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    }

    // Add delivery timestamp if status is delivered
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Add tracking info if provided
    if (courierService) {
      updateData.courier_service = courierService
    }
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating order status:', error)
      return { success: false, message: error.message }
    }

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { 
      success: true, 
      message: `Order status updated to "${status}".` 
    }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return { 
      success: false, 
      message: error.message || 'Failed to update status' 
    }
  }

}