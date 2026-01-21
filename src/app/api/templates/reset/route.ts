import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { template_type } = body

        // Validate input
        const validTemplates = ['order_confirmation', 'payment_reminder', 'shipped_update', 'delivered_confirmation', 'follow_up']
        if (!template_type || !validTemplates.includes(template_type)) {
            return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
        }

        // Delete the custom template (reset to default)
        const { error } = await supabase
            .from('whatsapp_template_customizations')
            .delete()
            .eq('user_id', user.id)
            .eq('template_type', template_type)

        if (error) {
            console.error('Error resetting template:', error)
            return NextResponse.json({ error: 'Failed to reset template' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Template reset to default' })
    } catch (error) {
        console.error('Template reset error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
