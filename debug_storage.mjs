import { createAdminClient } from './src/lib/supabase/admin.js'

async function debugStorage() {
    const supabase = await createAdminClient()
    const { data: objects, error } = await supabase
        .schema('storage')
        .from('objects')
        .select('*')
        .limit(1)
    
    if (error) {
        console.error('Storage Error:', error)
    } else {
        console.log('Storage Object Sample:', JSON.stringify(objects?.[0], null, 2))
    }
}

debugStorage()
