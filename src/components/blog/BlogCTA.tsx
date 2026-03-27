'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle, TrendingUp } from 'lucide-react'

interface BlogCTAProps {
    variant?: 'primary' | 'secondary' | 'inline' | 'success';
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    stats?: boolean;
}

export default function BlogCTA({
    variant = 'primary',
    title = 'Ready to Transform Your Reselling Business?',
    description = 'Join 12,000+ resellers who are already growing their business with ResellerPro. Start your free trial today—no credit card required.',
    buttonText = 'Start Free Trial',
    buttonLink = '/signup',
    stats = true
}: BlogCTAProps) {

    if (variant === 'inline') {
        return (
            <div className="my-8 p-6 bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 rounded-2xl border-2 border-primary/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-foreground mb-1">{title}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Link href={buttonLink}>
                        <button className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
                            {buttonText}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    if (variant === 'success') {
        return (
            <div className="my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 p-8 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]" />

                <div className="relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Success Stories Like This</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold">
                        {title}
                    </h3>

                    <p className="text-white/90 max-w-2xl mx-auto text-lg">
                        {description}
                    </p>

                    <Link href={buttonLink}>
                        <button className="px-8 py-4 bg-white text-green-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl inline-flex items-center gap-2">
                            {buttonText}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 p-8 lg:p-12 text-white">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%]" />

            <div className="relative z-10 space-y-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold text-sm">Limited Time Offer</span>
                </div>

                {/* Headline */}
                <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
                    {description}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href={buttonLink}>
                        <button className="px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl inline-flex items-center gap-2">
                            {buttonText}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href="/pricing">
                        <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                            View Pricing
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-3xl font-bold mb-1">
                                <TrendingUp className="w-6 h-6" />
                                12K+
                            </div>
                            <p className="text-white/80 text-sm">Active Resellers</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">₹50Cr+</div>
                            <p className="text-white/80 text-sm">Revenue Processed</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">4.9★</div>
                            <p className="text-white/80 text-sm">Average Rating</p>
                        </div>
                    </div>
                )}

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4" />
                    <span>No credit card required • Cancel anytime • 24/7 Support</span>
                </div>
            </div>
        </div>
    )
}
