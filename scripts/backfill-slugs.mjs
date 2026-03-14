import { createAdminClient } from './src/lib/supabase/admin.js'
import { generateUniqueShopSlug } from './src/utils/slugify.js'

async function backfillSlugs() {
  const supabase = await createAdminClient()
  
  console.log('Fetching profiles without shop slugs...')
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, business_name')
    .is('shop_slug', null)
    .not('business_name', 'is', null)

  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  console.log(`Found ${profiles.length} profiles to backfill.`)

  for (const profile of profiles) {
    console.log(`Generating slug for: ${profile.business_name} (${profile.id})`)
    const slug = await generateUniqueShopSlug(supabase, profile.business_name, profile.id)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ shop_slug: slug })
      .eq('id', profile.id)

    if (updateError) {
      console.error(`Failed to update ${profile.id}:`, updateError)
    } else {
      console.log(`Successfully updated: ${slug}`)
    }
  }

  console.log('Backfill complete!')
}

backfillSlugs()
