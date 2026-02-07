import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all custom templates for the user
        const { data: templates, error } = await supabase
            .from('whatsapp_template_customizations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)

        if (error) {
            console.error('Error fetching templates:', error)
            return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
        }

        return NextResponse.json({ templates: templates || [] })
    } catch (error) {
        console.error('Template fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { template_type, custom_message } = body

        // Validate input
        const validTemplates = ['order_confirmation', 'payment_reminder', 'shipped_update', 'delivered_confirmation', 'follow_up']
        if (!template_type || !validTemplates.includes(template_type)) {
            return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
        }

        if (!custom_message || custom_message.trim().length === 0) {
            return NextResponse.json({ error: 'Custom message is required' }, { status: 400 })
        }

        // Upsert the template (insert or update if exists)
        const { data, error } = await supabase
            .from('whatsapp_template_customizations')
            .upsert({
                user_id: user.id,
                template_type,
                custom_message: custom_message.trim(),
                is_active: true,
            }, {
                onConflict: 'user_id,template_type'
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving template:', error)
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Template record was not found or created' }, { status: 404 })
            return NextResponse.json({ error: error.message || 'Failed to save template' }, { status: 500 })
        }

        return NextResponse.json({ success: true, template: data })
    } catch (error) {
        console.error('Template save error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
