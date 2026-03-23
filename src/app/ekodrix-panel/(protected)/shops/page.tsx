'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Store, Globe, Lock, Search, Eye, ExternalLink,
  Users, Package, TrendingUp, Loader2, ShoppingBag,
  Sparkles, Crown, AlertTriangle, ArrowUpRight,
  Copy, Check, Palette, BarChart3,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { StatusBadge } from '@/components/admin/status-badge'
import { KpiCard } from '@/components/admin/kpi-card'

interface ShopData {
  id: string
  full_name: string
  email: string
  phone: string
  business_name: string
  shop_slug: string
  shop_description: string
  shop_theme: any
  avatar_url: string
  updated_at: string
  plan_name: string
  plan_display: string
  subscription_status: string
  subscription_end: string | null
  is_eligible: boolean
  product_count: number
  store_url: string
  status: string
}

interface NoShopUser {
  id: string
  full_name: string
  email: string
  business_name: string
  updated_at: string
  plan_name: string
  plan_display: string
  is_eligible: boolean
}

interface Summary {
  totalUsers: number
  totalConfigured: number
  liveStores: number
  lockedStores: number
  noStoreSetup: number
  totalProducts: number
  adoptionRate: number
  eligibilityRate: number
}

export default function ShopStoresAdminPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [shops, setShops] = useState<ShopData[]>([])
  const [noShopUsers, setNoShopUsers] = useState<NoShopUser[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ekodrix-panel/shops')
      const result = await res.json()
      if (result.success) {
        setSummary(result.data.summary)
        setShops(result.data.shops)
        setNoShopUsers(result.data.noShopUsers)
      }
    } catch (e) {
      console.error('Failed to fetch shop data:', e)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`https://resellerpro.in/${slug}`)
    setCopiedSlug(slug)
    toast({ title: 'Copied!', description: `Store URL copied to clipboard` })
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Filtered shops
  const filtered = shops.filter(s => {
    const matchSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.shop_slug?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'live' ? s.is_eligible :
      filter === 'locked' ? !s.is_eligible :
      true
    return matchSearch && matchFilter
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <p className="text-gray-500 animate-pulse text-sm">Loading shop store data...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-500" />
            Shop Store Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Monitor all user stores, track adoption, and manage eligibility</p>
        </div>
        <Button onClick={() => { setLoading(true); fetchData() }} variant="outline" size="sm"
          className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300">
          <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* ═══════════════ KPI CARDS ═══════════════ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Stores" value={summary?.totalConfigured || 0} icon={Store}
          gradient="from-blue-500 to-indigo-600"
          subtitle={`${summary?.adoptionRate || 0}% adoption rate`}
          trendValue={`${summary?.totalConfigured || 0} of ${summary?.totalUsers || 0} users`}
          trend="neutral" delay={0} />
        <KpiCard title="Live Stores" value={summary?.liveStores || 0} icon={Globe}
          gradient="from-emerald-500 to-teal-500"
          subtitle="Professional / Business plan"
          trend="up" delay={1} />
        <KpiCard title="Locked (Free Users)" value={summary?.lockedStores || 0} icon={Lock}
          gradient="from-amber-500 to-orange-500"
          subtitle="Upgrade needed to go live"
          trendValue="Upsell opportunity"
          trend="neutral" delay={2} />
        <KpiCard title="Products Listed" value={summary?.totalProducts || 0} icon={Package}
          gradient="from-purple-500 to-pink-500"
          subtitle={`Across ${summary?.totalConfigured || 0} stores`}
          trend="up" delay={3} />
      </div>

      {/* ═══════════════ ADOPTION FUNNEL ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02]">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-base text-gray-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Store Adoption Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-4 gap-4">
            <FunnelStep label="Total Users" value={summary?.totalUsers || 0} pct={100} color="bg-blue-500" />
            <FunnelStep label="Store Setup" value={summary?.totalConfigured || 0}
              pct={summary?.adoptionRate || 0} color="bg-indigo-500" />
            <FunnelStep label="Eligible (Paid)" value={summary?.liveStores || 0}
              pct={summary?.eligibilityRate || 0} color="bg-emerald-500" />
            <FunnelStep label="No Store Yet" value={summary?.noStoreSetup || 0}
              pct={summary?.totalUsers ? Math.round(((summary?.noStoreSetup || 0) / summary.totalUsers) * 100) : 0}
              color="bg-gray-500" isAlert />
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ FILTERS ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02]">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input placeholder="Search stores by name, business, slug, or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-200 pl-10 h-11 focus:border-emerald-500" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="border-white/10 bg-white/5 text-gray-300 h-11 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="live">Live Only</SelectItem>
              <SelectItem value="locked">Locked Only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ═══════════════ STORES TABLE ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02] overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-base text-gray-200 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" /> Configured Stores
            <Badge className="ml-auto bg-white/5 text-gray-400 border-0">{filtered.length} stores</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Store Owner</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Store URL</th>
                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Status</th>
                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Plan</th>
                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Products</th>
                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Theme</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500 text-sm italic">No stores found matching your criteria</td>
                  </tr>
                ) : (
                  filtered.map(shop => (
                    <tr key={shop.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Owner */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0 border border-emerald-500/20">
                            {shop.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate max-w-[160px]">{shop.full_name || 'No name'}</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[160px]">
                              {shop.business_name || shop.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Store URL */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded font-mono">
                            /{shop.shop_slug}
                          </code>
                          <button onClick={() => copyUrl(shop.shop_slug)} className="text-gray-500 hover:text-white transition-colors">
                            {copiedSlug === shop.shop_slug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        {shop.is_eligible ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] gap-1">
                            <Globe className="w-3 h-3" /> Live
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px] gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </Badge>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3 text-center">
                        <Badge className={cn("border-0 text-[10px]",
                          shop.plan_name === 'free' ? 'bg-gray-500/20 text-gray-400' :
                          shop.plan_name === 'professional' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        )}>
                          {shop.plan_name === 'free' ? '' : <Crown className="w-3 h-3 mr-1" />}
                          {shop.plan_display}
                        </Badge>
                      </td>

                      {/* Products */}
                      <td className="px-5 py-3 text-center">
                        <span className={cn("text-xs font-bold",
                          shop.product_count > 0 ? 'text-emerald-400' : 'text-gray-500'
                        )}>
                          {shop.product_count}
                        </span>
                      </td>

                      {/* Theme Color */}
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-white/10"
                            style={{ backgroundColor: shop.shop_theme?.primaryColor || '#4f46e5' }} />
                          <span className="text-[10px] text-gray-500 font-mono uppercase">
                            {shop.shop_theme?.primaryColor || '#4f46e5'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {shop.is_eligible && (
                            <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                              <a href={`/${shop.shop_slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" /> Visit
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[10px]" asChild>
                            <Link href={`/ekodrix-panel/customers/${shop.id}`}>
                              <Eye className="w-3 h-3 mr-1" /> Profile
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ FREE USERS UPSELL SECTION ═══════════════ */}
      <Card className="border border-white/5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-base text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Upsell Opportunity — Users Without Stores
            <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-0 text-[10px]">
              {summary?.noStoreSetup || 0} users
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">These users haven't set up their store yet — prime targets for subscription upsell</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {noShopUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm italic">
                All users have configured their stores! 🎉
              </div>
            ) : (
              noShopUsers.map(user => (
                <div key={user.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{user.full_name || 'No name'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.business_name || user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-[10px] border-0",
                      user.is_eligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    )}>
                      {user.plan_display}
                      {user.is_eligible && <span className="ml-1">✓ Eligible</span>}
                    </Badge>
                    {!user.is_eligible && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400">
                        <ArrowUpRight className="w-3 h-3" /> Upgrade target
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-gray-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                      <Link href={`/ekodrix-panel/customers/${user.id}`}><Eye className="w-3 h-3" /></Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ HOW STORE WORKS — INFO CARD ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02]">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" /> How Store Feature Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <InfoStep step={1} icon={Palette} title="User Configures Store"
              desc="User sets their shop slug, description, and theme color in Settings → Shop." />
            <InfoStep step={2} icon={Package} title="Products Auto-Listed"
              desc="All products added by the user automatically appear on their store page." />
            <InfoStep step={3} icon={Globe} title="Store Goes Live"
              desc="Only Professional & Business plan users get a live store. Free users see an upgrade prompt." />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────
function FunnelStep({ label, value, pct, color, isAlert }: {
  label: string; value: number; pct: number; color: string; isAlert?: boolean
}) {
  return (
    <div className="text-center space-y-2">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
      <p className={cn("text-2xl font-bold", isAlert ? 'text-gray-400' : 'text-white')}>{value.toLocaleString('en-IN')}</p>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={cn('h-full rounded-full', color)} />
      </div>
      <p className="text-[10px] text-gray-500">{pct}%</p>
    </div>
  )
}

function InfoStep({ step, icon: Icon, title, desc }: {
  step: number; icon: any; title: string; desc: string
}) {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-white font-bold">Step {step}: {title}</p>
        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
