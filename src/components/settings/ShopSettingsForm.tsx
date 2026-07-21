'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import {
  Loader2, Palette, Globe, Info, ExternalLink, Sparkles,
  Crown, Lock, ShoppingBag, Layout, Type, Image as ImageIcon,
  Share2, Search, Bell, Eye, Rocket, ArrowRight, Check,
  Instagram, Facebook, Twitter, MessageCircle,
  Star, MapPin, Mail, Phone, Clock, Zap,
  Monitor, Smartphone, PanelTop, Quote, Shield,
  Truck, RotateCcw, HeartHandshake, ChevronRight, Upload,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateShopSettings } from '@/app/(dashboard)/settings/actions'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ShopSettingsFormProps {
  profile: {
    id: string
    shop_slug?: string
    shop_description?: string
    shop_theme?: any
    business_name?: string
    avatar_url?: string
    shop_logo_url?: string
  }
  isEligible?: boolean
  planName?: string
  planDisplay?: string
  productCount?: number
}

export default function ShopSettingsForm({
  profile, isEligible = false, planName = 'free', planDisplay = 'Free Plan', productCount = 0
}: ShopSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('general')
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const supabase = createClient()

  const theme = profile.shop_theme || {}

  const [formData, setFormData] = useState({
    // Basic
    shop_slug: profile.shop_slug || '',
    shop_description: profile.shop_description || '',
    shop_logo_url: profile.shop_logo_url || '',
    // Appearance
    primaryColor: theme.primaryColor || '#4f46e5',
    secondaryColor: theme.secondaryColor || '#f97316',
    layout: theme.layout || 'grid',
    showPrices: theme.showPrices !== false,
    showWhatsApp: theme.showWhatsApp !== false,
    buttonStyle: theme.buttonStyle || 'rounded',
    fontFamily: theme.fontFamily || 'default',
    colorScheme: theme.colorScheme || 'light',
    headerStyle: theme.headerStyle || 'default',
    // Hero Banner
    heroEnabled: theme.heroEnabled || false,
    heroTitle: theme.heroTitle || '',
    heroSubtitle: theme.heroSubtitle || '',
    heroCtaText: theme.heroCtaText || 'Shop Now',
    heroCtaLink: theme.heroCtaLink || '#products',
    heroBgColor: theme.heroBgColor || '#4f46e5',
    heroPattern: theme.heroPattern || 'none',
    heroImageUrl: theme.heroImageUrl || '',
    // Announcement Banner
    bannerText: theme.bannerText || '',
    bannerEnabled: theme.bannerEnabled || false,
    // Social Links
    socialInstagram: theme.socialInstagram || '',
    socialFacebook: theme.socialFacebook || '',
    socialTwitter: theme.socialTwitter || '',
    socialWhatsApp: theme.socialWhatsApp || '',
    // SEO
    seoTitle: theme.seoTitle || '',
    seoDescription: theme.seoDescription || '',
    // WhatsApp Chat Widget
    chatWidgetEnabled: theme.chatWidgetEnabled !== false,
    chatWidgetMessage: theme.chatWidgetMessage || 'Hi! I found your store online. I have a question.',
    // Store Status
    storeStatus: theme.storeStatus || 'open',
    vacationMessage: theme.vacationMessage || '',
    // Testimonials
    testimonialsEnabled: theme.testimonialsEnabled || false,
    testimonials: theme.testimonials || [
      { name: '', text: '', rating: 5 },
      { name: '', text: '', rating: 5 },
      { name: '', text: '', rating: 5 },
    ],
    // Custom Promo / CTA Banner Section
    ctaSectionEnabled: theme.ctaSectionEnabled || false,
    ctaImageUrl: theme.ctaImageUrl || '',
    ctaTitle: theme.ctaTitle || '',
    ctaSubtitle: theme.ctaSubtitle || '',
    ctaLink: theme.ctaLink || '',
    ctaBtnText: theme.ctaBtnText || 'Explore More',
    // Footer
    footerAbout: theme.footerAbout || '',
    footerAddress: theme.footerAddress || '',
    footerEmail: theme.footerEmail || '',
    footerPhone: theme.footerPhone || '',
    // Policies
    returnPolicy: theme.returnPolicy || '',
    shippingInfo: theme.shippingInfo || '',
    // Category Showcase
    categoryShowcase: theme.categoryShowcase !== false,
    // Trust Badges
    trustBadgesEnabled: theme.trustBadgesEnabled || false,
    trustBadges: theme.trustBadges || ['secure_payment', 'fast_delivery', 'easy_returns'],
    // Custom CSS
    customCss: theme.customCss || '',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    setUploadingField(fieldName)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${fieldName}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const uploadedUrl = urlData.publicUrl

      setFormData(prev => ({ ...prev, [fieldName]: uploadedUrl }))
      toast({
        title: 'Upload Successful 🎉',
        description: 'Image uploaded and updated in settings.',
      })
    } catch (err: any) {
      console.error('Upload error:', err)
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload image.',
        variant: 'destructive',
      })
    } finally {
      setUploadingField(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name: string, val: boolean) => {
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const updateTestimonial = (index: number, field: string, value: string | number) => {
    const updated = [...formData.testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setFormData(prev => ({ ...prev, testimonials: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const data = new FormData()
      data.append('userId', profile.id)
      data.append('shop_slug', formData.shop_slug)
      data.append('shop_description', formData.shop_description)
      data.append('shop_logo_url', formData.shop_logo_url)
      
      // Pack everything else into shop_theme JSON
      const { shop_slug, shop_description, shop_logo_url, ...themeData } = formData
      data.append('shop_theme', JSON.stringify(themeData))

      const result = await updateShopSettings(data)
      if (result.success) {
        toast({ title: 'Success ✨', description: 'Store settings saved!' })
        router.refresh()
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to save', variant: 'destructive' })
      }
    })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Design', icon: Palette },
    { id: 'hero', label: 'Hero Banner', icon: PanelTop },
    { id: 'sections', label: 'Sections', icon: Layout },
    { id: 'social', label: 'Social & Chat', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'footer', label: 'Footer', icon: MapPin },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ]

  return (
    <div className="space-y-6">
      {/* ═══════════════ PREMIUM UPSELL ═══════════════ */}
      {!isEligible && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 p-6 md:p-8">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/30"><Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /></div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">PRO Feature</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Launch Your Online Store 🚀</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Build a <strong>Shopify-level online store</strong> with hero banners, testimonials, trust badges, custom footer, floating WhatsApp chat, and more — all with your own
                <code className="bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded mx-1 text-indigo-600 dark:text-indigo-400 text-xs font-mono">resellerpro.in/{formData.shop_slug || 'your-store'}</code>
                URL!
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { icon: PanelTop, text: 'Hero Banner Builder' },
                  { icon: Quote, text: 'Customer Testimonials' },
                  { icon: Shield, text: 'Trust Badges' },
                  { icon: MessageCircle, text: 'WhatsApp Chat Widget' },
                  { icon: Search, text: 'SEO Optimization' },
                  { icon: Palette, text: 'Full Theme Control' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center"><Icon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /></div>
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/settings/subscription">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 group">
                  <Rocket className="w-4 h-4 mr-2" /> Upgrade to Professional <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block w-64 shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-sm">{profile.business_name || 'Your Store'}</span>
                  <span className="text-white/70 text-[10px]">Premium Online Store</span>
                </div>
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1"><div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4" /><div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" /></div>
                    </div>
                  ))}
                </div>
                <div className="p-3 pt-0">
                  <div className="h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-3 h-3 text-indigo-400 mr-1" />
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">Upgrade to Unlock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ LIVE STATUS ═══════════════ */}
      {isEligible && formData.shop_slug && (
        <div className={cn("flex items-center gap-4 p-4 rounded-2xl border",
          formData.storeStatus === 'open' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-950/50 dark:bg-emerald-950/20' :
          formData.storeStatus === 'vacation' ? 'border-amber-200 bg-amber-50 dark:border-amber-950/50 dark:bg-amber-950/20' : 'border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/20')}>
          <div className={cn("p-2 rounded-xl",
            formData.storeStatus === 'open' ? 'bg-emerald-100 dark:bg-emerald-900/30' : formData.storeStatus === 'vacation' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
            {formData.storeStatus === 'open' ? <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> :
             formData.storeStatus === 'vacation' ? <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /> :
             <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />}
          </div>
          <div className="flex-1">
            <p className={cn("text-sm font-bold",
              formData.storeStatus === 'open' ? 'text-emerald-800 dark:text-emerald-300' : formData.storeStatus === 'vacation' ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300')}>
              {formData.storeStatus === 'open' ? '🟢 Store is LIVE' : formData.storeStatus === 'vacation' ? '🟡 Vacation Mode' : '🔴 Store Closed'}
            </p>
            <p className={cn("text-xs", formData.storeStatus === 'open' ? 'text-emerald-600 dark:text-emerald-400' : formData.storeStatus === 'vacation' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>
              resellerpro.in/{formData.shop_slug} · {productCount} products
            </p>
          </div>
          <a href={`/store/${formData.shop_slug}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            <Eye className="w-3.5 h-3.5" /> Visit <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300')}>
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════════ TAB: GENERAL ═══════════════ */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Section icon={Globe} title="Store URL">
              <div className="space-y-2">
                <Label htmlFor="shop_slug">Custom Slug</Label>
                <div className="flex items-center">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-800 rounded-l-lg text-slate-500 dark:text-slate-400 text-sm shrink-0">resellerpro.in/</div>
                  <Input id="shop_slug" name="shop_slug" value={formData.shop_slug} onChange={handleChange} placeholder="your-shop-name" className="rounded-l-none" disabled={isPending} />
                </div>
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
              </div>
            </Section>

            <Section icon={Info} title="Store Description">
              <Textarea name="shop_description" value={formData.shop_description} onChange={handleChange}
                placeholder="Tell customers about your business..." rows={3} disabled={isPending} />
            </Section>

            <Section icon={ImageIcon} title="Store Logo">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  {formData.shop_logo_url ? (
                    <img src={formData.shop_logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-750" />
                  )}
                  {uploadingField === 'shop_logo_url' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label htmlFor="shop_logo_file" className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-250 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Logo
                  </label>
                  <input
                    id="shop_logo_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'shop_logo_url')}
                    className="hidden"
                    disabled={isPending || uploadingField !== null}
                  />
                  {formData.shop_logo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, shop_logo_url: '' }))}
                      className="text-xs text-red-500 font-bold block hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Square image (e.g. 500x500 px) recommended. Max 5MB.</p>
                </div>
              </div>
            </Section>

            <Section icon={Clock} title="Store Status" pro={!isEligible}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'open', label: '🟢 Open', desc: 'Store visible & active' },
                  { value: 'vacation', label: '🟡 Vacation', desc: 'Show vacation notice' },
                  { value: 'closed', label: '🔴 Closed', desc: 'Hide store temporarily' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => handleToggle('storeStatus', opt.value as any)}
                    className={cn("p-3 rounded-xl border-2 text-left transition-all",
                      formData.storeStatus === opt.value 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700')}
                    disabled={!isEligible}>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{opt.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {formData.storeStatus === 'vacation' && (
                <div className="mt-3">
                  <Label>Vacation Message</Label>
                  <Input name="vacationMessage" value={formData.vacationMessage} onChange={handleChange}
                    placeholder="We'll be back on March 30! 🏖️" disabled={isPending || !isEligible} className="mt-1.5" />
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ═══════════════ TAB: DESIGN ═══════════════ */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Section icon={Palette} title="Colors">
              <div className="grid sm:grid-cols-2 gap-4">
                <ColorPicker label="Primary Color" name="primaryColor" value={formData.primaryColor}
                  onChange={handleChange} onSet={(v) => setFormData(p => ({...p, primaryColor: v}))}
                  presets={['#4f46e5','#059669','#dc2626','#ea580c','#7c3aed','#0891b2']} />
                <ColorPicker label="Accent Color" name="secondaryColor" value={formData.secondaryColor}
                  onChange={handleChange} onSet={(v) => setFormData(p => ({...p, secondaryColor: v}))}
                  presets={['#f97316','#eab308','#ec4899','#14b8a6','#8b5cf6','#f43f5e']} />
              </div>
            </Section>

            <Section icon={Monitor} title="Color Scheme">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', bg: 'bg-white border-slate-200', text: 'text-slate-900' },
                  { value: 'dark', label: 'Dark', bg: 'bg-slate-900 border-slate-700', text: 'text-white' },
                  { value: 'auto', label: 'Auto', bg: 'bg-gradient-to-r from-white to-slate-900 border-slate-300', text: 'text-slate-600' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setFormData(p => ({...p, colorScheme: opt.value}))}
                    className={cn("p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      formData.colorScheme === opt.value ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:border-slate-300',
                      opt.bg)}>
                    <Monitor className={cn("w-5 h-5", opt.text)} />
                    <span className={cn("text-xs font-bold", opt.text)}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={Layout} title="Product Layout">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'grid', label: 'Grid', desc: '3-col card view' },
                  { value: 'list', label: 'List', desc: 'Horizontal rows' },
                  { value: 'compact', label: 'Compact', desc: 'Small tile view' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setFormData(p => ({...p, layout: opt.value}))}
                    className={cn("p-3 rounded-xl border-2 text-left transition-all",
                      formData.layout === opt.value 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700')}>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{opt.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={Type} title="Button & Font">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Button Style</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'pill', label: 'Pill' },
                      { value: 'sharp', label: 'Sharp' },
                    ].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setFormData(p => ({...p, buttonStyle: opt.value}))}
                        className={cn("flex-1 py-2.5 text-sm font-bold transition-all text-white",
                          opt.value === 'rounded' ? 'rounded-lg' : opt.value === 'pill' ? 'rounded-full' : 'rounded-none',
                          formData.buttonStyle === opt.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                        )} style={{ backgroundColor: formData.primaryColor }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="fontFamily">Font Style</Label>
                  <select id="fontFamily" name="fontFamily" value={formData.fontFamily} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 px-3 text-sm bg-white dark:bg-slate-900 dark:text-slate-100 mt-1.5">
                    <option value="default">System Default</option>
                    <option value="inter">Inter (Clean)</option>
                    <option value="poppins">Poppins (Friendly)</option>
                    <option value="playfair">Playfair (Elegant)</option>
                    <option value="roboto">Roboto (Professional)</option>
                    <option value="outfit">Outfit (Modern)</option>
                  </select>
                </div>
                <div>
                  <Label>Header Style</Label>
                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    {[
                      { value: 'default', label: 'Standard', desc: 'Logo left, search center' },
                      { value: 'centered', label: 'Centered', desc: 'Logo & search centered' },
                      { value: 'minimal', label: 'Minimal', desc: 'Clean, less padding' },
                    ].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setFormData(p => ({...p, headerStyle: opt.value}))}
                        className={cn("p-3 rounded-xl border-2 text-left transition-all",
                          formData.headerStyle === opt.value 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700')}>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{opt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section icon={Eye} title="Display Options">
              <div className="space-y-3">
                <ToggleRow label="Show Prices" description="Display product prices publicly" checked={formData.showPrices} onChange={v => handleToggle('showPrices', v)} />
                <ToggleRow label="WhatsApp Buy Button" description="'Buy Now' button on each product" checked={formData.showWhatsApp} onChange={v => handleToggle('showWhatsApp', v)} />
                <ToggleRow label="Category Showcase" description="Show categories as visual cards" checked={formData.categoryShowcase} onChange={v => handleToggle('categoryShowcase', v)} />
              </div>
            </Section>
          </div>
        )}

        {/* ═══════════════ TAB: HERO BANNER ═══════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <Section icon={PanelTop} title="Hero Banner" pro={!isEligible}>
              <ToggleRow label="Enable Hero Banner" description="Full-width banner at the top of your store" checked={formData.heroEnabled} onChange={v => handleToggle('heroEnabled', v)} disabled={!isEligible} />
              {formData.heroEnabled && (
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label>Headline</Label>
                    <Input name="heroTitle" value={formData.heroTitle} onChange={handleChange}
                      placeholder="Welcome to Our Store!" disabled={isPending || !isEligible} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange}
                      placeholder="Discover premium products at the best prices" disabled={isPending || !isEligible} className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Button Text</Label>
                      <Input name="heroCtaText" value={formData.heroCtaText} onChange={handleChange}
                        placeholder="Shop Now" disabled={isPending || !isEligible} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Button Link</Label>
                      <Input name="heroCtaLink" value={formData.heroCtaLink} onChange={handleChange}
                        placeholder="#products" disabled={isPending || !isEligible} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label>Hero Background Image (Optional)</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        {formData.heroImageUrl ? (
                          <img src={formData.heroImageUrl} alt="Hero Banner" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                        )}
                        {uploadingField === 'heroImageUrl' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label htmlFor="hero_image_file" className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-250 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Image
                        </label>
                        <input
                          id="hero_image_file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'heroImageUrl')}
                          className="hidden"
                          disabled={!isEligible || uploadingField !== null}
                        />
                        {formData.heroImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, heroImageUrl: '' }))}
                            className="text-xs text-red-500 font-bold block hover:underline"
                          >
                            Remove Image
                          </button>
                        )}
                        <p className="text-[9px] text-slate-400 dark:text-slate-500">Wide banner (e.g. 1920x600 px) recommended. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <input type="color" name="heroBgColor" value={formData.heroBgColor} onChange={handleChange}
                        className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-800 cursor-pointer p-0.5 bg-white dark:bg-slate-900" disabled={!isEligible} />
                      <Input value={formData.heroBgColor} name="heroBgColor" onChange={handleChange} className="w-28 font-mono uppercase" maxLength={7} disabled={!isEligible} />
                    </div>
                  </div>
                  <div>
                    <Label>Background Pattern</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1.5">
                      {['none', 'dots', 'waves', 'gradient'].map(p => (
                        <button key={p} type="button" onClick={() => setFormData(prev => ({...prev, heroPattern: p}))}
                          className={cn("py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all",
                            formData.heroPattern === p 
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                              : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700')}
                          disabled={!isEligible}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="py-10 px-6 text-center relative overflow-hidden bg-cover bg-center" style={formData.heroImageUrl ? { backgroundImage: `url(${formData.heroImageUrl})` } : { backgroundColor: formData.heroBgColor }}>
                      {formData.heroPattern === 'dots' && !formData.heroImageUrl && <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />}
                      {formData.heroPattern === 'waves' && !formData.heroImageUrl && <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`}} />}
                      {formData.heroPattern === 'gradient' && !formData.heroImageUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />}
                      <div className="relative z-10 bg-slate-950/40 p-4 rounded-xl inline-block max-w-full backdrop-blur-[1px]">
                        <h2 className="text-xl font-black text-white">{formData.heroTitle || 'Your Headline'}</h2>
                        <p className="text-sm text-white/80 mt-1">{formData.heroSubtitle || 'Your subtitle text'}</p>
                        <button className="mt-4 px-6 py-2 bg-white text-sm font-bold rounded-full text-slate-950">
                          {formData.heroCtaText || 'Shop Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section icon={Bell} title="Announcement Banner" pro={!isEligible}>
              <ToggleRow label="Enable Banner" description="Top marquee banner for promotions" checked={formData.bannerEnabled} onChange={v => handleToggle('bannerEnabled', v)} disabled={!isEligible} />
              {formData.bannerEnabled && (
                <div className="mt-3">
                  <Input name="bannerText" value={formData.bannerText} onChange={handleChange}
                    placeholder="🎉 Free shipping on orders above ₹500!" disabled={isPending || !isEligible} />
                  {formData.bannerText && (
                    <div className="mt-3 rounded-lg overflow-hidden border">
                      <div className="py-2 px-4 text-center text-xs font-bold text-white" style={{ backgroundColor: formData.primaryColor }}>{formData.bannerText}</div>
                    </div>
                  )}
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ═══════════════ TAB: SECTIONS ═══════════════ */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <Section icon={Quote} title="Customer Testimonials" pro={!isEligible}>
              <ToggleRow label="Enable Testimonials" description="Show customer reviews on your store" checked={formData.testimonialsEnabled} onChange={v => handleToggle('testimonialsEnabled', v)} disabled={!isEligible} />
              {formData.testimonialsEnabled && (
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {formData.testimonials.map((t: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Testimonial {i + 1}</p>
                      <Input placeholder="Customer name" value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)} disabled={!isEligible} />
                      <Textarea placeholder="What they said about your products..." value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)} rows={2} disabled={!isEligible} />
                      <div className="flex items-center gap-1">
                        <Label className="text-xs mr-2">Rating:</Label>
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button" onClick={() => updateTestimonial(i, 'rating', star)} disabled={!isEligible}>
                            <Star className={cn("w-5 h-5 transition-colors", star <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700')} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
 
            <Section icon={ImageIcon} title="Custom Promo / CTA Banner" pro={!isEligible}>
              <ToggleRow 
                label="Enable Promo Banner Section" 
                description="Show a custom call-to-action banner section on your homepage" 
                checked={formData.ctaSectionEnabled} 
                onChange={v => handleToggle('ctaSectionEnabled', v)} 
                disabled={!isEligible} 
              />
              {formData.ctaSectionEnabled && (
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label>Promo Banner Image</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        {formData.ctaImageUrl ? (
                          <img src={formData.ctaImageUrl} alt="CTA Promo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                        )}
                        {uploadingField === 'ctaImageUrl' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label htmlFor="cta_image_file" className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-250 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Banner Image
                        </label>
                        <input
                          id="cta_image_file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'ctaImageUrl')}
                          className="hidden"
                          disabled={!isEligible || uploadingField !== null}
                        />
                        {formData.ctaImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, ctaImageUrl: '' }))}
                            className="text-xs text-red-500 font-bold block hover:underline"
                          >
                            Remove Image
                          </button>
                        )}
                        <p className="text-[9px] text-slate-400 dark:text-slate-500">Wide banner (e.g. 1200x400 px) recommended. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Section Title</Label>
                      <Input 
                        name="ctaTitle" 
                        value={formData.ctaTitle} 
                        onChange={handleChange}
                        placeholder="Special Festive Collection!" 
                        disabled={isPending || !isEligible} 
                        className="mt-1.5" 
                      />
                    </div>
                    <div>
                      <Label>Section Subtitle / Description</Label>
                      <Input 
                        name="ctaSubtitle" 
                        value={formData.ctaSubtitle} 
                        onChange={handleChange}
                        placeholder="Get flat 20% off on all items. Limited time offer." 
                        disabled={isPending || !isEligible} 
                        className="mt-1.5" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input 
                        name="ctaBtnText" 
                        value={formData.ctaBtnText} 
                        onChange={handleChange}
                        placeholder="Explore More" 
                        disabled={isPending || !isEligible} 
                        className="mt-1.5" 
                      />
                    </div>
                    <div>
                      <Label>Button Link / URL</Label>
                      <Input 
                        name="ctaLink" 
                        value={formData.ctaLink} 
                        onChange={handleChange}
                        placeholder="#products" 
                        disabled={isPending || !isEligible} 
                        className="mt-1.5" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section icon={Shield} title="Trust Badges" pro={!isEligible}>
              <ToggleRow label="Show Trust Badges" description="Display trust indicators below products" checked={formData.trustBadgesEnabled} onChange={v => handleToggle('trustBadgesEnabled', v)} disabled={!isEligible} />
              {formData.trustBadgesEnabled && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { id: 'secure_payment', icon: Shield, label: 'Secure Payment' },
                    { id: 'fast_delivery', icon: Truck, label: 'Fast Delivery' },
                    { id: 'easy_returns', icon: RotateCcw, label: 'Easy Returns' },
                    { id: 'quality', icon: Star, label: 'Quality Assured' },
                    { id: 'support', icon: HeartHandshake, label: '24/7 Support' },
                    { id: 'authentic', icon: Check, label: '100% Authentic' },
                  ].map(badge => {
                    const isSelected = formData.trustBadges.includes(badge.id)
                    return (
                      <button key={badge.id} type="button" disabled={!isEligible}
                        onClick={() => {
                          const updated = isSelected
                            ? formData.trustBadges.filter((b: string) => b !== badge.id)
                            : [...formData.trustBadges, badge.id]
                          setFormData(p => ({...p, trustBadges: updated}))
                        }}
                        className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all",
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                            : 'border-slate-200 dark:border-slate-800 dark:hover:border-slate-700')}>
                        <badge.icon className={cn("w-5 h-5", isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{badge.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </Section>

            <Section icon={Truck} title="Store Policies" pro={!isEligible}>
              <div className="space-y-4">
                <div>
                  <Label>Return Policy</Label>
                  <Textarea name="returnPolicy" value={formData.returnPolicy} onChange={handleChange}
                    placeholder="7-day easy returns. No questions asked." rows={2} disabled={isPending || !isEligible} className="mt-1.5" />
                </div>
                <div>
                  <Label>Shipping Info</Label>
                  <Textarea name="shippingInfo" value={formData.shippingInfo} onChange={handleChange}
                    placeholder="Free delivery on orders above ₹499. 3-5 business days." rows={2} disabled={isPending || !isEligible} className="mt-1.5" />
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* ═══════════════ TAB: SOCIAL & CHAT ═══════════════ */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <Section icon={MessageCircle} title="WhatsApp Chat Widget" pro={!isEligible}>
              <ToggleRow label="Floating Chat Button" description="Show WhatsApp chat button on all pages" checked={formData.chatWidgetEnabled} onChange={v => handleToggle('chatWidgetEnabled', v)} disabled={!isEligible} />
              {formData.chatWidgetEnabled && (
                <div className="mt-3">
                  <Label>Pre-filled Message</Label>
                  <Input name="chatWidgetMessage" value={formData.chatWidgetMessage} onChange={handleChange}
                    placeholder="Hi! I found your store online..." disabled={isPending || !isEligible} className="mt-1.5" />
                  <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/30">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-800 dark:text-green-300">Chat Preview</p>
                      <p className="text-[10px] text-green-600 dark:text-green-400">This floating button appears on your store</p>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section icon={Share2} title="Social Media Links" pro={!isEligible}>
              <div className="grid sm:grid-cols-2 gap-4">
                <SocialInput icon={Instagram} label="Instagram" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange} placeholder="@yourbusiness" disabled={isPending || !isEligible} />
                <SocialInput icon={Facebook} label="Facebook" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange} placeholder="facebook.com/yourbusiness" disabled={isPending || !isEligible} />
                <SocialInput icon={Twitter} label="Twitter / X" name="socialTwitter" value={formData.socialTwitter} onChange={handleChange} placeholder="@yourbusiness" disabled={isPending || !isEligible} />
                <SocialInput icon={MessageCircle} label="WhatsApp" name="socialWhatsApp" value={formData.socialWhatsApp} onChange={handleChange} placeholder="+91 98765 43210" disabled={isPending || !isEligible} />
              </div>
            </Section>
          </div>
        )}

        {/* ═══════════════ TAB: SEO ═══════════════ */}
        {activeTab === 'seo' && (
          <Section icon={Search} title="SEO & Meta Tags" pro={!isEligible}>
            <div className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange}
                  placeholder={`${profile.business_name || 'My Store'} — Best Products Online`}
                  disabled={isPending || !isEligible} maxLength={60} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{formData.seoTitle.length}/60</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={2}
                  placeholder="Discover amazing products at great prices!"
                  disabled={isPending || !isEligible} maxLength={160} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{formData.seoDescription.length}/160</p>
              </div>
              {(formData.seoTitle || formData.seoDescription) && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Google Preview</p>
                  <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">{formData.seoTitle || `${profile.business_name} | ResellerPro Store`}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs">resellerpro.in/{formData.shop_slug || 'your-store'}</p>
                  <p className="text-slate-600 dark:text-slate-350 text-xs mt-0.5 line-clamp-2">{formData.seoDescription || `Products from ${profile.business_name}`}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ═══════════════ TAB: FOOTER ═══════════════ */}
        {activeTab === 'footer' && (
          <Section icon={MapPin} title="Custom Footer" pro={!isEligible}>
            <div className="space-y-4">
              <div>
                <Label>About Text</Label>
                <Textarea name="footerAbout" value={formData.footerAbout} onChange={handleChange}
                  placeholder="We are a trusted business delivering quality products since 2020."
                  rows={2} disabled={isPending || !isEligible} className="mt-1.5" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> Email</Label>
                  <Input name="footerEmail" value={formData.footerEmail} onChange={handleChange}
                    placeholder="contact@yourbusiness.com" disabled={isPending || !isEligible} className="mt-1.5" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> Phone</Label>
                  <Input name="footerPhone" value={formData.footerPhone} onChange={handleChange}
                    placeholder="+91 98765 43210" disabled={isPending || !isEligible} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Address</Label>
                <Textarea name="footerAddress" value={formData.footerAddress} onChange={handleChange}
                  placeholder="123, MG Road, Bangalore, Karnataka 560001"
                  rows={2} disabled={isPending || !isEligible} className="mt-1.5" />
              </div>
            </div>
          </Section>
        )}

        {/* ═══════════════ TAB: ADVANCED ═══════════════ */}
        {activeTab === 'advanced' && (
          <Section icon={Zap} title="Custom CSS" pro={!isEligible}>
            <p className="text-xs text-slate-500 mb-3">Add custom CSS to further customize your store&apos;s appearance. For advanced users only.</p>
            <Textarea name="customCss" value={formData.customCss} onChange={handleChange}
              placeholder={`.shop-header { border-radius: 0; }\n.product-card { box-shadow: none; }`}
              rows={6} className="font-mono text-xs" disabled={isPending || !isEligible} />
          </Section>
        )}

        {/* ═══════════════ SAVE BAR ═══════════════ */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 -mx-6 px-6 py-4 flex items-center justify-between z-20 rounded-b-2xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formData.shop_slug && isEligible && (
              <a href={`/store/${formData.shop_slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Preview Store <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Check className="mr-2 h-4 w-4" /> Save Settings</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
 
// ─── Helper Components ──────────────────────────────────────
function Section({ icon: Icon, title, children, pro }: { icon: any; title: string; children: React.ReactNode; pro?: boolean }) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative", pro && 'opacity-60 pointer-events-none select-none')}>
      {pro && (
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
          <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-950/30 mb-3"><Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Professional Plan Required</p>
          <Link href="/settings/subscription"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white"><Crown className="w-3.5 h-3.5 mr-1.5" /> Upgrade Now</Button></Link>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4"><Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /><h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2></div>
      {children}
    </div>
  )
}
 
function ToggleRow({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p><p className="text-xs text-slate-500 dark:text-slate-400">{description}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}
 
function SocialInput({ icon: Icon, label, name, value, onChange, placeholder, disabled }: { icon: any; label: string; name: string; value: string; onChange: any; placeholder: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs"><Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {label}</Label>
      <Input name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className="text-sm" />
    </div>
  )
}
 
function ColorPicker({ label, name, value, onChange, onSet, presets }: { label: string; name: string; value: string; onChange: any; onSet: (v: string) => void; presets: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input type="color" name={name} value={value} onChange={onChange} className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-800 cursor-pointer p-0.5 bg-white dark:bg-slate-900" />
        <Input value={value} onChange={onChange} name={name} className="w-28 uppercase font-mono" maxLength={7} />
      </div>
      <div className="flex gap-1.5">
        {presets.map(c => (
          <button key={c} type="button" onClick={() => onSet(c)}
            className={cn("w-6 h-6 rounded-md border-2 transition-all hover:scale-110", value === c ? 'border-slate-900 dark:border-slate-100 scale-110' : 'border-transparent')}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  )
}
