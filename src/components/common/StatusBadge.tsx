import React from 'react';
import { BookingStatus, PaymentStatus } from '../../types';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  BadgeCheck,
  CreditCard,
} from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#235834] dark:text-[#9ECFB0] border-[#CDE1D3] dark:border-[#2B4B37]',
          icon: <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Approved', 'Approved'),
        };
      case 'Confirmed':
        return {
          bg: 'bg-[#EBF3EE] dark:bg-[#1A3024] text-[#1E3A2F] dark:text-[#A6D4B8] border-[#BED6C5] dark:border-[#2C4D39]',
          icon: <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Confirmed', 'Confirmed'),
        };
      case 'Paid':
        return {
          bg: 'bg-[#FAF4EB] dark:bg-[#282114] text-[#785623] dark:text-[#E2B67C] border-[#E9DDC9] dark:border-[#423420]',
          icon: <CreditCard className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: 'Token Paid',
        };
      case 'Completed':
        return {
          bg: 'bg-[#F0F3F1] dark:bg-[#1B2420] text-[#374D41] dark:text-[#A7BCB0] border-[#D6DFDA] dark:border-[#2A3932]',
          icon: <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Completed', 'Completed'),
        };
      case 'Pending':
        return {
          bg: 'bg-[#FAF5ED] dark:bg-[#251E14] text-[#785623] dark:text-[#DDB278] border-[#EAE0CF] dark:border-[#3D301E]',
          icon: <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Pending', 'Pending Approval'),
        };
      case 'Rejected':
        return {
          bg: 'bg-[#F9EFEF] dark:bg-[#2A1818] text-[#823333] dark:text-[#E59797] border-[#EAD2D2] dark:border-[#4E2929]',
          icon: <XCircle className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Rejected', 'Rejected'),
        };
      case 'Cancelled':
      case 'Refunded':
        return {
          bg: 'bg-[#F4F4F4] dark:bg-[#1F1F1F] text-[#555555] dark:text-[#AAAAAA] border-[#E0E0E0] dark:border-[#333333]',
          icon: <Ban className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: t('status.Cancelled', 'Cancelled'),
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          icon: <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />,
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md border shadow-matte-sm ${config.bg}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
