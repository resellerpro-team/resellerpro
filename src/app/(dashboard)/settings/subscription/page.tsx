import { redirect } from 'next/navigation'

export default function SubscriptionSettingsRedirect() {
  redirect('/billing')
}