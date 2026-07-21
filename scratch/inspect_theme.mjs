import { createAdminClient } from '../src/lib/supabase/admin.ts'

async function debug() {
  const supabase = await createAdminClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, shop_slug, plan, shop_theme')
    
  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  console.log('Profiles list:')
  for (const p of profiles) {
    console.log(`ID: ${p.id}, Slug: ${p.shop_slug}, Plan: ${p.plan}, Theme:`, JSON.stringify(p.shop_theme, null, 2))
  }
}

debug()
