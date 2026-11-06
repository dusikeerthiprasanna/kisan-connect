import React, { useState } from 'react';
import { Equipment } from '../../types';
import { useStore } from '../../services/store';
import { useTranslation } from 'react-i18next';
import { BookingCalendar } from './BookingCalendar';
import { hasDateOverlap, getDatesInRange, formatDateIndian } from '../../utils/date';
import { processRazorpayPayment } from '../../services/payment';
import {
  X,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Tractor,
  WifiOff,
} from 'lucide-react';

interface BookingModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onBookingComplete,
}) => {
  const { t } = useTranslation();
  const { currentUser, createBooking, confirmBookingPayment, isOnline } = useStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unitType, setUnitType] = useState<'days' | 'hours'>('days');
  const [hoursCount, setHoursCount] = useState<number>(4);
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    bookingId: string;
    paymentId: string;
    isOffline?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const daysCount =
    startDate && endDate
      ? Math.max(1, getDatesInRange(startDate, endDate).length)
      : startDate
      ? 1
      : 0;

  const quantity = unitType === 'days' ? (daysCount || 1) : hoursCount;
  const rate = unitType === 'days' ? equipment.pricePerDay : equipment.pricePerHour;
  const basePrice = quantity * rate;
  const advanceDeposit = Math.round(basePrice * 0.2);

  const handleSelectRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end || start);
    setOverlapError(null);
  };

  const handleBookAndPay = async (simulateInstant = false) => {
    if (!startDate) {
      setOverlapError('Please select a start date on the calendar.');
      return;
    }

    const effectiveEnd = endDate || startDate;

    if (hasDateOverlap(startDate, effectiveEnd, equipment.blockedDates)) {
      setOverlapError(
        t('booking.dateOverlapError', 'Selected dates are already booked or blocked by the owner. Please pick other dates.')
      );
      return;
    }

    setOverlapError(null);
    setIsProcessing(true);

    try {
      const newBooking = createBooking({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
        equipmentImage: equipment.images[0],
        farmerId: currentUser?.id || 'farmer-001',
        farmerName: currentUser?.name || 'Ramesh Babu',
        farmerPhone: currentUser?.phone || '+91 98480 98765',
        farmerVillage: currentUser?.village || 'Poranki',
        ownerId: equipment.ownerId,
        ownerName: equipment.ownerName,
        startDate,
        endDate: effectiveEnd,
        hoursOrDaysType: unitType,
        quantity,
        pricePerUnit: rate,
        totalPrice: basePrice,
        status: 'Approved',
        paymentStatus: 'Pending',
      });

      if (!isOnline || simulateInstant) {
        await new Promise((r) => setTimeout(r, 400));
        const simPayId = `pay_${isOnline ? 'sim' : 'offline'}_${Date.now().toString(36).toUpperCase()}`;
        confirmBookingPayment(newBooking.id, simPayId);
        setPaymentSuccessData({
          bookingId: newBooking.id,
          paymentId: simPayId,
          isOffline: !isOnline,
        });
      } else {
        await processRazorpayPayment({
          amountRupees: advanceDeposit,
          description: `Token for ${equipment.name} (${quantity} ${unitType})`,
          customerName: currentUser?.name || 'Farmer',
          customerPhone: currentUser?.phone || '9848000000',
          onSuccess: (paymentId) => {
            confirmBookingPayment(newBooking.id, paymentId);
            setPaymentSuccessData({
              bookingId: newBooking.id,
              paymentId,
              isOffline: false,
            });
          },
          onFailure: (err) => {
            setOverlapError(`Payment could not be completed: ${err.message || 'Cancelled'}`);
          },
        });
      }
    } catch (err: any) {
      setOverlapError(err?.message || 'An error occurred during booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[92vh] bg-white dark:bg-[#171F1A] rounded-xl shadow-matte-lg flex flex-col overflow-hidden border border-[#E2E6E2] dark:border-[#233027]"
        role="dialog"
        aria-label="Book Equipment"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between bg-[#F7F9F7] dark:bg-[#151D18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#1E3A2F] flex items-center justify-center text-white shadow-matte-sm">
              <Tractor className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#19261E] dark:text-[#E5ECE7] leading-tight">
                {equipment.name}
              </h2>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                Owner: {equipment.ownerName} · {equipment.location.village}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] rounded-md hover:bg-[#EEF2EE] dark:hover:bg-[#1E2922]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {paymentSuccessData ? (
            /* Confirmation Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#245835] dark:text-[#88C49E] flex items-center justify-center mx-auto border border-[#CCE0D2] dark:border-[#2B4B37]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#19261E] dark:text-[#E5ECE7]">
                  Reservation Confirmed
                </h3>
                {paymentSuccessData.isOffline ? (
                  <p className="text-xs text-[#785623] dark:text-[#DDB278] font-medium mt-1 flex items-center justify-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Saved in offline outbox. Will sync automatically once online.</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] mt-1 font-mono">
                    Payment ID: {paymentSuccessData.paymentId}
                  </p>
                )}
              </div>

              <div className="bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg p-4 text-left border border-[#E2E6E2] dark:border-[#233027] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C6E63] dark:text-[#95A69B]">Machinery:</span>
                  <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">{equipment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6E63] dark:text-[#95A69B]">Dates:</span>
                  <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                    {formatDateIndian(startDate)} {endDate && endDate !== startDate ? `to ${formatDateIndian(endDate)}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6E63] dark:text-[#95A69B]">Duration:</span>
                  <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                    {quantity} {unitType}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E2E6E2] dark:border-[#233027] pt-2 font-semibold text-xs">
                  <span>Advance Token Paid:</span>
                  <span className="text-[#1E3A2F] dark:text-[#A8BEB1] font-mono">Rs {advanceDeposit}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onBookingComplete(paymentSuccessData.bookingId);
                  onClose();
                }}
                className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white rounded-md text-xs font-semibold shadow-matte-sm transition-colors"
              >
                Go to My Reservations
              </button>
            </div>
          ) : (
            /* Booking Form */
            <>
              {/* Unit Type */}
              <div>
                <label className="block text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider mb-2">
                  Rental Duration Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUnitType('days')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      unitType === 'days'
                        ? 'border-[#1E3A2F] bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1E3A2F] dark:text-[#A8BEB1] font-semibold'
                        : 'border-[#E2E6E2] dark:border-[#233027] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7]'
                    }`}
                  >
                    <div className="text-xs font-semibold">Daily Rental</div>
                    <div className="text-[11px] font-mono text-[#5C6E63] dark:text-[#95A69B]">Rs {equipment.pricePerDay} / day</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnitType('hours')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      unitType === 'hours'
                        ? 'border-[#1E3A2F] bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1E3A2F] dark:text-[#A8BEB1] font-semibold'
                        : 'border-[#E2E6E2] dark:border-[#233027] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7]'
                    }`}
                  >
                    <div className="text-xs font-semibold">Hourly Rental</div>
                    <div className="text-[11px] font-mono text-[#5C6E63] dark:text-[#95A69B]">Rs {equipment.pricePerHour} / hr</div>
                  </button>
                </div>
              </div>

              {/* Hours count if hourly */}
              {unitType === 'hours' && (
                <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#19261E] dark:text-[#E5ECE7]">Hours Needed:</span>
                  <div className="flex items-center gap-1.5">
                    {[2, 4, 6, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoursCount(h)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          hoursCount === h
                            ? 'bg-[#1E3A2F] text-white'
                            : 'bg-white dark:bg-[#1A2620] text-[#19261E] dark:text-[#E5ECE7] border border-[#DCE2DC] dark:border-[#27352D]'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div>
                <label className="block text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider mb-2">
                  Select Field Dates
                </label>
                <BookingCalendar
                  blockedDates={equipment.blockedDates}
                  startDate={startDate}
                  endDate={endDate}
                  onSelectRange={handleSelectRange}
                />
              </div>

              {overlapError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{overlapError}</span>
                </div>
              )}

              {/* Price Calculation Card */}
              <div className="bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg p-4 border border-[#E2E6E2] dark:border-[#233027] space-y-2 text-xs">
                <div className="flex justify-between text-[#5C6E63] dark:text-[#95A69B]">
                  <span>
                    Base Rate ({quantity} {unitType} × Rs {rate}):
                  </span>
                  <span className="font-mono font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                    Rs {basePrice}
                  </span>
                </div>
                <div className="flex justify-between text-[#245835] dark:text-[#88C49E]">
                  <span>Operator Service:</span>
                  <span className="font-medium">
                    {equipment.operatorIncluded ? 'Included FREE' : 'Self-drive'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E2E6E2] dark:border-[#233027] pt-2 text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                  <span>Total Estimated Cost:</span>
                  <span className="font-mono text-[#1E3A2F] dark:text-[#A8BEB1]">Rs {basePrice}</span>
                </div>
                <div className="bg-[#EEF5F0] dark:bg-[#1A2E22] p-2.5 rounded border border-[#CCE0D2] dark:border-[#2B4B37] text-xs font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] flex justify-between">
                  <span>Advance Token to Lock Slot (20%):</span>
                  <span className="font-mono font-bold">Rs {advanceDeposit}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={!startDate || isProcessing}
                  onClick={() => handleBookAndPay(false)}
                  className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] disabled:opacity-50 text-white rounded-md text-xs sm:text-sm font-semibold shadow-matte-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing...' : `Pay Rs ${advanceDeposit} Token via Razorpay`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!startDate || isProcessing}
                  onClick={() => handleBookAndPay(true)}
                  className="w-full py-2 bg-white dark:bg-[#1A2620] hover:bg-[#F7F9F7] text-[#1E3A2F] dark:text-[#A8BEB1] border border-[#DCE2DC] dark:border-[#27352D] rounded-md text-xs font-medium transition-colors"
                >
                  <span>Quick Instant Demo Reservation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
