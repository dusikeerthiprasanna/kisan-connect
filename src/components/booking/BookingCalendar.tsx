import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Ban, CheckCircle } from 'lucide-react';

interface BookingCalendarProps {
  blockedDates: string[]; // ISO YYYY-MM-DD
  startDate: string;
  endDate: string;
  onSelectRange: (start: string, end: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  blockedDates,
  startDate,
  endDate,
  onSelectRange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayStr: string) => {
    if (blockedDates.includes(dayStr)) return;

    if (!startDate || (startDate && endDate)) {
      onSelectRange(dayStr, '');
    } else if (startDate && !endDate) {
      if (new Date(dayStr) < new Date(startDate)) {
        onSelectRange(dayStr, '');
      } else {
        onSelectRange(startDate, dayStr);
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Calendar Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h3>
          <p className="text-xs text-slate-500">
            Select start and end dates for equipment deployment
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty slots before month start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-11" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isBlocked = blockedDates.includes(dayStr);
          const isPast = dayStr < todayStr;
          const isStart = startDate === dayStr;
          const isEnd = endDate === dayStr;
          const isInRange =
            startDate &&
            endDate &&
            dayStr >= startDate &&
            dayStr <= endDate;

          const isDisabled = isBlocked || isPast;

          return (
            <button
              key={dayStr}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDateClick(dayStr)}
              className={`h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold flex flex-col items-center justify-center relative transition-all ${
                isStart || isEnd
                  ? 'bg-[#1F4D2C] text-white shadow-xs font-bold'
                  : isInRange
                  ? 'bg-emerald-50 text-[#1F4D2C] font-bold border border-emerald-200'
                  : isDisabled
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{dayNum}</span>
              {isBlocked && (
                <span className="text-[9px] text-rose-500 font-bold block leading-none">
                  Booked
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#1F4D2C]" />
          <span>Selected Date</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
          <span>Deployment Duration</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-200 text-slate-400 flex items-center justify-center">
            <Ban className="w-2.5 h-2.5" />
          </span>
          <span>Unavailable / Booked</span>
        </div>
      </div>
    </div>
  );
};
