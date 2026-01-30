import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createAdminClient()

        // Fetch Storage Buckets
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets()

        if (bucketsError) throw bucketsError

        // Helper for recursive size calculation
        async function getFullBucketSize(bucketId: string, path: string = ''): Promise<number> {
            const { data, error } = await supabase.storage.from(bucketId).list(path, {
                limit: 100,
                offset: 0
            })

            if (error || !data) return 0

            let size = 0
            for (const item of data) {
                if (item.id) {
                    // It's a file
                    size += item.metadata?.size || 0
                } else {
                    // It's a folder (id is null for folders), recurse
                    size += await getFullBucketSize(bucketId, path ? `${path}/${item.name}` : item.name)
                }
            }
            return size
        }

        // Calculate sizes for each bucket using recursive listing
        const bucketsWithDetails = await Promise.all((buckets || []).map(async (bucket) => {
            try {
                const totalSizeBytes = await getFullBucketSize(bucket.id)

                let sizeDisplay = '0.00 B'
                if (totalSizeBytes > 0) {
                    const k = 1024
                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
                    const i = Math.floor(Math.log(totalSizeBytes) / Math.log(k))
                    sizeDisplay = parseFloat((totalSizeBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
                }

                return {
                    ...bucket,
                    sizeMB: sizeDisplay,
                    usedPercent: Math.min(Math.round((totalSizeBytes / (1024 * 1024 * 1024)) * 100), 100) // percent of 1GB
                }
            } catch (err) {
                console.error(`Failed to calculate size for bucket ${bucket.id}:`, err)
                return { ...bucket, sizeMB: '0.00 MB', usedPercent: 0 }
            }
        }))

        // Also fetch database table counts for a general "Data Health" overview
        const tables = ['profiles', 'orders', 'products', 'enquiries', 'payment_transactions']
        const stats: Record<string, number> = {}

        for (const table of tables) {
            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
            stats[table] = count || 0
        }

        // Count businesses from profiles table
        const { count: businessCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('business_name', 'is', null)
            .neq('business_name', '')

        stats['businesses'] = businessCount || 0

        return NextResponse.json({
            success: true,
            data: {
                buckets: bucketsWithDetails,
                database: stats,
                infrastructure: {
                    region: 'ap-south-1',
                    tier: 'PRODUCTION',
                    bandwidth: 'Standard (Metered)',
                    database_size: (stats.profiles * 0.15 + stats.orders * 0.2).toFixed(1) + ' MB'
                }
            }
        })
    } catch (error: any) {
        console.error('Ekodrix system stats error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
