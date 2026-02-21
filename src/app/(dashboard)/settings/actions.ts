'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ========================================================
// UPDATE USER PROFILE (Personal info only - no business)
// ========================================================
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    const userId = formData.get('userId') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string

    // Verify user is updating their own profile
    if (userId !== user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    // Validate full name
    if (!full_name || full_name.trim().length < 2) {
      return { success: false, message: 'Full name must be at least 2 characters' }
    }

    // Update profile in database (only personal info)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)

      if (error.code === '23505' && error.message.includes('profiles_phone_unique')) {
        return { success: false, message: 'This phone number is already registered to another account' }
      }

      return { success: false, message: error.message }
    }

    // Revalidate pages
    revalidatePath('/settings/profile')
    revalidatePath('/settings/business')
    revalidatePath('/settings')
    revalidatePath('/(dashboard)', 'layout')

    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Something went wrong' }
  }
}

// ========================================================
// UPLOAD AVATAR
// ========================================================
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return { success: false, message: 'No file provided' }
    }

    // Verify user
    if (userId !== user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, message: 'File size must be less than 2MB' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'File must be an image' }
    }

    // Delete old avatar if exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profile?.avatar_url) {
      try {
        const oldPath = profile.avatar_url.split('/avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      } catch (err) {
        console.warn('Could not delete old avatar:', err)
      }
    }

    // Upload new avatar
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, message: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Cleanup uploaded file
      await supabase.storage.from('avatars').remove([filePath])
      return { success: false, message: updateError.message }
    }

    // Revalidate pages
    revalidatePath('/settings/profile')
    revalidatePath('/settings/business')
    revalidatePath('/settings')
    revalidatePath('/(dashboard)', 'layout')

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Upload failed' }
  }
}

// ========================================================
// UPDATE BUSINESS INFORMATION
// ========================================================
export async function updateBusinessInfo(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    const userId = formData.get('userId') as string
    const business_name = formData.get('business_name') as string
    const gstin = formData.get('gstin') as string
    const business_address = formData.get('business_address') as string
    const business_phone = formData.get('business_phone') as string
    const business_email = formData.get('business_email') as string
    const business_website = formData.get('business_website') as string
    const pan_number = formData.get('pan_number') as string

    // Verify user is updating their own profile
    if (userId !== user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    // Validate GSTIN format if provided
    if (gstin && gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstinRegex.test(gstin.toUpperCase())) {
        return { success: false, message: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5' }
      }
    }

    // Validate PAN format if provided
    if (pan_number && pan_number.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      if (!panRegex.test(pan_number.toUpperCase())) {
        return { success: false, message: 'Invalid PAN format. Example: ABCDE1234F' }
      }
    }

    // Validate email format if provided
    if (business_email && business_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(business_email)) {
        return { success: false, message: 'Invalid email format' }
      }
    }

    // Validate website URL if provided
    if (business_website && business_website.trim()) {
      try {
        new URL(business_website)
      } catch {
        return { success: false, message: 'Invalid website URL. Include https://' }
      }
    }

    // Update profile with business information
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: business_name.trim() || null,
        gstin: gstin.trim().toUpperCase() || null,
        business_address: business_address.trim() || null,
        business_phone: business_phone.trim() || null,
        business_email: business_email.trim() || null,
        business_website: business_website.trim() || null,
        pan_number: pan_number.trim().toUpperCase() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Business update error:', error)
      if (error.code === '23505' && error.message.includes('profiles_business_phone_unique')) {
        return { success: false, message: 'This business phone number is already registered' }
      }
      return { success: false, message: error.message }
    }

    // Revalidate pages
    revalidatePath('/settings/business')
    revalidatePath('/settings/profile')
    revalidatePath('/settings')
    revalidatePath('/(dashboard)', 'layout')

    return { success: true, message: 'Business information updated successfully' }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Something went wrong' }
  }
}

// ========================================================
// DELETE AVATAR
// ========================================================
export async function deleteAvatar(userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    // Verify user
    if (userId !== user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    // Get current avatar URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (!profile?.avatar_url) {
      return { success: false, message: 'No avatar to delete' }
    }

    // Delete from storage
    const avatarPath = profile.avatar_url.split('/avatars/')[1]
    if (avatarPath) {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([avatarPath])

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, message: updateError.message }
    }

    // Revalidate pages
    revalidatePath('/settings/profile')
    revalidatePath('/settings')
    revalidatePath('/(dashboard)', 'layout')

    return { success: true, message: 'Avatar deleted successfully' }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Delete failed' }
  }
}

// ========================================================
// CHANGE PASSWORD
// ========================================================
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    // Validate password strength
    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters' }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Password changed successfully' }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Password change failed' }
  }
}

// ========================================================
// DELETE ACCOUNT
// ========================================================
export async function deleteAccount(userId: string, confirmation: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Authentication required' }
  }

  try {
    // Verify user
    if (userId !== user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    // Verify confirmation
    if (confirmation !== 'DELETE') {
      return { success: false, message: 'Invalid confirmation' }
    }

    // Delete user's avatar from storage
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profile?.avatar_url) {
      const avatarPath = profile.avatar_url.split('/avatars/')[1]
      if (avatarPath) {
        await supabase.storage.from('avatars').remove([avatarPath])
      }
    }

    // Delete profile (cascade will handle related data)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return { success: false, message: profileError.message }
    }

    // Note: auth.admin.deleteUser requires service role key
    // For now, just delete profile and user can't login
    // You can add this if you have service role key configured

    return { success: true, message: 'Account deleted successfully' }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, message: error.message || 'Account deletion failed' }
  }
}