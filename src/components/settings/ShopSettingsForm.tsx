'use client'

import { useState, useTransition, type ChangeEvent } from 'react'
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
  Share2, Search, Bell, Eye, Rocket, ArrowRight, Check, X,
  Instagram, Facebook, Youtube, MessageCircle,
  Star, MapPin, Mail, Phone, Clock, Zap,
  Monitor, Smartphone, PanelTop, Quote, Shield,
  Truck, RotateCcw, HeartHandshake, ChevronRight, Copy
} from 'lucide-react'
import { updateShopSettings, uploadShopHeroImage } from '@/app/(dashboard)/settings/actions'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShopClient } from '@/components/shop/ShopClient'

const MOCK_CATEGORIES = [{id: 'c1', name: 'Electronics'}, {id: 'c2', name: 'Fashion'}, {id: 'c3', name: 'Home'}]
const MOCK_PRODUCTS = [
  {id: 'p1', name: 'Premium Wireless Headphones', category: 'Electronics', description: 'Experience the ultimate sound.', selling_price: 2999, original_price: 4999, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'},
  {id: 'p2', name: 'Minimalist Lether Watch', category: 'Fashion', description: 'Timeless elegance for your wrist.', selling_price: 1499, original_price: 2499, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'},
  {id: 'p3', name: 'Smart Fitness Band', category: 'Electronics', description: 'Track your health and stay active.', selling_price: 999, original_price: 1999, image_url: 'https://images.unsplash.com/photo-1575311373934-08f331d2ba22?w=800'},
  {id: 'p4', name: 'Classic Aviator Sunglasses', category: 'Fashion', description: 'Protect your eyes in style.', selling_price: 799, original_price: 1299, image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'}
]

interface ShopSettingsFormProps {
  profile: {
    id: string
    shop_slug?: string
    shop_description?: string
    shop_theme?: any
    business_name?: string
    avatar_url?: string
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
  const [showPreview, setShowPreview] = useState(false)
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false)
  const theme = profile.shop_theme || {}

  const [formData, setFormData] = useState({
    // Basic
    shop_slug: profile.shop_slug || '',
    shop_description: profile.shop_description || '',
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
    heroBackgroundImage: theme.heroBackgroundImage || '',
    heroCtaText: theme.heroCtaText || 'Shop Now',
    heroCtaLink: theme.heroCtaLink || '#products',
    heroBgColor: theme.heroBgColor || '#4f46e5',
    heroPattern: theme.heroPattern || 'none',
    // Announcement Banner
    bannerText: theme.bannerText || '',
    bannerEnabled: theme.bannerEnabled || false,
    // Social Links
    socialInstagram: theme.socialInstagram || '',
    socialFacebook: theme.socialFacebook || '',
    socialYoutube: theme.socialYoutube || '',
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

  const handleHeroImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' })
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB.', variant: 'destructive' })
      e.target.value = ''
      return
    }

    setIsUploadingHeroImage(true)
    try {
      const data = new FormData()
      data.append('userId', profile.id)
      data.append('file', file)

      const result = await uploadShopHeroImage(data)
      if (!result.success || !result.imageUrl) {
        throw new Error(result.message || 'Upload failed')
      }

      setFormData(prev => ({ ...prev, heroBackgroundImage: result.imageUrl }))
      toast({ title: 'Image uploaded', description: 'Hero background image updated.' })
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Could not upload image.',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingHeroImage(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const data = new FormData()
      data.append('userId', profile.id)
      data.append('shop_slug', formData.shop_slug)
      data.append('shop_description', formData.shop_description)
      // Pack everything else into shop_theme JSON
      const { shop_slug, shop_description, ...themeData } = formData
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
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-indigo-100"><Crown className="h-6 w-6 text-indigo-600" /></div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded-full">PRO Feature</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Launch Your Online Store 🚀</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Build a <strong>Shopify-level online store</strong> with hero banners, testimonials, trust badges, custom footer, floating WhatsApp chat, and more — all with your own
                <code className="bg-white/80 px-1.5 py-0.5 rounded mx-1 text-indigo-600 text-xs font-mono">resellerpro.in/{formData.shop_slug || 'your-store'}</code>
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
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center"><Icon className="w-3 h-3 text-indigo-600" /></div>
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
              <div className="bg-white rounded-xl shadow-2xl shadow-indigo-500/10 border border-slate-200 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-sm">{profile.business_name || 'Your Store'}</span>
                  <span className="text-white/70 text-[10px]">Premium Online Store</span>
                </div>
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1"><div className="h-2 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-100 rounded w-1/2" /></div>
                    </div>
                  ))}
                </div>
                <div className="p-3 pt-0">
                  <div className="h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-3 h-3 text-indigo-400 mr-1" />
                    <span className="text-[10px] text-indigo-500 font-bold">Upgrade to Unlock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ LIVE STATUS ═══════════════ */}
      {isEligible && formData.shop_slug && (
        <div className={cn("flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-2xl border",
          formData.storeStatus === 'open' ? 'border-emerald-200 bg-emerald-50/50' :
          formData.storeStatus === 'vacation' ? 'border-amber-200 bg-amber-50/50' : 'border-red-200 bg-red-50/50')}>
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className={cn("p-2.5 rounded-xl shrink-0 shadow-sm",
              formData.storeStatus === 'open' ? 'bg-emerald-500 text-white' : formData.storeStatus === 'vacation' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white')}>
              {formData.storeStatus === 'open' ? <Globe className="h-6 w-6" /> :
               formData.storeStatus === 'vacation' ? <Clock className="h-6 w-6" /> :
               <Lock className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <p className={cn("text-base font-bold",
                formData.storeStatus === 'open' ? 'text-emerald-800' : formData.storeStatus === 'vacation' ? 'text-amber-800' : 'text-red-800')}>
                {formData.storeStatus === 'open' ? '🟢 Store is LIVE' : formData.storeStatus === 'vacation' ? '🟡 Vacation Mode' : '🔴 Store Closed'}
              </p>
              <p className={cn("text-xs font-medium mt-0.5", formData.storeStatus === 'open' ? 'text-emerald-600' : formData.storeStatus === 'vacation' ? 'text-amber-600' : 'text-red-600')}>
                {productCount} products synced & ready
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
             <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg max-w-[200px] sm:max-w-[240px] overflow-hidden">
                <span className="text-xs font-mono text-slate-500 truncate select-all">{`resellerpro.in/${formData.shop_slug}`}</span>
             </div>
             <div className="flex gap-1.5 shrink-0">
               <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`https://resellerpro.in/${formData.shop_slug}`); toast({title: 'Link Copied ✨'}) }} className="h-8 gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 shrink-0">
                 <Copy className="w-3.5 h-3.5" /> Copy
               </Button>
               <Button type="button" variant="outline" size="sm" onClick={() => window.open(`https://wa.me/?text=Check%20out%20my%20store:%20https://resellerpro.in/${formData.shop_slug}`, '_blank')} className="h-8 gap-1.5 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200 shrink-0">
                 <MessageCircle className="w-3.5 h-3.5" /> Share
               </Button>
               <Button type="button" size="sm" onClick={() => window.open(`/${formData.shop_slug}`, '_blank')} className="h-8 gap-1 text-xs shrink-0">
                 Visit <ExternalLink className="w-3 h-3" />
               </Button>
             </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-1 border-b border-slate-200 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700')}>
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
                  <div className="px-3 py-2 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm shrink-0">resellerpro.in/</div>
                  <Input id="shop_slug" name="shop_slug" value={formData.shop_slug} onChange={handleChange} placeholder="your-shop-name" className="rounded-l-none" disabled={isPending} />
                </div>
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
              </div>
            </Section>

            <Section icon={Info} title="Store Description">
              <Textarea name="shop_description" value={formData.shop_description} onChange={handleChange}
                placeholder="Tell customers about your business..." rows={3} disabled={isPending} />
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
                      formData.storeStatus === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300')}>
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[10px] text-slate-500">{opt.desc}</p>
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
                      formData.layout === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300')}>
                    <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                    <p className="text-[10px] text-slate-500">{opt.desc}</p>
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
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white mt-1.5">
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
                          formData.headerStyle === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200')}>
                        <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                        <p className="text-[10px] text-slate-500">{opt.desc}</p>
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
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
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
                  <div>
                    <Label>Background Image URL</Label>
                    <Input
                      name="heroBackgroundImage"
                      value={formData.heroBackgroundImage}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      disabled={isPending || !isEligible}
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-xs text-slate-500">Tip: Use an Unsplash or Supabase image URL for best compatibility.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label htmlFor="hero-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isPending || !isEligible || isUploadingHeroImage}
                          asChild
                        >
                          <span>
                            {isUploadingHeroImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            {isUploadingHeroImage ? 'Uploading...' : 'Upload from device'}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="hero-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroImageUpload}
                        disabled={isPending || !isEligible || isUploadingHeroImage}
                      />
                      {formData.heroBackgroundImage && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-slate-600"
                          onClick={() => setFormData(prev => ({ ...prev, heroBackgroundImage: '' }))}
                          disabled={isPending || !isEligible || isUploadingHeroImage}
                        >
                          Remove image
                        </Button>
                      )}
                    </div>
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
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <input type="color" name="heroBgColor" value={formData.heroBgColor} onChange={handleChange}
                        className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5" disabled={!isEligible} />
                      <Input value={formData.heroBgColor} name="heroBgColor" onChange={handleChange} className="w-28 font-mono uppercase" maxLength={7} disabled={!isEligible} />
                    </div>
                  </div>
                  <div>
                    <Label>Background Pattern</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1.5">
                      {['none', 'dots', 'waves', 'gradient'].map(p => (
                        <button key={p} type="button" onClick={() => setFormData(prev => ({...prev, heroPattern: p}))}
                          className={cn("py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all",
                            formData.heroPattern === p ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600')}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <div
                      className="py-10 px-6 text-center relative overflow-hidden"
                      style={{
                        backgroundColor: formData.heroBgColor,
                        backgroundImage: formData.heroBackgroundImage ? `url(${formData.heroBackgroundImage})` : undefined,
                        backgroundSize: formData.heroBackgroundImage ? 'cover' : undefined,
                        backgroundPosition: formData.heroBackgroundImage ? 'center' : undefined,
                      }}
                    >
                      {formData.heroBackgroundImage && <div className="absolute inset-0 bg-black/35" />}
                      {formData.heroPattern === 'dots' && <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />}
                      {formData.heroPattern === 'waves' && <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`}} />}
                      {formData.heroPattern === 'gradient' && <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />}
                      <div className="relative z-10">
                        <h2 className="text-xl font-black text-white">{formData.heroTitle || 'Your Headline'}</h2>
                        <p className="text-sm text-white/80 mt-1">{formData.heroSubtitle || 'Your subtitle text'}</p>
                        <button className="mt-4 px-6 py-2 bg-white text-sm font-bold rounded-full" style={{color: formData.heroBgColor}}>
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
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
                  {formData.testimonials.map((t: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Testimonial {i + 1}</p>
                      <Input placeholder="Customer name" value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)} disabled={!isEligible} />
                      <Textarea placeholder="What they said about your products..." value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)} rows={2} disabled={!isEligible} />
                      <div className="flex items-center gap-1">
                        <Label className="text-xs mr-2">Rating:</Label>
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button" onClick={() => updateTestimonial(i, 'rating', star)} disabled={!isEligible}>
                            <Star className={cn("w-5 h-5 transition-colors", star <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300')} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                          isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200')}>
                        <badge.icon className={cn("w-5 h-5", isSelected ? 'text-indigo-600' : 'text-slate-400')} />
                        <span className="text-[10px] font-bold text-slate-700">{badge.label}</span>
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
                  <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-800">Chat Preview</p>
                      <p className="text-[10px] text-green-600">This floating button appears on your store</p>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section icon={Share2} title="Social Media Links" pro={!isEligible}>
              <div className="grid sm:grid-cols-2 gap-4">
                <SocialInput icon={Instagram} label="Instagram" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange} placeholder="@yourbusiness" disabled={isPending || !isEligible} />
                <SocialInput icon={Facebook} label="Facebook" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange} placeholder="facebook.com/yourbusiness" disabled={isPending || !isEligible} />
                <SocialInput icon={Youtube} label="YouTube" name="socialYoutube" value={formData.socialYoutube} onChange={handleChange} placeholder="youtube.com/@yourbusiness" disabled={isPending || !isEligible} />
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
                <div className="p-4 bg-white rounded-xl border">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Preview</p>
                  <p className="text-blue-700 text-sm font-medium">{formData.seoTitle || `${profile.business_name} | ResellerPro Store`}</p>
                  <p className="text-emerald-700 text-xs">resellerpro.in/{formData.shop_slug || 'your-store'}</p>
                  <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">{formData.seoDescription || `Products from ${profile.business_name}`}</p>
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
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 -mx-6 px-6 py-4 flex items-center justify-between z-20 rounded-b-2xl">
          <div className="text-xs text-slate-500">
            {formData.shop_slug && isEligible && (
              <button type="button" onClick={() => setShowPreview(true)} className="text-indigo-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <Eye className="w-4 h-4" /> Live Theme Preview
              </button>
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

      {/* ═══════════════ LIVE PREVIEW MODAL ═══════════════ */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 md:p-6">
          <div className="bg-white w-full max-w-[1400px] h-full md:h-[90vh] rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 z-50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="ml-4 text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200">resellerpro.in/{formData.shop_slug || 'preview'}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="rounded-full hover:bg-slate-200 w-8 h-8">
                <X className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto w-full relative bg-slate-50">
               <ShopClient 
                 profile={{...profile, business_name: profile.business_name || 'My Store', shop_theme: formData}} 
                 products={MOCK_PRODUCTS} 
                 categories={MOCK_CATEGORIES} 
               />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ──────────────────────────────────────
function Section({ icon: Icon, title, children, pro }: { icon: any; title: string; children: React.ReactNode; pro?: boolean }) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative", pro && 'opacity-60 pointer-events-none select-none')}>
      {pro && (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
          <div className="p-3 rounded-full bg-indigo-100 mb-3"><Lock className="w-6 h-6 text-indigo-600" /></div>
          <p className="text-sm font-bold text-slate-900 mb-1">Professional Plan Required</p>
          <Link href="/settings/subscription"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white"><Crown className="w-3.5 h-3.5 mr-1.5" /> Upgrade Now</Button></Link>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4"><Icon className="h-5 w-5 text-indigo-600" /><h2 className="text-base font-bold text-slate-900">{title}</h2></div>
      {children}
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-sm font-medium text-slate-900">{label}</p><p className="text-xs text-slate-500">{description}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

function SocialInput({ icon: Icon, label, name, value, onChange, placeholder, disabled }: { icon: any; label: string; name: string; value: string; onChange: any; placeholder: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs"><Icon className="w-3.5 h-3.5 text-slate-500" /> {label}</Label>
      <Input name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className="text-sm" />
    </div>
  )
}

function ColorPicker({ label, name, value, onChange, onSet, presets }: { label: string; name: string; value: string; onChange: any; onSet: (v: string) => void; presets: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input type="color" name={name} value={value} onChange={onChange} className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5" />
        <Input value={value} onChange={onChange} name={name} className="w-28 uppercase font-mono" maxLength={7} />
      </div>
      <div className="flex gap-1.5">
        {presets.map(c => (
          <button key={c} type="button" onClick={() => onSet(c)}
            className={cn("w-6 h-6 rounded-md border-2 transition-all hover:scale-110", value === c ? 'border-slate-900 scale-110' : 'border-transparent')}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  )
}
