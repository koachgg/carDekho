import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { getReviewsByCarId, getAISummary } from '../api/client';
import type { Review } from '../store/useAppStore';

interface ReviewSectionProps {
  carId: number;
}

type FilterType = 'All' | 'Verified Owner' | 'Expert';

export default function ReviewSection({ carId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSummaryLoading(true);

    getReviewsByCarId(carId)
      .then((data) => setReviews(data))
      .finally(() => setLoading(false));

    getAISummary(carId)
      .then((data) => setSummary(data.summary))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [carId]);

  const filteredReviews = filter === 'All'
    ? reviews
    : reviews.filter((r) => r.reviewer_type === filter);

  const filters: FilterType[] = ['All', 'Verified Owner', 'Expert'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-lg font-medium text-text-primary">What owners say</h2>

      {/* AI Summary */}
      <div className="bg-accent-muted border border-accent/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-accent">
            AI-generated from owner reviews
          </span>
        </div>
        {summaryLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/5" />
          </div>
        ) : (
          <p className="text-sm text-text-primary leading-relaxed">
            {summary || 'Summary not available.'}
          </p>
        )}
      </div>

      {/* Filter row */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              filter === f
                ? 'bg-accent text-text-inverse'
                : 'border border-border-default text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Individual reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface border border-border-default rounded-xl p-5">
              <div className="skeleton h-4 w-1/3 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const pros = review.pros ? JSON.parse(review.pros) as string[] : [];
            const cons = review.cons ? JSON.parse(review.cons) as string[] : [];

            return (
              <div
                key={review.id}
                className="bg-bg-surface border border-border-default rounded-xl p-5 animate-fade-in"
              >
                {/* Reviewer info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary">{review.reviewer_name}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                      review.reviewer_type === 'Expert'
                        ? 'bg-accent-muted text-accent'
                        : review.reviewer_type === 'Verified Owner'
                        ? 'bg-successBg text-success'
                        : 'bg-bg-raised text-text-secondary'
                    }`}>
                      {review.reviewer_type}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-text-primary mb-2">{review.title}</h4>

                {/* Body */}
                <p className="text-sm text-text-secondary leading-relaxed mb-3">{review.body}</p>

                {/* Pros and Cons */}
                {(pros.length > 0 || cons.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pros.map((pro, i) => (
                      <span key={`pro-${i}`} className="text-[11px] bg-successBg text-success border border-success/20 rounded-full px-2.5 py-0.5">
                        {pro}
                      </span>
                    ))}
                    {cons.map((con, i) => (
                      <span key={`con-${i}`} className="text-[11px] bg-bg-raised text-text-muted border border-border-subtle rounded-full px-2.5 py-0.5">
                        {con}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-[11px]">{review.helpful_count} found helpful</span>
                  </div>
                  {review.ownership_months && (
                    <span className="text-[11px]">
                      {review.ownership_months} months owned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
