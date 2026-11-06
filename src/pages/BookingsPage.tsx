import React, { useState } from 'react';
import { useStore } from '../services/store';
import { useTranslation } from 'react-i18next';
import { Booking } from '../types';
import { formatDateIndian } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReviewModal } from '../components/booking/ReviewModal';
import { processRazorpayPayment } from '../services/payment';
import {
  CalendarDays,
  CreditCard,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  Ban,
  CheckCircle2,
} from 'lucide-react';

interface BookingsPageProps {
  onSelectEquipment: (id: string) => void;
  onExplore: () => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  onSelectEquipment,
  onExplore,
}) => {
  const { bookings, currentUser, updateBookingStatus, confirmBookingPayment, isOnline } =
    useStore();

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const myBookings = bookings.filter(
    (b) => !currentUser || b.farmerId === currentUser.id
  );

  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === 'Upcoming') {
      return b.status === 'Pending' || b.status === 'Approved' || b.status === 'Confirmed';
    }
    if (activeTab === 'Completed') {
      return b.status === 'Completed';
    }
    if (activeTab === 'Cancelled') {
      return b.status === 'Cancelled' || b.status === 'Rejected';
    }
    return true;
  });

  const handlePayNow = async (booking: Booking, simulate = false) => {
    setPayingBookingId(booking.id);
    const advanceAmount = Math.round(booking.totalPrice * 0.2);

    try {
      if (simulate || !isOnline) {
        await new Promise((r) => setTimeout(r, 600));
        const simPayId = `pay_${isOnline ? 'online' : 'offline'}_${Date.now().toString(36).toUpperCase()}`;
        confirmBookingPayment(booking.id, simPayId);
      } else {
        await processRazorpayPayment({
          amountRupees: advanceAmount,
          description: `Token for ${booking.equipmentName}`,
          customerName: booking.farmerName,
          customerPhone: booking.farmerPhone,
          onSuccess: (paymentId) => {
            confirmBookingPayment(booking.id, paymentId);
          },
          onFailure: (err) => {
            alert(`Payment could not be completed: ${err.message || 'Cancelled'}`);
          },
        });
      }
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      updateBookingStatus(bookingId, 'Cancelled');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
            My Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6E63] dark:text-[#95A69B]">
            Track machinery requests, payment status and field job records
          </p>
        </div>

        {/* 3 Tabs: Upcoming, Completed, Cancelled */}
        <div className="flex items-center p-1 bg-[#EEF2EE] dark:bg-[#1A2620] rounded-lg text-xs font-medium border border-[#DCE4DC] dark:border-[#27372D] self-start sm:self-auto">
          {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#25362C] text-[#1E3A2F] dark:text-[#E5ECE7] shadow-matte-sm font-semibold'
                  : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Feed Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-12 text-center space-y-3 shadow-matte-sm">
          <CalendarDays className="w-10 h-10 mx-auto text-[#5C6E63] opacity-60" />
          <h3 className="text-base font-semibold text-[#19261E] dark:text-[#E5ECE7]">
            No {activeTab.toLowerCase()} reservations
          </h3>
          <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] max-w-sm mx-auto">
            Book verified tractors, harvesters, or sprayers for upcoming field tasks.
          </p>
          <button
            onClick={onExplore}
            className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-md shadow-matte-sm hover:bg-[#162E25] transition-colors"
          >
            Find Machinery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookings.map((b) => {
            const isAwaitingPayment = b.status === 'Approved' && b.paymentStatus === 'Pending';
            const isCompleted = b.status === 'Completed';

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-4 shadow-matte-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2F5F2] dark:bg-[#1C2620] shrink-0 border border-[#E2E6E2] dark:border-[#233027]">
                        <img
                          src={b.equipmentImage}
                          alt={b.equipmentName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase block">
                          {b.equipmentCategory}
                        </span>
                        <h3
                          onClick={() => onSelectEquipment(b.equipmentId)}
                          className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] hover:text-[#1E3A2F] dark:hover:text-[#A8BEB1] cursor-pointer line-clamp-1"
                        >
                          {b.equipmentName}
                        </h3>
                      </div>
                    </div>

                    <StatusBadge status={b.status} />
                  </div>

                  {/* Details Strip */}
                  <div className="grid grid-cols-3 gap-2 text-xs py-2.5 px-3 bg-[#F9FAF9] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027]">
                    <div>
                      <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] block">Dates</span>
                      <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] text-[11px]">
                        {formatDateIndian(b.startDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] block">Duration</span>
                      <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] text-[11px]">
                        {b.quantity} {b.hoursOrDaysType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] block">Total</span>
                      <span className="font-bold text-[#1E3A2F] dark:text-[#A8BEB1] font-mono text-xs">
                        Rs {b.totalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Payment Alert if Approved */}
                  {isAwaitingPayment && (
                    <div className="p-3 bg-[#FAF5ED] dark:bg-[#1F1B14] rounded-lg border border-[#E8DDCC] dark:border-[#382F22] space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#785623] dark:text-[#DDB278] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Owner approved. Pay 20% advance token (Rs {Math.round(b.totalPrice * 0.2)}) to confirm slot.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePayNow(b, false)}
                          disabled={payingBookingId === b.id}
                          className="flex-1 py-1.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay with Razorpay</span>
                        </button>

                        <button
                          onClick={() => handlePayNow(b, true)}
                          disabled={payingBookingId === b.id}
                          className="px-3 py-1.5 bg-white dark:bg-[#282114] text-[#785623] dark:text-[#DDB278] border border-[#E0D0B8] dark:border-[#423420] rounded-md text-xs font-medium"
                        >
                          Demo Pay
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E6E2]/80 dark:border-[#233027]">
                  <span className="text-[11px] text-[#5C6E63] dark:text-[#95A69B]">
                    Owner: {b.ownerName}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Rate & Review Button */}
                    {isCompleted && !b.reviewed && (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-2.5 py-1 bg-[#B8762E] hover:bg-[#9E6424] text-white text-xs font-medium rounded-md shadow-matte-sm flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-white" />
                        <span>Review</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {(b.status === 'Pending' || b.status === 'Approved') && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs text-rose-600 hover:underline font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          isOpen={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
        />
      )}
    </div>
  );
};
