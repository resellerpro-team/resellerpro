"use client"

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import {
    Mail,
    MessageSquare,
    ShieldCheck,
    Clock,
    HelpCircle,
    MapPin,
    Send,
    CheckCircle2,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        message: '',
        subject: 'General Inquiry'
    })
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')

        try {
            const res = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to submit')

            setStatus('success')
        } catch (error) {
            console.error(error)
            setStatus('error')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'whatsapp' ? value.replace(/\D/g, '') : value
        }))
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-20">
                {/* Hero */}
                <section className="relative py-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest mb-6">
                            Contact Us
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            We're Here to <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Help You Grow</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Have questions about pricing, features, or onboarding? Our team is ready to assist you in streamlining your reselling business.
                        </p>
                    </div>
                </section>

                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-16">
                        {/* Info Column */}
                        <div className="lg:col-span-5 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-border group hover:border-primary transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Email Support</h4>
                                            <p className="text-primary font-medium">support@resellerpro.in</p>
                                            <p className="text-xs text-muted-foreground mt-1 text-opacity-70">For technical and account help</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-border group hover:border-emerald-500 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">WhatsApp Support</h4>
                                            <p className="text-emerald-600 font-medium">Chat with us on WhatsApp</p>
                                            <p className="text-xs text-muted-foreground mt-1 text-opacity-70">Fastest response for sales/general questions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-8 bg-slate-900 text-white rounded-[3rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                                <div className="flex items-center gap-4 mb-4">
                                    <Clock className="w-6 h-6 text-primary" />
                                    <h4 className="font-bold text-xl">Response Time</h4>
                                </div>
                                <p className="text-slate-400 leading-relaxed">
                                    We typically respond within <span className="text-white font-bold">24 hours</span> on business days. Our team is dedicated to your success.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xl font-bold flex items-center gap-2">
                                    <HelpCircle className="w-6 h-6 text-primary" />
                                    Quick Links
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/pricing" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border hover:text-primary transition-all text-sm font-bold">
                                        Pricing Plans
                                    </Link>
                                    <Link href="/features" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border hover:text-primary transition-all text-sm font-bold">
                                        Feature List
                                    </Link>
                                    <Link href="/about" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border hover:text-primary transition-all text-sm font-bold">
                                        Our Story
                                    </Link>
                                    <Link href="/signup" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border hover:text-primary transition-all text-sm font-bold">
                                        Start Free Trial
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-border shadow-2xl relative">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                                {status === 'success' ? (
                                    <div className="text-center py-20 space-y-6">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-extrabold">Message Received!</h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            Thank you for reaching out. A ResellerPro expert will contact you shortly on your provided WhatsApp number.
                                        </p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="text-primary font-bold hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Your Name *</label>
                                                <input
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Rahul Krishnan"
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">WhatsApp Number *</label>
                                                <input
                                                    name="whatsapp"
                                                    required
                                                    type="tel"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address *</label>
                                            <input
                                                name="email"
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="rahul@exXXXX.com"
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Inquiry Type</label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            >
                                                <option>Sales Inquiry</option>
                                                <option>Technical Support</option>
                                                <option>Partnership</option>
                                                <option>General Question</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Your Message</label>
                                            <textarea
                                                name="message"
                                                rows={4}
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="How can we help your business grow?"
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full py-5 bg-primary text-white rounded-2xl font-extrabold text-xl shadow-xl shadow-primary/30 hover:bg-primary/90 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                        >
                                            {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                            <Send className="w-5 h-5" />
                                        </button>
                                        {status === 'error' && (
                                            <p className="text-center text-red-500 font-bold">Something went wrong. Please try again or chat with us on WhatsApp.</p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Data Privacy Commitment</h4>
                                    <p className="text-sm text-muted-foreground">Your business data is protected with industry-standard encryption.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row border-y md:border-y-0 md:border-x border-border/50 py-8 md:py-0 md:px-8">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Built for Indian Resellers</h4>
                                    <p className="text-sm text-muted-foreground">Specifically tailored for the local social commerce ecosystem.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Based in India</h4>
                                    <p className="text-sm text-muted-foreground">Serving resellers nationwide with localized support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEO Content */}
                <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-foreground uppercase tracking-tight">Need WhatsApp CRM Support?</h2>
                    <div className="space-y-6 text-muted-foreground text-center">
                        <p>
                            We understand that choosing the right <strong>reseller CRM</strong> is a big decision for your growing business. Whether you need a <strong>WhatsApp CRM support</strong> expert to walk you through our features or you're looking for <strong>reseller CRM contact</strong> details to discuss a large-scale enterprise plan, we are here for you.
                        </p>
                        <p>
                            ResellerPro is committed to providing top-tier <strong>CRM customer support in India</strong>. Our team is available via email and WhatsApp to ensure you never face a hurdle while scaling your business from Instagram to the world.
                        </p>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
