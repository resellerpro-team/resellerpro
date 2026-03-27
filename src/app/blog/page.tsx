import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Search } from 'lucide-react'
import { getAllBlogPosts } from '@/lib/blogData'
import BlogCard from '@/components/blog/BlogCard'

export const metadata: Metadata = {
    title: 'ResellerPro Blog | Expert Tips & Strategies for Reselling Success',
    description: 'Discover proven strategies, automation tips, and success stories from 12,000+ resellers. Learn how to scale your reselling business to ₹1 Lakh+ monthly revenue.',
    keywords: 'reselling blog, reseller tips, business growth strategies, reselling automation, WhatsApp business tips, reseller success stories',
    openGraph: {
        title: 'ResellerPro Blog - Expert Reselling Tips & Success Stories',
        description: 'Transform your reselling business with expert strategies and automation tips.',
        type: 'website',
    },
}

export default function BlogPage() {
    const blogPosts = getAllBlogPosts()

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-background">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Latest Insights & Strategies</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                            Master the Art of{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                                    Reselling
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Expert strategies, automation tips, and real success stories from 12,000+ resellers who scaled their businesses from side hustle to ₹1 Lakh+ monthly revenue
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">12,000+</span> Active Readers
                                </span>
                            </div>
                            <div className="h-4 w-px bg-border hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">Weekly</span> New Articles
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                Latest Articles
                            </h2>
                            <p className="text-muted-foreground">
                                Proven strategies to grow your reselling business
                            </p>
                        </div>

                        {/* Categories (can be expanded) */}
                        <div className="flex items-center gap-3">
                            {['All', 'Growth', 'Technology', 'Success Stories'].map((category) => (
                                <button
                                    key={category}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === 'All'
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Blog Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {blogPosts.map((post, index) => (
                            <BlogCard key={post.slug} post={post} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 lg:py-20 bg-gradient-to-br from-secondary/50 to-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 p-8 lg:p-12 text-white">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

                        <div className="relative z-10 text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <Sparkles className="w-4 h-4" />
                                <span className="font-semibold text-sm">Join Our Community</span>
                            </div>

                            <h3 className="text-3xl sm:text-4xl font-bold">
                                Get Weekly Reselling Tips
                            </h3>

                            <p className="text-white/90 text-lg max-w-2xl mx-auto">
                                Join 12,000+ resellers receiving exclusive strategies, automation tips, and success stories every week. Free forever.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-6 py-4 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <button className="px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl inline-flex items-center justify-center gap-2">
                                    Subscribe
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-white/70 text-sm">
                                No spam. Unsubscribe anytime. Your data is safe with us.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-8 lg:p-12 text-white">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-3xl sm:text-4xl font-bold">
                                    Ready to Transform Your Business?
                                </h3>
                                <p className="text-white/90 text-lg">
                                    Stop reading about success—create it. Join ResellerPro and get all the tools, automation, and support you need to scale to ₹1 Lakh+ monthly revenue.
                                </p>
                                <ul className="space-y-2">
                                    {['Smart Paste AI saves 15+ hours/week', 'Professional invoicing & branding', 'Real-time analytics & insights', '24/7 customer support'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Link href="/signup">
                                    <button className="w-full px-8 py-5 bg-white text-green-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl">
                                        Start Free Trial →
                                    </button>
                                </Link>
                                <Link href="/pricing">
                                    <button className="w-full px-8 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                                        View Pricing
                                    </button>
                                </Link>
                                <p className="text-white/80 text-sm text-center">
                                    No credit card required • 10 orders/month free • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
