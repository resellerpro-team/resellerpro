'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ========================================================
// 1. Zod Schemas for Data Validation
// ========================================================

// Schema for creating a new order
const CreateOrderSchema = z.object({
  customerId: z.string().uuid({ message: 'A valid customer must be selected.' }),
  items: z.string().min(1, { message: 'Order must have at least one item.' }), // Will be a JSON string
  paymentStatus: z.enum(['pending', 'paid', 'cod']),
  notes: z.string().optional(),
})

// Schema for updating an order's status
const UpdateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
})

// ========================================================
// 2. Type Definition for Form State
// ========================================================

export type OrderFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  orderId?: string;
}

// ========================================================
// 3. SERVER ACTION: CREATE A NEW ORDER
// ========================================================
export async function createOrder(
  prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const supabase = createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  // Validate form data
  const validatedFields = CreateOrderSchema.safeParse({
    customerId: formData.get('customerId'),
    items: formData.get('items'),
    paymentStatus: formData.get('paymentStatus'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { customerId, items: itemsJson, paymentStatus, notes } = validatedFields.data
  const items = JSON.parse(itemsJson)

  try {
    // Calculate totals on the server for security
    let subtotal = 0
    let totalCost = 0
    for (const item of items) {
      subtotal += item.unitPrice * item.quantity
      totalCost += item.unitCost * item.quantity
    }
    const totalAmount = subtotal // Assuming no shipping/discount for simplicity

    // --- Database Transaction ---
    // Create the main order record
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        subtotal,
        total_amount: totalAmount,
        total_cost: totalCost,
        payment_status: paymentStatus,
        notes: notes,
        // The `order_number` will be set automatically by the database trigger
      })
      .select('id, order_number') // Select the ID and number of the new order
      .single()

    if (orderError) throw orderError
    if (!newOrder) throw new Error('Failed to create order record.')

    // Prepare and insert the items linked to the new order
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName, // Should be fetched or passed securely
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)
    if (itemsError) throw itemsError

    // --- Success ---
    // Invalidate cache to show the new order in the list
    revalidatePath('/orders')
    revalidatePath('/dashboard')

    // Return success state. We don't redirect, so the UI can show a success message or a share dialog.
    return {
      success: true,
      message: `Order #${newOrder.order_number} created successfully!`,
      orderId: newOrder.id,
    }
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error.message}` }
  }
}


// ========================================================
// 4. SERVER ACTION: UPDATE ORDER STATUS
// ========================================================
export async function updateOrderStatus(
  prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Authentication required.' }

  const validatedFields = UpdateStatusSchema.safeParse({
    orderId: formData.get('orderId'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data.' }
  }

  const { orderId, status } = validatedFields.data

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', orderId)
      .eq('user_id', user.id) // Security check: user can only update their own orders

    if (error) throw error

    // Revalidate the pages where this order might be visible
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true, message: `Order status updated to "${status}".` }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ========================================================
// 5. DATA FETCHING FUNCTIONS (for use in Server Components)
// ========================================================

/**
 * Fetches all orders for the logged-in user.
 */
export async function getOrders(filters: { status?: string } = {}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('orders')
    .select(`*, customers(name)`) // Select related customer name
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching orders:', error.message)
    return []
  }
  return data
}

/**
 * Fetches a single order by its ID for the logged-in user.
 */
export async function getOrderDetails(orderId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('orders')
    .select(`*, customers(*), order_items(*)`)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching order details:', error.message)
    return null
  }
  return data
}