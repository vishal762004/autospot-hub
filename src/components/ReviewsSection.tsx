/**
 * @file ReviewsSection.tsx
 * @description Customer Reviews & Rating Analytics Dashboard displaying average ratings,
 * distribution bars, filter dropdown, write review modal, and local helpful/report interactions.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, Plus, ThumbsUp, Flag, Filter, ShieldCheck, Send, X } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddGlobalReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onAddGlobalReview,
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Form State
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');

  // Helpful/Report State Tracking
  const [helpfulIds, setHelpfulIds] = useState<Record<string | number, boolean>>({});
  const [reportedIds, setReportedIds] = useState<Record<string | number, boolean>>({});

  // Calculate Overall Average Rating
  const totalReviewsCount = reviews.length;
  const avgRatingNumber =
    totalReviewsCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
      : '—';

  // Calculate Distribution Counts (5 star down to 1 star)
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { star, count, percentage };
  });

  // Filtered Reviews list
  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === Number(filterRating);
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    onAddGlobalReview({
      name: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim(),
      verified: false,
      helpfulCount: 0,
    });

    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
    setWriteModalOpen(false);
  };

  const toggleHelpful = (id: string | number) => {
    setHelpfulIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReport = (id: string | number) => {
    setReportedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      
      {/* HEADER TITLE */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Customer Reviews</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          WHAT OUR DRIVERS SAY
        </h2>
        <p className="text-slate-400 text-sm">
          Community feedback shown for this portfolio demo. Purchase verification is not enabled in this client-only build.
        </p>
      </div>

      {/* RATINGS ANALYTICS DASHBOARD CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* Left: Overall Score Card */}
        <div className="text-center space-y-2 p-6 bg-slate-950 border border-slate-800 rounded-2xl">
          <span className="text-5xl font-black text-white">{avgRatingNumber}</span>
          <div className="flex justify-center text-amber-400 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Based on {totalReviewsCount} customer reviews
          </p>
        </div>

        {/* Middle: 5-Star to 1-Star Percentage Bars */}
        <div className="md:col-span-2 space-y-2 text-xs">
          {ratingDistribution.map((item) => (
            <div key={item.star} className="flex items-center gap-3">
              <span className="w-10 font-bold text-slate-300">{item.star} ★</span>
              <div className="flex-1 h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-400 font-mono">{item.percentage}%</span>
            </div>
          ))}
        </div>

      </div>

      {/* ACTIONS & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        
        {/* Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setWriteModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Community Review</span>
          </button>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">Filter Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Ratings ({reviews.length})</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
          </select>
        </div>

      </div>

      {/* REVIEWS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const isHelpful = helpfulIds[rev.id];
            const isReported = reportedIds[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                      {rev.verified === true && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                          <ShieldCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-800'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>{rev.date}</span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHelpful(rev.id)}
                      className={`flex items-center gap-1 font-semibold transition-colors ${
                        isHelpful ? 'text-emerald-400' : 'hover:text-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{isHelpful ? 'Helpful (1)' : 'Helpful'}</span>
                    </button>

                    <button
                      onClick={() => toggleReport(rev.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isReported ? 'text-rose-400' : 'hover:text-rose-300'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{isReported ? 'Reported' : 'Report'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-400">No reviews found for this rating filter.</p>
          </div>
        )}
      </div>

      {/* WRITE A REVIEW MODAL */}
      {writeModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setWriteModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <button
              onClick={() => setWriteModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white">Write a Dealership Review</h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Star Rating</label>
                <div className="flex gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewerRating(star)}
                      className="text-amber-400 focus:outline-none p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= reviewerRating ? 'fill-amber-400' : 'text-slate-800'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Review & Feedback</label>
                <textarea
                  placeholder="Write about your experience with our cars or service..."
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Review</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </section>
  );
};
