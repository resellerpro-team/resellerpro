
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, whatsapp, email, message } = body

        // Basic validation
        if (!name || !whatsapp || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('landing_popup_leads')
            .insert([
                { name, whatsapp, email, message }
            ])

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to submit enquiry' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { success: true, message: 'Enquiry submitted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Enquiry API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
