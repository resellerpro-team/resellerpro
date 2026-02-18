import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import FinalCTASection from '@/components/landing/FinalCTASection'
import {
    ClipboardPaste,
    Database,
    ShoppingBag,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Zap,
    TrendingUp,
    XCircle,
    CheckCircle,
    HelpCircle,
    Users,
    Search
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Features | ResellerPro - Powerful CRM for WhatsApp Resellers',
    description: 'Explore the powerful features of ResellerPro, the dedicated CRM for WhatsApp and Instagram resellers. Smart Paste, Order Management, Analytics and more.',
}

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            <span>Built for Scale</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                            Powerful CRM Built for <br />
                            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                WhatsApp & Instagram Resellers
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                            Manage orders, track customers, automate follow-ups, and grow your reseller business — all in one place. No more manual data entry.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                                    Start Free Now
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-border rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    View Pricing
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature 1: Smart Paste */}
                <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl -z-10"></div>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border overflow-hidden shadow-2xl">
                                {/* Simulated WhatsApp UI */}
                                <div className="bg-[#075E54] p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Sanjay Nair</p>
                                        <p className="text-emerald-100 text-xs text-opacity-80">Online</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-[#E5DDD5] dark:bg-slate-800 space-y-4 h-64 overflow-y-auto custom-scrollbar">
                                    <div className="bg-white dark:bg-slate-700 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
                                        <p className="text-sm">Hi, I want to order the Sports Jersey.</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-700 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
                                        <p className="text-sm">Name: Sanjay Nair<br />Phone: 9876543210<br />Address: Flat 402, Skyline Heights, Kochi 682001<br />Email: sanjay@example.com</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 border-t border-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-bold">ResellerPro AI Thinking...</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Name</p>
                                            <p className="text-sm font-semibold">Sanjay Nair</p>
                                        </div>
                                        <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Phone</p>
                                            <p className="text-sm font-semibold">9876543210</p>
                                        </div>
                                        <div className="bg-primary/5 p-2 rounded-lg border border-primary/20 col-span-2">
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Address</p>
                                            <p className="text-sm font-semibold text-wrap">Flat 402, Skyline Heights, Kochi 682001</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <ClipboardPaste className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI-Powered Smart Paste</h2>
                            <div className="space-y-4">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Stop wasting hours on manual data entry. ResellerPro's Smart Paste technology extracts customer details instantly from your WhatsApp and Instagram messages.
                                </p>
                                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        How it works:
                                    </h4>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3 text-sm">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                                            <span>Copy the customer's delivery details from your chat.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                                            <span>Paste it into the Smart Paste box in ResellerPro.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                                            <span>Our AI detects Name, Phone, Address, and City instantly.</span>
                                        </li>
                                    </ol>
                                </div>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {['Save 5+ mins per order', 'Zero manual errors', 'Works with any chat style', 'Detects PIN codes'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: CRM Database */}
                <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
                                    <Database className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Centralized CRM Database</h2>
                                <div className="space-y-4">
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        Organize your entire customer universe in one secure place. No more searching through months of WhatsApp chat history to find that one customer.
                                    </p>
                                    <div className="grid gap-4">
                                        <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Track Order History</h4>
                                                <p className="text-sm text-muted-foreground">Every order a customer has ever placed is logged under their profile.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Customer Notes</h4>
                                                <p className="text-sm text-muted-foreground">Save details like sizing preferences or specific shipping instructions.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Tag & Filter</h4>
                                                <p className="text-sm text-muted-foreground">Category customers as "VIP", "Wholesale", or "Needs Follow-up".</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                {/* Background Glow */}
                                <div className="absolute -inset-4 bg-cyan-500/10 rounded-3xl blur-2xl -z-10 group-hover:bg-cyan-500/20 transition-all"></div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col h-[400px] lg:h-[450px]">
                                    {/* CRM Header */}
                                    <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Customers</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-border rounded-lg text-[10px] text-muted-foreground flex items-center gap-2">
                                                <Search className="w-3 h-3" />
                                                <span className="hidden sm:inline">Search...</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {[
                                            { name: 'Sanjay Nair', location: 'Kochi, Kerala', orders: 12, status: 'VIP', color: 'purple' },
                                            { name: 'Rahul Krishnan', location: 'Kochi, Kerala', orders: 8, status: 'Active', color: 'green' },
                                            { name: 'Amit Kumar', location: 'Ernakulam', orders: 5, status: 'New', color: 'blue' },
                                            { name: 'Priya M.', location: 'Kochi', orders: 15, status: 'VIP', color: 'purple' },
                                            { name: 'Rajesh Nair', location: 'Kochi', orders: 3, status: 'Active', color: 'green' },
                                        ].map((customer, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group/row">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold group-hover/row:text-primary transition-colors">{customer.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{customer.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs font-bold">{customer.orders} Orders</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${customer.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                                        customer.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {customer.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-border animate-float hidden lg:block z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">1,200+</p>
                                            <p className="text-xs text-muted-foreground">Active Customers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 3: Order Management */}
                <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="relative">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border p-8 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold">Order Tracking</h4>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Product</span>
                                            <span className="font-bold">Premium Leather Bag</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Selling Price</span>
                                            <span className="font-bold text-green-600">₹2,499</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Cost Price</span>
                                            <span className="font-bold text-red-600">₹1,800</span>
                                        </div>
                                        <div className="pt-4 border-t border-border flex justify-between items-center">
                                            <span className="font-bold">Total Profit</span>
                                            <span className="text-2xl font-bold text-green-600">+₹699</span>
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-bold text-sm">
                                        Update to Shipped
                                    </button>
                                </div>
                            </div>
                            {/* Floating Step Indicators - Adjusted for more space */}
                            <div className="absolute top-1/2 -right-8 translate-x-1/2 -translate-y-1/2 space-y-4 hidden xl:block">
                                {[
                                    { label: 'Inquiry', state: 'done' },
                                    { label: 'Payment', state: 'done' },
                                    { label: 'Pending', state: 'active' },
                                    { label: 'Shipped', state: 'next' },
                                    { label: 'Delivered', state: 'next' },
                                ].map((step, i) => (
                                    <div key={i} className={`flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-border shadow-lg transition-all ${step.state === 'active' ? 'scale-110 border-primary ring-4 ring-primary/10' : 'opacity-40 scale-90 hover:opacity-100'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step.state === 'done' ? 'bg-green-500 text-white' : step.state === 'active' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            {step.state === 'done' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                        </div>
                                        <span className="text-xs font-bold">{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Professional Order Management</h2>
                            <div className="space-y-4">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Reselling is complex when you have 50+ pending orders from different sources. ResellerPro brings structure to the chaos.
                                </p>
                                <div className="space-y-6 pt-4">
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                        <div>
                                            <h4 className="font-bold">Profit Calculation</h4>
                                            <p className="text-sm text-muted-foreground">Automatically calculates your net profit after cost price and shipping. Know exactly how much you're making.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                        <div>
                                            <h4 className="font-bold">Status tracking</h4>
                                            <p className="text-sm text-muted-foreground">Move orders through custom workflows from "Inquiry" to "Delivered". Never forget a shipment again.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                        <div>
                                            <h4 className="font-bold">Payment Tracking</h4>
                                            <p className="text-sm text-muted-foreground">Mark orders as "Paid" or "Pending Payment" to keep your cash flow in check.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 4 & 5: Analytics & Security */}
                <section className="py-16 lg:py-24 bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-0"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Serious Scaling</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">ResellerPro provides the enterprise-level tools you need as you grow from a hobbyist to a brand.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-primary/50 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Real-Time Analytics</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Make data-driven decisions. See which products are your best-sellers and which customer categories bring the most revenue.
                                </p>
                                <ul className="space-y-3">
                                    {['Monthly Revenue Overview', 'Profit Trend Tracking', 'Top Selling Products', 'Customer Growth Rates'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-primary/50 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Secure by Design</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Your business data is your most valuable asset. We use industry-standard encryption to ensure your data stays private and secure.
                                </p>
                                <ul className="space-y-3">
                                    {['256-bit SSL Encryption', 'Private Cloud Storage', 'Privacy-First Policy', 'Secure Login & Auth'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Table */}
                <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Resellers are Switching</h2>
                        <p className="text-lg text-muted-foreground">The difference between "keeping busy" and "running a business".</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-6 px-4 font-bold text-lg">Feature</th>
                                    <th className="py-6 px-4 font-bold text-lg text-red-500">Manual (Notes/Sheets)</th>
                                    <th className="py-6 px-4 font-bold text-lg text-primary bg-primary/5 rounded-t-2xl">ResellerPro CRM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Order Processing', manual: '5-10 mins / order', pro: '< 30 seconds' },
                                    { label: 'Data Entry', manual: 'Manual Typing', pro: 'AI Smart Paste' },
                                    { label: 'Tracking History', manual: 'Scattered in chats', pro: 'Centralized Database' },
                                    { label: 'Profit Analytics', manual: 'Painful calculation', pro: 'Instantly visible' },
                                    { label: 'Search & Find', manual: 'Endless scrolling', pro: 'Instant Lookup' },
                                    { label: 'Customer Follow-up', manual: 'Often forgotten', pro: 'Systematic Tracking' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                        <td className="py-6 px-4 font-semibold">{row.label}</td>
                                        <td className="py-6 px-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-400" />
                                                {row.manual}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 font-bold text-primary bg-primary/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                {row.pro}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* SEO Long-form Content Section */}
                <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950 border-y border-border">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
                        <h2 className="text-3xl font-extrabold mb-8 text-center">Why Every WhatsApp & Instagram Reseller Needs a CRM</h2>

                        <div className="space-y-8 text-muted-foreground leading-relaxed">
                            <p>
                                In the booming era of social commerce, platforms like WhatsApp and Instagram have become the primary storefronts for thousands of entrepreneurs. However, while these platforms are excellent for communication, they were never designed for backend business operations. This is where a dedicated <strong>CRM for resellers</strong> becomes a game-changer.
                            </p>

                            <h3 className="text-xl font-bold text-foreground">The Chaos of Manual Reselling</h3>
                            <p>
                                Most resellers start their journey using simple tools: pen and paper, notes apps, or basic Excel spreadsheets. As your business grows from 5 orders a week to 50 orders a week, these manual systems begin to crumble. You start losing track of which customer has paid, which order needs to be shipped, and most importantly, you lose hours of every day just doing "admin work."
                            </p>
                            <p>
                                An <strong>Instagram order management system</strong> like ResellerPro solves this by automating the most painful part of your workflow: data entry. Our AI-powered "Smart Paste" allows you to convert a messy WhatsApp chat into a structured order in seconds.
                            </p>

                            <h3 className="text-xl font-bold text-foreground">Moving Beyond Spreadsheets</h3>
                            <p>
                                Spreadsheets are static. They don't remind you to follow up with a lead who inquired but didn't buy. They don't show you a live graph of your profit trends. And they certainly don't provide a professional way to manage a growing team.
                            </p>
                            <p>
                                By using a specialized <strong>WhatsApp CRM</strong>, you are not just buying a tool; you are building an asset. You are creating a centralized database of every customer you've ever interacted with. This "data goldmine" allows you to run remarketing campaigns, offer loyalty discounts, and understand your customer's lifetime value.
                            </p>

                            <h3 className="text-xl font-bold text-foreground">Efficiency is Your Competitive Advantage</h3>
                            <p>
                                In the reselling world, the speed of response matters. If it takes you 20 minutes to process an order because you have to type out the address manually, that's 20 minutes you aren't spending on finding new products or talking to new leads.
                            </p>
                            <p>
                                ResellerPro's <strong>order tracking software</strong> is designed specifically for the Indian reseller ecosystem. We understand the nuances of COD orders, shipping through multiple partners, and the importance of WhatsApp-first communication.
                            </p>

                            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 mt-12">
                                <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-4">
                                    <HelpCircle className="w-5 h-5" />
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-foreground mb-2">Is my customer data safe?</h4>
                                        <p className="text-sm">Absolutely. We use industry-standard encryption and never share your business data with third parties. Your database is yours alone.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground mb-2">Can I use it on my mobile phone?</h4>
                                        <p className="text-sm">Yes! ResellerPro is fully mobile-responsive, allowing you to manage your business from anywhere—whether you're at home or on the go.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground mb-2">How many customers can I store?</h4>
                                        <p className="text-sm">Depending on your plan, you can store thousands to unlimited customers. Our CRM is designed to grow with you.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <FinalCTASection />
            </main>

            <Footer />
        </div>
    )
}
