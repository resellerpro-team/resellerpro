'use server'

import { createClient } from '@/lib/supabase/server'

export async function markWelcomeShown() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false }

        await supabase
            .from('profiles')
            .update({ welcome_shown: true })
            .eq('id', user.id)

        return { success: true }
    } catch (error) {
        console.error('Error marking welcome shown:', error)
        return { success: false }
    }
}
