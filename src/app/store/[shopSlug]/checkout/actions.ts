'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface PlaceOrderInput {
  storeUserId: string
  customer: {
    fullName: string
    phone: string
    email?: string | null
  }
  shipping: {
    addressLine1: string
    addressLine2?: string | null
    city: string
    state: string
    pincode: string
  }
  paymentMethod: 'cod' | 'upi'
  orderNotes?: string | null
  items: {
    productId: string
    name: string
    image: string | null
    price: number
    quantity: number
  }[]
  subtotal: number
  shippingFee: number
  total: number
}

export async function placeOrder(input: PlaceOrderInput) {
  const supabase = await createAdminClient()

  // 1. Fetch product prices and cost prices from DB to compute total_cost and validate subtotal
  const productIds = input.items.map((item) => item.productId)
  const { data: dbProducts, error: dbProductsError } = await supabase
    .from('products')
    .select('id, cost_price, selling_price')
    .in('id', productIds)

  if (dbProductsError) {
    console.error('Fetch products error:', dbProductsError)
    return { error: dbProductsError.message }
  }

  const costMap = new Map<string, number>()
  const priceMap = new Map<string, number>()
  dbProducts?.forEach((p) => {
    costMap.set(p.id, p.cost_price || 0)
    priceMap.set(p.id, p.selling_price || 0)
  })

  // Calculate total cost and subtotal on the server
  let totalCost = 0
  let serverSubtotal = 0
  input.items.forEach((item) => {
    const unitCost = costMap.get(item.productId) || 0
    const unitPrice = priceMap.get(item.productId) || 0
    totalCost += unitCost * item.quantity
    serverSubtotal += unitPrice * item.quantity
  })

  // Validate server calculated values against client values to prevent pricing tampering
  if (serverSubtotal !== input.subtotal) {
    return { error: 'Pricing mismatch detected. Please refresh your page and try again.' }
  }

  const serverShippingFee = serverSubtotal >= 500 ? 0 : 49
  if (serverShippingFee !== input.shippingFee) {
    return { error: 'Shipping fee mismatch detected. Please try again.' }
  }

  const serverTotal = serverSubtotal + serverShippingFee
  if (serverTotal !== input.total) {
    return { error: 'Order total mismatch detected. Please try again.' }
  }

  // 2. Find or create customer in CRM
  let customerId: string | null = null
  const rawPhone = input.customer.phone.replace(/\D/g, '')
  const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone

  try {
    // Search including soft-deleted customers to avoid unique constraint violations
    const { data: existingCustomer, error: customerSearchError } = await supabase
      .from('customers')
      .select('id, is_deleted')
      .eq('user_id', input.storeUserId)
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (customerSearchError) {
      console.error('Customer search error:', customerSearchError)
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
      if (existingCustomer.is_deleted) {
        // Reactivate soft-deleted customer and update their details
        const { error: reactivateError } = await supabase
          .from('customers')
          .update({
            is_deleted: false,
            deleted_at: null,
            name: input.customer.fullName,
            email: input.customer.email || null,
            address_line1: input.shipping.addressLine1,
            address_line2: input.shipping.addressLine2 || null,
            city: input.shipping.city,
            state: input.shipping.state,
            pincode: input.shipping.pincode,
          })
          .eq('id', existingCustomer.id)

        if (reactivateError) {
          console.error('Failed to reactivate customer:', reactivateError)
        }
      }
    } else {
      // Create new customer under the reseller
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from('customers')
        .insert({
          user_id: input.storeUserId,
          name: input.customer.fullName,
          phone: cleanPhone,
          whatsapp: cleanPhone, // default whatsapp to phone
          email: input.customer.email || null,
          address_line1: input.shipping.addressLine1,
          address_line2: input.shipping.addressLine2 || null,
          city: input.shipping.city,
          state: input.shipping.state,
          pincode: input.shipping.pincode,
        })
        .select('id')
        .single()

      if (customerCreateError) {
        console.error('Customer creation error:', customerCreateError)
      } else if (newCustomer) {
        customerId = newCustomer.id
      }
    }
  } catch (err) {
    console.error('Failed to link storefront guest order to customer:', err)
  }

  // 3. Insert order with total_cost (non-null constraint) and customer_id
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.storeUserId,
      customer_id: customerId,
      source: 'storefront',
      status: 'pending',
      customer_name: input.customer.fullName,
      customer_phone: input.customer.phone,
      customer_email: input.customer.email || null,
      shipping_name: input.customer.fullName,
      shipping_phone: input.customer.phone,
      shipping_line1: input.shipping.addressLine1,
      shipping_line2: input.shipping.addressLine2 || null,
      shipping_city: input.shipping.city,
      shipping_state: input.shipping.state,
      shipping_pincode: input.shipping.pincode,
      payment_method_v2: input.paymentMethod,
      payment_status_v2: 'pending',
      payment_method: input.paymentMethod,
      payment_status: 'unpaid',
      subtotal: input.subtotal,
      shipping_cost: input.shippingFee,
      total_amount: input.total,
      total_cost: totalCost,
      order_notes: input.orderNotes || null,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Order insert error:', orderError)
    return { error: orderError.message }
  }

  // 3. Insert order items (write to both legacy & new pricing/image fields)
  const orderItems = input.items.map((item) => {
    const unitCost = costMap.get(item.productId) || 0
    return {
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      unit_selling_price: item.price,
      unit_cost_price: unitCost,
    }
  })

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    console.error('Order items insert error:', itemsError)
    // Rollback the order if items fail to insert
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: itemsError.message }
  }

  return { orderId: order.id }
}
