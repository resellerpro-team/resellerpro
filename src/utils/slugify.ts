/**
 * Sanitizes a business name into a URL-friendly slug.
 * Removes spaces, special characters, and converts to lowercase.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Generates a unique shop slug based on business name.
 * If slug exists, appends a number until unique.
 */
export async function generateUniqueShopSlug(supabase: any, businessName: string, userId: string): Promise<string> {
  const baseSlug = slugify(businessName) || 'shop';
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('shop_slug', slug)
      .single();

    if (error || !data) {
      // Slug is available
      isUnique = true;
    } else if (data.id === userId) {
      // User already owns this slug
      isUnique = true;
    } else {
      // Collision, increment and try again
      slug = `${baseSlug}${counter}`;
      counter++;
    }
  }

  return slug;
}
