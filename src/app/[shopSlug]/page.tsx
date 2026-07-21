import { redirect } from 'next/navigation'

interface Props {
  params: { shopSlug: string }
}

const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'dashboard', 'settings', 'p', 'pricing',
  'about', 'contact', 'features', 'privacy-policy', 'terms-and-conditions',
  'ekodrix-panel', 'login', 'signup', 'actions', 'store', 'onboarding',
]

export default function ShopSlugRedirect({ params }: Props) {
  const { shopSlug } = params
  if (RESERVED_SLUGS.includes(shopSlug)) {
    redirect('/')
  }
  redirect(`/store/${shopSlug}`)
}
