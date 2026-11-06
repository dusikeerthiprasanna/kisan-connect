import React, { useState } from 'react';
import { useStore } from '../services/store';
import { useTranslation } from 'react-i18next';
import { formatDateIndian } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Tractor,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  Check,
  X,
  Power,
  Calendar,
  Trash2,
  CalendarOff,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface OwnerDashboardPageProps {
  onNavigateToAddEquipment: () => void;
  onSelectEquipment: (id: string) => void;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({
  onNavigateToAddEquipment,
  onSelectEquipment,
}) => {
  const {
    equipment,
    bookings,
    currentUser,
    updateBookingStatus,
    toggleEquipmentAvailability,
    toggleBlockedDate,
    deleteEquipment,
  } = useStore();

  const [selectedEqForDates, setSelectedEqForDates] = useState<string | null>(null);
  const [manualDateInput, setManualDateInput] = useState('');

  const currentOwnerId = currentUser?.id || 'owner-101';
  const myEquipment = equipment.filter(
    (eq) => eq.ownerId === currentOwnerId || eq.ownerId === 'owner-101'
  );

  const myIncomingBookings = bookings.filter(
    (b) => b.ownerId === currentOwnerId || b.ownerId === 'owner-101'
  );

  const totalRevenue = myIncomingBookings
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeBookingsCount = myIncomingBookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Approved'
  ).length;

  const pendingRequests = myIncomingBookings.filter((b) => b.status === 'Pending');

  const handleApprove = (id: string) => {
    updateBookingStatus(id, 'Approved');
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to decline this request?')) {
      updateBookingStatus(id, 'Rejected');
    }
  };

  const handleAddBlockedDate = (eqId: string) => {
    if (!manualDateInput) return;
    toggleBlockedDate(eqId, manualDateInput);
    setManualDateInput('');
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
            Owner Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6E63] dark:text-[#95A69B]">
            {currentUser?.name || 'Venkateswara Rao'} · {myEquipment.length} machines registered in Andhra Pradesh
          </p>
        </div>

        <button
          onClick={onNavigateToAddEquipment}
          className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Machinery</span>
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white dark:bg-[#171F1A] p-5 rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm space-y-2">
          <span className="text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider block">
            Received Token Revenue
          </span>
          <div className="text-2xl font-bold text-[#1E3A2F] dark:text-[#A8BEB1] font-mono">
            Rs {totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
            From advance tokens paid through Razorpay
          </p>
        </div>

        {/* Card 2: Active Jobs */}
        <div className="bg-white dark:bg-[#171F1A] p-5 rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm space-y-2">
          <span className="text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider block">
            Active / Confirmed Jobs
          </span>
          <div className="text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] font-mono">
            {activeBookingsCount}
          </div>
          <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
            Approved & confirmed field operations
          </p>
        </div>

        {/* Card 3: Machinery Listed */}
        <div className="bg-white dark:bg-[#171F1A] p-5 rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm space-y-2">
          <span className="text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider block">
            Active Machinery Fleet
          </span>
          <div className="text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] font-mono">
            {myEquipment.length} units
          </div>
          <p className="text-xs text-[#245835] dark:text-[#88C49E] font-medium">
            {myEquipment.filter((e) => e.isAvailable).length} available for bookings
          </p>
        </div>
      </div>

      {/* Responsive 2-Column Split: Incoming Requests + Machinery Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Incoming Requests */}
        <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 shadow-matte-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E6E2] dark:border-[#233027]">
            <h2 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Incoming Rental Requests
            </h2>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-[#FAF4EB] text-[#785623] border border-[#E9DDC9] text-[11px] font-semibold rounded">
                {pendingRequests.length} Pending
              </span>
            )}
          </div>

          {myIncomingBookings.length === 0 ? (
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] py-8 text-center">
              No rental requests received yet.
            </p>
          ) : (
            <div className="divide-y divide-[#E2E6E2] dark:divide-[#233027]">
              {myIncomingBookings.map((b) => (
                <div key={b.id} className="py-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                        {b.equipmentName}
                      </h4>
                      <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                        Farmer: <strong className="text-[#19261E] dark:text-[#E5ECE7]">{b.farmerName}</strong> ({b.farmerVillage})
                      </p>
                      <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] font-mono mt-0.5">
                        {formatDateIndian(b.startDate)} · {b.quantity} {b.hoursOrDaysType} · Rs {b.totalPrice}
                      </p>
                    </div>

                    <StatusBadge status={b.status} />
                  </div>

                  {/* Approve / Reject Actions */}
                  {b.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="px-3.5 py-1.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1 shadow-matte-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-md border border-rose-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Machinery Fleet & Date Blocking */}
        <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 shadow-matte-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E6E2] dark:border-[#233027]">
            <h2 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              My Machinery Fleet ({myEquipment.length})
            </h2>
          </div>

          <div className="space-y-3">
            {myEquipment.map((eq) => (
              <div
                key={eq.id}
                className="p-3.5 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-stone-200 shrink-0 border border-[#E2E6E2] dark:border-[#233027]">
                      <img
                        src={eq.images[0]}
                        alt={eq.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] truncate">
                        {eq.name}
                      </h4>
                      <span className="text-[11px] font-mono text-[#1E3A2F] dark:text-[#A8BEB1] block">
                        Rs {eq.pricePerHour}/hr · Rs {eq.pricePerDay}/d
                      </span>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleEquipmentAvailability(eq.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors border ${
                      eq.isAvailable
                        ? 'bg-[#EEF5F0] text-[#245835] border-[#CCE0D2]'
                        : 'bg-[#F9EFEF] text-[#823333] border-[#EAD2D2]'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{eq.isAvailable ? 'Active' : 'Paused'}</span>
                  </button>
                </div>

                {/* Maintenance Blocked Dates Strip */}
                <div className="pt-2 border-t border-[#E2E6E2] dark:border-[#233027] text-xs flex items-center justify-between">
                  <span className="text-[11px] text-[#5C6E63] dark:text-[#95A69B]">
                    {eq.blockedDates.length} maintenance dates blocked
                  </span>
                  <button
                    onClick={() =>
                      setSelectedEqForDates(selectedEqForDates === eq.id ? null : eq.id)
                    }
                    className="text-[11px] font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] hover:underline"
                  >
                    {selectedEqForDates === eq.id ? 'Close' : 'Manage Dates'}
                  </button>
                </div>

                {/* Date Input if expanded */}
                {selectedEqForDates === eq.id && (
                  <div className="pt-2 flex items-center gap-2 border-t border-[#E2E6E2]/80 dark:border-[#233027]">
                    <input
                      type="date"
                      value={manualDateInput}
                      onChange={(e) => setManualDateInput(e.target.value)}
                      className="p-1.5 bg-white dark:bg-[#1A2620] border border-[#DCE2DC] dark:border-[#27352D] rounded text-xs text-[#19261E] dark:text-[#E5ECE7]"
                    />
                    <button
                      onClick={() => handleAddBlockedDate(eq.id)}
                      className="px-3 py-1.5 bg-[#1E3A2F] text-white text-xs font-semibold rounded shadow-matte-sm"
                    >
                      Block Date
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
