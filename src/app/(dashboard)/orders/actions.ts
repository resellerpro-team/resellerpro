'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ========================================================
// 1. Zod Schemas for Data Validation
// ========================================================

// Schema for creating a new order
const CreateOrderSchema = z.object({
  customerId: z.string().uuid({ message: 'A valid customer must be selected.' }),
  items: z.string().min(1, { message: 'Order must have at least one item.' }),
  paymentStatus: z.enum(['pending', 'paid', 'cod']),
  paymentMethod: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
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
  success: boolean
  message: string
  errors?: Record<string, string[] | undefined>
  orderId?: string
  orderNumber?: number
}

// ========================================================
// 3. SERVER ACTION: CREATE A NEW ORDER
// ========================================================
export async function createOrder(
  prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const supabase = await createClient()

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
    paymentMethod: formData.get('paymentMethod'),
    discount: formData.get('discount'),
    shippingCost: formData.get('shippingCost'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { customerId, items: itemsJson, paymentStatus, paymentMethod, discount, shippingCost, notes } = validatedFields.data
  
  let items
  try {
    items = JSON.parse(itemsJson)
  } catch (error) {
    return { success: false, message: 'Invalid items data.' }
  }

  try {
    // Calculate totals on the server for security
    let subtotal = 0
    let totalCost = 0
    for (const item of items) {
      subtotal += item.unitPrice * item.quantity
      totalCost += item.unitCost * item.quantity
    }
    const totalAmount = subtotal + shippingCost - discount

    // --- Database Transaction ---
    // Create the main order record
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        subtotal,
        delivery_charge: shippingCost,
        discount,
        total_amount: totalAmount,
        total_cost: totalCost,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes: notes,
      })
      .select('id, order_number')
      .single()

    if (orderError) throw orderError
    if (!newOrder) throw new Error('Failed to create order record.')

    // Prepare and insert the items linked to the new order
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)
    if (itemsError) throw itemsError

    // --- Success ---
    revalidatePath('/orders')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Order #${newOrder.order_number} created successfully!`,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    }
  } catch (error: any) {
    console.error('Order creation error:', error)
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
  const supabase = await createClient()
  
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
      .eq('user_id', user.id)

    if (error) throw error

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

export async function getOrders(filters: { status?: string } = {}) {
  const supabase = await createClient()
  
  // ✅ Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        phone
      )
    `)
    .eq('user_id', user.id) // ✅ Important: Filter by user
    .order('created_at', { ascending: false })
    .limit(50)
  
  // Apply status filter if provided
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching orders:', error.message)
    return []
  }
  
  return data || []
}

export async function getOrderDetails(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*),
      order_items (*)
    `)
    .eq('id', orderId)
    .eq('user_id', user.id) // ✅ Security: Only fetch user's own orders
    .single()

  if (error) {
    console.error('Error fetching order details:', error.message)
    return null
  }
  return data
}

// Get all customers (for order form)
export async function getCustomersForOrder() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  return data || []
}

// Get all products (for order form)
export async function getProductsForOrder() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('products')
    .select('id, name, selling_price, cost_price, stock_status')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

