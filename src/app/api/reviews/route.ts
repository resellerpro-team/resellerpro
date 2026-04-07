import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const mapReview = (row: any) => ({
  id: row.id,
  name: row.customer_name,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at,
  avatarUrl: row.avatar_url || null,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')?.trim()

    if (!productId || !UUID_REGEX.test(productId)) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, customer_name, avatar_url, rating, comment, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    const reviews = (data || []).map(mapReview)
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const productId = body?.productId?.trim()
    const name = body?.name?.trim()
    const comment = body?.comment?.trim()
    const avatarUrl = body?.avatarUrl?.trim() || null
    const rating = Number(body?.rating)

    if (!productId || !UUID_REGEX.test(productId)) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
    }

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Name must be between 2 and 80 characters' }, { status: 400 })
    }

    if (!comment || comment.length < 2 || comment.length > 1000) {
      return NextResponse.json({ error: 'Review must be between 2 and 1000 characters' }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle()

    if (productError) {
      return NextResponse.json({ error: 'Failed to validate product' }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        customer_name: name,
        avatar_url: avatarUrl,
        rating,
        comment,
      })
      .select('id, customer_name, avatar_url, rating, comment, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    return NextResponse.json({
      review: mapReview(data),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
