import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import FinalCTASection from '@/components/landing/FinalCTASection'
import {
    Users,
    Rocket,
    Target,
    Heart,
    Quote,
    TrendingUp,
    Smartphone,
    ShieldCheck,
    Zap
} from 'lucide-react'
import Image from 'next/image'

export const metadata = {
    title: 'About Us | ResellerPro - Empowering the Reseller Revolution',
    description: 'Our story, mission, and vision. Why we built ResellerPro to help WhatsApp and Instagram resellers scale their businesses professionally.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden bg-slate-950 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.15),transparent_50%)]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8">
                            Empowering the <br />
                            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic">
                                Reseller Revolution
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            We're on a mission to give 10,000+ small resellers the technology they need to operate like global brands.
                        </p>
                    </div>
                </section>

                {/* The Problem Section */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-widest">
                                The Pain
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">The Reseller Struggle is Real.</h2>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    You know the feeling. Your WhatsApp is exploding with inquiries, but orders are getting lost in the chat history. You're manually copying addresses into your notes, and you have no idea how much net profit you actually made this month.
                                </p>
                                <p>
                                    The constant shuffle between Instagram DMs, WhatsApp chats, and paper spreadsheets isn't just tiring—it's preventing you from scaling.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    'Orders lost in DMs',
                                    'Manual bookkeeping chaos',
                                    'No customer history',
                                    'Confusion between platforms'
                                ].map((pain, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-sm font-bold">{pain}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
                                alt="Digital struggle"
                                className="rounded-[3rem] shadow-2xl border border-border grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                </section>

                {/* The Origin Story */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest mb-6">
                                Our Story
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-8">Why We Built ResellerPro</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                ResellerPro wasn't born in a sterile corporate boardroom. It was born out of watching real entrepreneurs struggle to handle success.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-6">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold mb-4">Watching the Chaos</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    We saw small sellers spending 12 hours a day on their phones, not talking to customers, but doing data entry. We knew there was a better way.
                                </p>
                            </div>
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold mb-4">Talking to Sellers</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    We interviewed hundreds of WhatsApp and Instagram resellers. We didn't build what we thought they needed—we built what they told us they needed.
                                </p>
                            </div>
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold mb-4">Building the Solution</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    We focused on simplicity. A tool that anyone can use in 2 minutes, without needing a degree in computer science.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="p-12 bg-slate-900 text-white rounded-[3rem] overflow-hidden relative">
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                            <Target className="w-12 h-12 text-primary mb-8" />
                            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
                            <p className="text-slate-400 text-xl leading-relaxed">
                                To simplify the business journey for the next generation of digital entrepreneurs. We provide the CRM power of a multi-million dollar brand without the complexity or the high cost.
                            </p>
                        </div>
                        <div className="p-12 bg-primary text-white rounded-[3rem] overflow-hidden relative">
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <TrendingUp className="w-12 h-12 text-white mb-8" />
                            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
                            <p className="text-primary-foreground/80 text-xl leading-relaxed">
                                To become the operating system for social commerce. We envision a world where every small reseller can compete globally using ResellerPro as their core business engine.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Differentiators */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-2xl mx-auto text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">What Makes Us Different</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Heart, label: 'Indian First', text: 'Built specifically for the Indian reseller ecosystem.' },
                                { icon: ShieldCheck, label: 'Privacy Deep', text: 'We never share your business data. Period.' },
                                { icon: Zap, label: 'Speed Obsessed', text: 'Process an order in < 30 seconds.' },
                                { icon: Users, label: 'Human Support', text: 'Real people on WhatsApp help you scale.' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-border text-center group hover:border-primary transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold mb-2">{item.label}</h4>
                                    <p className="text-sm text-muted-foreground">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Founder Note */}
                <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="w-48 h-48 rounded-[2rem] overflow-hidden bg-slate-800 flex-shrink-0 border-4 border-slate-700">
                                <img src="https://i.pravatar.cc/300?img=68" alt="Founder" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-6">
                                <Quote className="w-12 h-12 text-primary opacity-50" />
                                <h3 className="text-2xl md:text-3xl font-bold italic leading-tight">
                                    "We believe that small sellers deserve big tools. Your passion moves products; our technology moves the paperwork."
                                </h3>
                                <div>
                                    <p className="text-xl font-bold">The ResellerPro Team</p>
                                    <p className="text-slate-400">Founded with ❤️ in India</p>
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
