'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  LifeBuoy,
  Search,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Clock,
  ExternalLink,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function EkodrixSupportPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return

    setLoading(true)
    // For now we'll just redirect to a potential customer page if it looks like an ID
    // or we can implement a quick lookup API here.
    // Let's just use the customer management search as it's already implemented.
    router.push(`/ekodrix-panel/customers?search=${search}`)
  }

  const commonIssues = [
    { title: 'Payment Unlocked?', desc: 'User paid but plan not active', action: 'Lookup User' },
    { title: 'Access Denied', desc: 'User seeing upgrade page after payment', action: 'Verify Sub' },
    { title: 'Wallet Issue', desc: 'Referral reward not credited', action: 'Check Referral' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <LifeBuoy className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Support Command Center</h1>
        <p className="text-gray-400 max-w-lg mx-auto">Foundational tools for resolving user disputes and system anomalies</p>
      </div>

      {/* Main Search Tool */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
        <CardContent className="p-8 md:p-12">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <CardTitle className="text-xl text-white text-center">User/Issue Lookup</CardTitle>
              <CardDescription className="text-center">Search by Email, Phone, or Business Name to troubleshoot</CardDescription>
            </div>
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="e.g. customer@email.com or +91..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 pl-12 text-lg text-white rounded-xl focus:border-emerald-500 transition-all font-medium"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                {loading ? 'Searching...' : 'Troubleshoot'}
              </Button>
            </div>
            <div className="flex justify-center gap-4 flex-wrap pt-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Plan Verification
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                Payment Sync
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                Validity Extensions
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Common Issue Templates */}
      <div className="grid md:grid-cols-3 gap-6">
        {commonIssues.map((issue, i) => (
          <Card key={i} className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group">
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-200">{issue.title}</h3>
                <p className="text-xs text-gray-500">{issue.desc}</p>
              </div>
              <div className="pt-2 flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                {issue.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8 flex items-center justify-center gap-8 opacity-40">
        <div className="flex flex-col items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-500" />
          <span className="text-[10px] font-medium text-gray-600">User Guides</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <span className="text-[10px] font-medium text-gray-600">Dev Support</span>
        </div>
      </div>
    </div>
  )
}
