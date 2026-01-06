'use client';

import { OrderStatus } from '@/types';

interface Props {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  CREATED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created' },
  PAYMENT_PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Payment Pending' },
  PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  FULFILLED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Fulfilled' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status] || statusConfig.CREATED;

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
