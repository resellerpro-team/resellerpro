"use client"

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import FinalCTASection from '@/components/landing/FinalCTASection'
import {
    Check,
    X,
    HelpCircle,
    Zap,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    Info
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
    const plans = [
        {
            name: 'Starter',
            price: '₹0',
            description: 'Perfect for beginners testing the waters.',
            for: 'New Resellers just starting out with less than 10 orders per month.',
            features: [
                '10 orders per month',
                'Unlimited customers',
                'Smart WhatsApp Paste',
                'Basic Invoice Generation',
                'Email support',
            ],
            cta: 'Start Free',
            popular: false
        },
        {
            name: 'Pro',
            price: '₹999',
            description: 'The standard for growing reselling businesses.',
            for: 'Serious sellers doing 20-100 orders monthly who need automation.',
            features: [
                'Everything in Starter',
                '100 orders per month',
                'Advanced Profit Analytics',
                'Remove Branding from Invoice',
                'Priority Chat Support',
                'Product Margin Calculator'
            ],
            cta: 'Get Pro Now',
            popular: true
        },
        {
            name: 'Business',
            price: '₹1,999',
            description: 'Ultimate power for high-volume sellers.',
            for: 'Scaling business with team members and high order volume.',
            features: [
                'Everything in Pro',
                'Unlimited orders',
                'Unlimited products',
                'AI WhatsApp Assistant',
                'Multiple Team Members',
                'Custom Domain for Catalog',
                'Dedicated Account Manager'
            ],
            cta: 'Scale Your Business',
            popular: false
        }
    ]

    const comparisonTable = [
        { feature: 'Orders per month', starter: '10', pro: '100', business: 'Unlimited' },
        { feature: 'Customer Storage', starter: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
        { feature: 'Profit Analytics', starter: false, pro: true, business: true },
        { feature: 'Invoice Branding', starter: 'ResellerPro Badge', pro: 'Custom Branding', business: 'Custom Branding' },
        { feature: 'AI Assistant', starter: false, pro: false, business: true },
        { feature: 'Team Members', starter: '1 Member', pro: '1 Member', business: 'Up to 5 Members' },
        { feature: 'Support', starter: 'Email', pro: 'Priority Chat', business: '24/7 Dedicated' },
        { feature: 'Smart Paste', starter: true, pro: true, business: true },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-20">
                {/* Hero */}
                <section className="relative py-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]" />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Investment in Growth</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Simple & <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Transparent Pricing</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                            Choose a plan that grows with your business. No hidden fees. Cancel anytime.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col h-full ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10 bg-white dark:bg-slate-900' : 'border-border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-lg'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground h-12 leading-tight">{plan.description}</p>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-extrabold tracking-tighter">{plan.price}</span>
                                        <span className="text-muted-foreground font-medium text-lg">/mo</span>
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-8">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Who is this for?</p>
                                    <p className="text-sm font-medium">{plan.for}</p>
                                </div>

                                <div className="space-y-4 flex-grow mb-10">
                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex gap-3 text-sm">
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-slate-400'}`} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href={`/signup?plan=${plan.name.toLowerCase()}`} className="w-full">
                                    <button className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all ${plan.popular ? 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/30 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95'}`}>
                                        {plan.cta}
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ROI Section */}
                <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-8">The Investment <br /> <span className="text-primary">That Pays for Itself</span></h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Most tools are an expense. ResellerPro is an investment. Our automation eliminates manual order entry, follow-ups, and tracking — saving you 15+ hours every month.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                                        <div className="text-3xl font-bold text-primary mb-1">15+ Hours</div>
                                        <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Saved Monthly</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                                        <div className="text-3xl font-bold text-green-400 mb-1">20% Faster</div>
                                        <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Order Processing</div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">Based on workflow automation for 50+ monthly orders.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                            <Info className="w-6 h-6 text-primary" />
                                        </div>
                                        <h4 className="text-xl font-bold">Smart ROI</h4>
                                    </div>
                                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                                        <p className="text-lg leading-relaxed italic">
                                            “If you process just 3–4 extra orders using our automation, the Pro plan already pays for itself. The rest is pure profit.”
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-green-400" />
                                            <span className="text-sm font-bold">No-risk 7-day money-back guarantee.</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-8">Calculated based on average reseller profit margins.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Comparison Table */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold mb-4">Detailed Plan Comparison</h2>
                        <p className="text-muted-foreground text-lg">Compare every detail to find the right fit for your scaling stage.</p>
                    </div>
                    <div className="overflow-x-auto rounded-[2.5rem] border border-border shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                                    <th className="py-8 px-8 font-bold text-xl">Core Features</th>
                                    <th className="py-8 px-8 font-bold text-xl text-center">Starter</th>
                                    <th className="py-8 px-8 font-bold text-xl text-center text-primary">Pro</th>
                                    <th className="py-8 px-8 font-bold text-xl text-center">Business</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonTable.map((row, i) => (
                                    <tr key={i} className={`border-b border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${i === comparisonTable.length - 1 ? 'border-none' : ''}`}>
                                        <td className="py-6 px-8 font-semibold text-slate-700 dark:text-slate-300">{row.feature}</td>
                                        <td className="py-6 px-8 text-center text-sm">
                                            {typeof row.starter === 'boolean' ? (
                                                row.starter ? <Check className="w-6 h-6 text-green-500 mx-auto" strokeWidth={3} /> : <X className="w-6 h-6 text-red-500 mx-auto opacity-20" />
                                            ) : (
                                                <span className="font-bold">{row.starter}</span>
                                            )}
                                        </td>
                                        <td className="py-6 px-8 text-center text-sm bg-primary/[0.02]">
                                            {typeof row.pro === 'boolean' ? (
                                                row.pro ? <Check className="w-6 h-6 text-primary mx-auto" strokeWidth={3} /> : <X className="w-6 h-6 text-red-500 mx-auto opacity-20" />
                                            ) : (
                                                <span className="font-extrabold text-primary">{row.pro}</span>
                                            )}
                                        </td>
                                        <td className="py-6 px-8 text-center text-sm">
                                            {typeof row.business === 'boolean' ? (
                                                row.business ? <Check className="w-6 h-6 text-foreground mx-auto" strokeWidth={3} /> : <X className="w-6 h-6 text-red-500 mx-auto opacity-20" />
                                            ) : (
                                                <span className="font-bold">{row.business}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-border">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-center mb-16">Frequently Asked Questions</h2>
                        <div className="grid gap-6">
                            {[
                                { q: 'Can I upgrade or downgrade anytime?', a: 'Yes, absolutely. You can change your plan at any time from your billing dashboard. Updates are prorated.' },
                                { q: 'Is there a free trial?', a: 'We offer a forever-free Starter plan so you can test the core features. For Pro features, we offer a 7-day money-back guarantee.' },
                                { q: 'What happens if I exceed my order limit?', a: 'You won\'t be able to create new orders until your limit resets or you upgrade. We will notify you when you reach 90% of your limit.' },
                                { q: 'Is my data secure?', a: 'Encryption is our baseline. We use industry-standard bank-level security to protect your business data and your customers\' privacy.' },
                                { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, UPI, and net banking via our secure payment partners.' }
                            ].map((faq, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-border shadow-sm">
                                    <h4 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                        {faq.q}
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEO Content Block */}
                <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-foreground">Why a Dedicated Reseller CRM is Worth the Cost</h2>
                    <div className="space-y-6 text-muted-foreground">
                        <p>
                            When choosing a <strong>CRM pricing plan</strong>, resellers often compare the cost of software against the cost of free tools like WhatsApp notes or Excel. However, the true cost of "free" is often measured in lost time, missed follow-ups, and operational errors.
                        </p>
                        <h3 className="text-xl font-bold text-foreground">Automation = Scale</h3>
                        <p>
                            At ₹999/month, the ResellerPro Pro plan is designed to be affordable even for growing Indian resellers. For the price of a single pizza, you get 100 <strong>automated order tracking</strong> slots, professional profit analytics, and branding-free invoices. This allows you to present a "Big Brand" image to your customers from day one.
                        </p>
                        <h3 className="text-xl font-bold text-foreground">Predictable Business Costs</h3>
                        <p>
                            ResellerPro offers <strong>transparent SaaS pricing</strong>. No hidden implementation fees, no surprise storage costs. Whether you are on the Starter plan or scaling with the Business plan, you know exactly what your monthly investment is.
                        </p>
                        <p>
                            If you are a scale-up reseller processing hundreds of orders, our <strong>unlimited CRM for resellers</strong> (Business Plan) provides the infrastructure of a large e-commerce company without the multi-million dollar price tag.
                        </p>
                    </div>
                </section>

                <FinalCTASection />
            </main>

            <Footer />
        </div>
    )
}
