export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    author: string;
    authorRole: string;
    publishDate: string;
    readingTime: string;
    category: string;
    tags: string[];
    featuredImage: string;
    seoKeywords: string[];
    content: React.ReactNode;
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'scale-reselling-business-2026',
        title: 'How to Scale Your Reselling Business to ₹1 Lakh+ Monthly Revenue in 2026',
        description: 'Discover proven strategies and automation tools that helped 1,000+ resellers scale from ₹20K to ₹1 Lakh+ monthly revenue. Learn the exact systems successful resellers use.',
        author: 'Rahul Sharma',
        authorRole: 'Reselling Business Expert',
        publishDate: '2026-02-01',
        readingTime: '12 min read',
        category: 'Growth Strategy',
        tags: ['Business Growth', 'Revenue Scaling', 'Automation', 'Success Tips'],
        featuredImage: '/blog/scale-business.jpg',
        seoKeywords: [
            'scale reselling business',
            'increase reselling revenue',
            'reseller growth strategies 2026',
            'reselling business automation',
            'how to grow reselling income'
        ],
        content: null // Will be populated in the blog post component
    },
    {
        slug: 'smart-paste-technology-save-time',
        title: 'Smart Paste Technology: How AI Saves Resellers 15+ Hours Every Week',
        description: 'Stop wasting time on manual data entry. Learn how Smart Paste AI technology automatically extracts customer information from WhatsApp messages, saving successful resellers 15+ hours weekly.',
        author: 'Priya Mehta',
        authorRole: 'Product Innovation Lead',
        publishDate: '2026-01-28',
        readingTime: '10 min read',
        category: 'Technology',
        tags: ['AI Technology', 'Time Saving', 'Automation', 'Smart Paste', 'Productivity'],
        featuredImage: '/blog/smart-paste-ai.jpg',
        seoKeywords: [
            'smart paste technology',
            'AI for resellers',
            'automate customer data entry',
            'WhatsApp order automation',
            'save time reselling'
        ],
        content: null
    },
    {
        slug: 'whatsapp-chaos-to-success-story',
        title: 'From WhatsApp Chaos to ₹1 Lakh Monthly Revenue: A Real Reseller Success Story',
        description: 'Meet Amit Kumar, who transformed his struggling side hustle into a ₹1 Lakh+/month reselling empire by switching from WhatsApp chaos to organized systems. His complete journey revealed.',
        author: 'Sneha Patel',
        authorRole: 'Success Stories Editor',
        publishDate: '2026-01-25',
        readingTime: '8 min read',
        category: 'Success Stories',
        tags: ['Case Study', 'Success Story', 'Real Results', 'Inspiration', 'WhatsApp Business'],
        featuredImage: '/blog/success-story.jpg',
        seoKeywords: [
            'reseller success story',
            'WhatsApp order management',
            'organize reselling business',
            'reselling transformation',
            'from side hustle to full time'
        ],
        content: null
    },
    {
        slug: 'professional-invoicing-guide-resellers',
        title: 'The Complete Guide to Professional Invoicing for Resellers (2026 Edition)',
        description: 'Professional invoices increase customer trust by 67% and repeat purchases by 45%. Master the art of creating branded, compliant invoices that make your reselling business look established.',
        author: 'Vikram Singh',
        authorRole: 'Business Operations Consultant',
        publishDate: '2026-01-22',
        readingTime: '14 min read',
        category: 'Business Operations',
        tags: ['Invoicing', 'Professional Growth', 'Branding', 'Customer Trust', 'Best Practices'],
        featuredImage: '/blog/professional-invoicing.jpg',
        seoKeywords: [
            'professional invoices for resellers',
            'branded invoicing guide',
            'invoice templates for small business',
            'how to create professional invoices',
            'reseller invoice best practices'
        ],
        content: null
    }
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogPosts;
}
