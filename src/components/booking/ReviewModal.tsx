import React, { useState } from 'react';
import { Booking } from '../../types';
import { useStore } from '../../services/store';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const { addReview, currentUser } = useStore();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      bookingId: booking.id,
      equipmentId: booking.equipmentId,
      farmerId: currentUser?.id || booking.farmerId,
      farmerName: currentUser?.name || booking.farmerName,
      rating,
      comment: comment.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#1A3322] rounded-[24px] shadow-2xl overflow-hidden border border-[#E2EAE0] dark:border-[#24452E]"
        role="dialog"
        aria-label="Write a Review"
      >
        <div className="px-5 py-4 border-b border-[#E2EAE0] dark:border-[#24452E] flex items-center justify-between bg-[#F3F6F1]/70 dark:bg-[#142A1D]/80">
          <h3 className="text-sm font-bold text-[#1B2B1F] dark:text-[#E2EAE0]">Rate & Review Equipment</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7B6E] hover:text-[#1B2B1F] dark:hover:text-[#E2EAE0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#2E8B4A] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-[#1B2B1F] dark:text-[#E2EAE0]">Thank you for your feedback!</h4>
            <p className="text-xs text-[#6B7B6E] dark:text-[#8FA393]">
              Your review helps fellow farmers make informed equipment choices.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-[#F3F6F1] dark:bg-[#142A1D] p-3 rounded-2xl border border-[#E2EAE0]/80 dark:border-[#24452E]">
              <span className="text-[10px] font-extrabold text-[#14532D] dark:text-[#5BB381] uppercase tracking-wider block mb-0.5">
                Equipment
              </span>
              <h4 className="text-xs font-bold text-[#1B2B1F] dark:text-[#E2EAE0] line-clamp-1">{booking.equipmentName}</h4>
              <p className="text-[11px] text-[#6B7B6E] dark:text-[#8FA393]">Owner: {booking.ownerName}</p>
            </div>

            {/* Interactive 5-Star Rating */}
            <div>
              <label className="block text-xs font-bold text-[#1B2B1F] dark:text-[#E2EAE0] mb-2">
                Your Overall Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115"
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-[#C97A1A] text-[#C97A1A] drop-shadow-[0_2px_8px_rgba(201,122,26,0.4)]'
                          : 'text-[#E2EAE0] dark:text-[#24452E]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#14532D] dark:text-[#5BB381] ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-[#1B2B1F] dark:text-[#E2EAE0] mb-1">
                Your Experience & Notes
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mention machine condition, operator punctuality, and field work quality..."
                className="w-full p-3 text-xs bg-[#F3F6F1] dark:bg-[#122419] border border-[#E2EAE0] dark:border-[#24452E] rounded-xl text-[#1B2B1F] dark:text-[#E2EAE0] placeholder:text-[#6B7B6E] focus:outline-none focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#E08A1E] to-[#C97A1A] hover:from-[#C97A1A] text-white rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(201,122,26,0.35)] active:scale-[0.98] transition-all"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
