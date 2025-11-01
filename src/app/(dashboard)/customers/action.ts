'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.').regex(/^[0-9]{10,15}$/, 'Invalid phone number format.'),
  whatsapp: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
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

  // Validate data
  const validatedFields = CustomerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    address_line1: formData.get('addressLine1'),
    address_line2: formData.get('addressLine2'),
    city: formData.get('city'),
    state: formData.get('state'),
    pincode: formData.get('pincode'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
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

  // Validate inputs
  const validated = CustomerUpdateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    address_line1: formData.get('addressLine1'),
    address_line2: formData.get('addressLine2'),
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

// --- Delete Customer ---
export async function deleteCustomer(customerId: string): Promise<FormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required.' }
  }

  const { error } = await supabase
    .from('customers')
    .delete()
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