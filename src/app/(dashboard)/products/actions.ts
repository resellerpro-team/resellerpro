'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  cost_price: z.coerce.number().min(0, 'Cost price must be a positive number.'),
  selling_price: z.coerce.number().min(0, 'Selling price must be a positive number.'),
  category: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.coerce.number().min(0).default(0),
  stock_status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).default('in_stock'),
})

export type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function createProduct(
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
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    cost_price: formData.get('cost_price'),
    selling_price: formData.get('selling_price'),
    category: formData.get('category'),
    description: formData.get('description'),
    sku: formData.get('sku'),
    stock_quantity: formData.get('stock_quantity'),
    stock_status: formData.get('stock_status'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please fix errors.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // Upload multiple images
    const imageUrls: string[] = []
    const uploadErrors: string[] = []
    
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`) as File | null
      
      if (file && file.size > 0) {
        console.log(`Uploading image ${i}:`, file.name, file.size)
        
        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error(`Upload error for image ${i}:`, uploadError)
          uploadErrors.push(`Image ${i + 1}: ${uploadError.message}`)
          continue
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        console.log(`Image ${i} uploaded successfully:`, publicUrlData.publicUrl)
        imageUrls.push(publicUrlData.publicUrl)
      }
    }

    // If no images uploaded successfully, warn but continue
    if (imageUrls.length === 0 && uploadErrors.length > 0) {
      console.warn('No images uploaded:', uploadErrors)
    }

    console.log('Total images uploaded:', imageUrls.length)
    console.log('Image URLs:', imageUrls)

    // Insert into database
    const { data: newProduct, error: dbError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: validatedFields.data.name,
        description: validatedFields.data.description || null,
        category: validatedFields.data.category || null,
        sku: validatedFields.data.sku || null,
        cost_price: validatedFields.data.cost_price,
        selling_price: validatedFields.data.selling_price,
        stock_quantity: validatedFields.data.stock_quantity,
        stock_status: validatedFields.data.stock_status,
        image_url: imageUrls[0] || null, // Main image
        images: imageUrls.length > 0 ? imageUrls : null, // All images
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      
      // Cleanup uploaded images if database insert fails
      for (const url of imageUrls) {
        const path = url.split('/product-images/')[1]
        if (path) {
          await supabase.storage.from('product-images').remove([path])
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to create product: ' + dbError.message 
      }
    }

    console.log('Product created successfully:', newProduct)

    revalidatePath('/products')

    return {
      success: true,
      message: `Product "${validatedFields.data.name}" created successfully! ${
        uploadErrors.length > 0 
          ? `(${uploadErrors.length} image(s) failed to upload)` 
          : ''
      }`,
    }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      message: 'Unexpected error: ' + error.message,
    }
  }
}

// get all products
export async function getProducts(search?: string, category?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { products: [], stats: { total: 0, value: 0, avgMargin: 0 } }

  // Base query
  let query = supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Only apply search if not empty
  if (search && search.trim().length > 0) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  // Only apply category if not "all" or empty
  if (category && category !== 'all' && category.trim().length > 0) {
    query = query.eq('category', category)
  }

  const { data: products, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], stats: { total: 0, value: 0, avgMargin: 0 } }
  }

  // Compute stats
  const total = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.selling_price ?? 0), 0)
  const avgMargin =
    products.length > 0
      ? (
          products.reduce((sum, p) => {
            const margin = ((p.selling_price - p.cost_price) / p.selling_price) * 100
            return sum + margin
          }, 0) / products.length
        ).toFixed(1)
      : 0

  return {
    products,
    stats: {
      total,
      value: totalValue,
      avgMargin,
    },
  }
}



// --- Update Product ---
export async function updateProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Extend schema for update
  const ProductUpdateSchema = ProductSchema.extend({
    id: z.string().uuid('Invalid product ID.'),
  })

  // Validate inputs
  const validated = ProductUpdateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    cost_price: formData.get('cost_price'),
    selling_price: formData.get('selling_price'),
    category: formData.get('category'),
    description: formData.get('description'),
    stock_status: formData.get('stock_status'),
  })

  if (!validated.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { id, ...data } = validated.data

  // Handle optional image upload
  const file = formData.get('image') as File | null
  let image_url: string | null = null

  if (file && file.size > 0) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'Authentication required.' }
    }

    const filePath = `products/${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return { success: false, message: 'Failed to upload image.' }
    }

    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    image_url = publicUrl.publicUrl
  }

  // Update product in Supabase
  const { error } = await supabase
    .from('products')
    .update({
      ...data,
      ...(image_url ? { image_url } : {}),
    })
    .eq('id', id)

  if (error) {
    console.error('Supabase update error:', error)
    return { success: false, message: 'Database update failed.' }
  }

  revalidatePath(`/products/${id}`)
  revalidatePath('/products')

  return {
    success: true,
    message: `Product "${data.name}" updated successfully!`,
  }
}
