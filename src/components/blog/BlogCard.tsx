'use client'

import Link from 'next/link'
import { ArrowRight, Clock, Calendar, User } from 'lucide-react'
import { BlogPost } from '@/lib/blogData'

interface BlogCardProps {
    post: BlogPost;
    index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`}>
            <div
                className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
            >
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                {/* Featured Image */}
                <div className="relative h-56 bg-gradient-to-br from-primary/20 via-blue-500/20 to-cyan-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-shimmer" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-primary font-semibold text-xs rounded-full border border-primary/20 shadow-lg">
                            {post.category}
                        </span>
                    </div>

                    {/* Placeholder for actual image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl font-bold text-primary/10">
                            {post.title.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(post.publishDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{post.readingTime}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.description}
                    </p>

                    {/* Author & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {post.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">{post.author}</p>
                                <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                            Read More
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags.slice(0, 3).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 bg-secondary text-foreground text-xs rounded-full border border-border"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}
