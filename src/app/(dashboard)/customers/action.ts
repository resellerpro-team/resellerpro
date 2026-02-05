'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const optionalText = z.string().transform(v => v || '')

const CustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits.')
    .transform(val => val.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^[0-9]{10,15}$/, 'Invalid phone number format.')),
  whatsapp: optionalText.optional(),
  email: optionalText.optional(),
  address_line1: optionalText,
  address_line2: optionalText,
  city: optionalText,
  state: optionalText,
  pincode: optionalText,
  notes: optionalText,
})

export type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

// --- Create Customer ---
export async function createCustomer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  // --- CHECK LIMITS with Security Check ---
  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
  const subscription = await checkAndDowngradeSubscription(user.id)

  if (!subscription) return { success: false, message: 'Subscription record missing' }

  const { PLAN_LIMITS } = await import('@/config/pricing')
  const planData = subscription.plan
  const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free'
  const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planKey]

  if (limits.customers !== Infinity) {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_deleted', false) // Exclude deleted customers if soft-delete used

    if ((count || 0) >= limits.customers) {
      return {
        success: false,
        message: `You've reached your limit of ${limits.customers} customers on the ${planKey} plan. Upgrade to grow your business!`,
      }
    }
  }


  // Validate data
  const validatedFields = CustomerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    address_line1: formData.get('address_line1'),
    address_line2: formData.get('address_line2'),
    city: formData.get('city'),
    state: formData.get('state'),
    pincode: formData.get('pincode'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    console.error('Validation errors:', validatedFields.error.flatten())
    return {
      success: false,
      message: 'Invalid form data. Please fix errors.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Insert into database
  const { error } = await supabase.from('customers').insert({
    user_id: user.id,
    ...validatedFields.data,
  })

  if (error) {
    console.error('Supabase error:', error)
    // Handle unique constraint violation (duplicate phone)
    if (error.code === '23505') {
      return {
        success: false,
        message: 'A customer with this phone number already exists.',
        errors: { phone: ['This phone number is already registered.'] }
      }
    }
    return { success: false, message: 'Database Error: Failed to create customer.' }
  }

  revalidatePath('/customers')

  return {
    success: true,
    message: `Customer "${validatedFields.data.name}" added successfully!`,
  }
}

// --- Get All Customers ---
export async function getCustomers(search?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { customers: [], stats: { total: 0, totalSpent: 0, avgOrders: 0 } }

  // Base query
  let query = supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .eq("is_deleted", false)
    .order('created_at', { ascending: false })

  // Apply search filter if provided
  if (search && search.trim().length > 0) {
    query = query.or(`name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`)
  }

  const { data: customers, error } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return { customers: [], stats: { total: 0, totalSpent: 0, avgOrders: 0 } }
  }

  // Compute stats
  const total = customers.length
  const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent ?? 0), 0)
  const avgOrders =
    customers.length > 0
      ? (customers.reduce((sum, c) => sum + (c.total_orders ?? 0), 0) / customers.length).toFixed(1)
      : 0

  return {
    customers,
    stats: {
      total,
      totalSpent,
      avgOrders,
    },
  }
}

// --- Update Customer ---
export async function updateCustomer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const CustomerUpdateSchema = CustomerSchema.extend({
    id: z.string().uuid('Invalid customer ID.'),
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  // --- SECURITY CHECK ---
  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
  const subscription = await checkAndDowngradeSubscription(user.id)

  if (!subscription) return { success: false, message: 'Subscription record missing' }

  // Validate inputs
  const validated = CustomerUpdateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    address_line1: formData.get('address_line1'),
    address_line2: formData.get('address_line2'),
    city: formData.get('city'),
    state: formData.get('state'),
    pincode: formData.get('pincode'),
    notes: formData.get('notes'),
  })

  if (!validated.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { id, ...data } = validated.data

  // Update customer in Supabase
  const { error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Supabase update error:', error)
    if (error.code === '23505') {
      return {
        success: false,
        message: 'A customer with this phone number already exists.',
        errors: { phone: ['This phone number is already registered.'] }
      }
    }
    return { success: false, message: 'Database update failed.' }
  }

  revalidatePath(`/customers/${id}`)
  revalidatePath('/customers')

  return {
    success: true,
    message: `Customer "${data.name}" updated successfully!`,
  }
}


// --- Get Single Customer ---
export async function getCustomer(customerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return customer
}

// --- Get Customer Orders ---
export async function getCustomerOrders(customerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }

  return orders
}

// --- Delete Customer ---
export async function deleteCustomer(customerId: string): Promise<FormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  // --- SECURITY CHECK ---
  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
  const subscription = await checkAndDowngradeSubscription(user.id)

  if (!subscription) return { success: false, message: 'Subscription record missing' }

  // Check customer's orders that are NOT delivered/cancelled
  const { data: activeOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .not('status', 'in', '("delivered","cancelled")')  // NOT allowed for delete

  if (ordersError) {
    console.error('Order check error:', ordersError)
    return { success: false, message: 'Failed to check customer orders.' }
  }

  // If any active orders exist → block deletion
  if (activeOrders && activeOrders.length > 0) {
    return {
      success: false,
      message: 'Customer cannot be deleted until all orders are delivered or cancelled.',
    }
  }

  // Otherwise → Soft delete customer
  const { error } = await supabase
    .from('customers')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    })
    .eq('id', customerId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete error:', error)
    return { success: false, message: 'Failed to delete customer.' }
  }

  revalidatePath('/customers')

  return {
    success: true,
    message: 'Customer deleted successfully.',
  }
}
// --- Get Customer By Phone ---
export async function getCustomerByPhone(phone: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .eq('phone', phone)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
      console.error('Error fetching customer by phone:', error)
    }
    return null
  }

  return customer
}
