import React from 'react';
import { useStore } from '../../services/store';
import { Bell, CheckCheck, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatTimeAmPm, formatDateIndian } from '../../utils/date';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: (bookingId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateToBooking,
}) => {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } =
    useStore();

  if (!isOpen) return null;

  // Filter for current user
  const userNotifications = notifications.filter(
    (n) => !currentUser || n.userId === currentUser.id
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-[#171F1A] h-full shadow-matte-lg flex flex-col border-l border-[#E2E6E2] dark:border-[#233027]"
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between bg-[#F7F9F7] dark:bg-[#151D18]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1A2620] flex items-center justify-center text-[#1E3A2F] dark:text-[#A8BEB1]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7]">Notifications</h2>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="p-1.5 text-xs font-medium text-[#1E3A2F] dark:text-[#A8BEB1] hover:bg-[#EEF2EE] dark:hover:bg-[#1E2922] rounded-md flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] rounded-md hover:bg-[#F0F2F0] dark:hover:bg-[#1E2922] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-[#E2E6E2]/70 dark:divide-[#233027]">
          {userNotifications.length === 0 ? (
            <div className="py-16 text-center text-[#5C6E63] dark:text-[#95A69B]">
              <Bell className="w-8 h-8 mx-auto text-[#87998E] mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7]">No notifications yet</p>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] mt-1">
                Booking updates, confirmations and schedule alerts appear here.
              </p>
            </div>
          ) : (
            userNotifications.map((n) => {
              const dateObj = new Date(n.createdAt);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.bookingId && onNavigateToBooking) {
                      onNavigateToBooking(n.bookingId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    n.read
                      ? 'bg-transparent hover:bg-[#F7F9F7] dark:hover:bg-[#1A2620]'
                      : 'bg-[#EEF3EE]/50 dark:bg-[#1F2C24]/50 border border-[#DCE4DC] dark:border-[#2B3B31]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {n.type === 'booking_approved' || n.type === 'payment_success' ? (
                        <div className="w-6 h-6 rounded-md bg-[#EEF5F0] text-[#245835] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : n.type === 'booking_rejected' ? (
                        <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-[#FAF4EB] text-[#785623] flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] truncate">{n.title}</h4>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A2F] dark:bg-[#88C49E] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] leading-relaxed">{n.message}</p>
                      <div className="mt-1 text-[10px] text-[#87998E] font-mono">
                        {formatDateIndian(n.createdAt)} · {formatTimeAmPm(dateObj.toTimeString().substring(0, 5))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
