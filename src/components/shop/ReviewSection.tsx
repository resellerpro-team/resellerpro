'use client'

import React, { useState } from 'react'
import { Star, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  avatarUrl?: string
}

interface ReviewSectionProps {
  primaryColor?: string
  initialReviews?: Review[]
}

const DUMMY_REVIEWS: Review[] = [
  { id: '1', name: 'Aarav M.', rating: 5, comment: 'Absolutely amazing quality! Exceeded my expectations. The material feels premium.', date: '2 days ago' },
  { id: '2', name: 'Priya K.', rating: 4, comment: 'Very good product, but delivery took a little longer than expected. Overall satisfied.', date: '1 week ago' },
  { id: '3', name: 'Rohan S.', rating: 5, comment: 'Highly recommended! customer service was top notch and the styling is exactly as shown in the pictures.', date: '2 weeks ago' },
]

export function ReviewSection({ primaryColor = '#4f46e5', initialReviews = DUMMY_REVIEWS }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !name || !comment) return alert('Please fill in all fields and select a rating.')
    
    setIsSubmitting(true)
    setTimeout(() => {
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        rating,
        comment,
        date: 'Just now'
      }
      setReviews([newReview, ...reviews])
      setRating(0)
      setName('')
      setComment('')
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div className="w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 mt-12 rounded-[3rem] shadow-sm border border-slate-200/60 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12">
        {/* Left Side: Summary & Form */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Customer Reviews</h2>
            <div className="flex items-end gap-4 mt-4">
              <div className="text-6xl font-black text-slate-900 leading-none">{averageRating}</div>
              <div className="pb-1">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn("w-5 h-5", i < Math.round(Number(averageRating)) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200")} 
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        className={cn("w-8 h-8 transition-colors", 
                          star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe" 
                  className="rounded-xl bg-slate-50 border-slate-200 h-12"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Review</label>
                <Textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="What did you like about the product?" 
                  className="rounded-xl bg-slate-50 border-slate-200 min-h-[120px] resize-none"
                  required 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
                {!isSubmitting && <Send className="w-4 h-4 ml-1" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Reviews List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Most Recent</h3>
          </div>
          
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                      {review.avatarUrl ? (
                         <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200")} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
            
            {reviews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900">No reviews yet</h4>
                <p className="text-sm text-slate-500 mt-1">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
