export type OrderStatusColor = 'emerald' | 'blue' | 'orange' | 'red' | 'gray';

export function getOrderStatusColor(status: string): OrderStatusColor {
  if (status.startsWith('S11') || status.startsWith('S12')) {
    return 'emerald';
  }
  if (status.startsWith('S06') || status.startsWith('S07') || status.startsWith('S09') || status.startsWith('S10')) {
    return 'blue';
  }
  if (status.startsWith('S02') || status.startsWith('S03') || status.startsWith('S05')) {
    return 'orange';
  }
  if (status.startsWith('S04') || status.startsWith('S08')) {
    return 'red';
  }
  // S00, S01, S13 and default
  return 'gray';
}

export const STATUS_BAR_COLORS: Record<OrderStatusColor, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

export const STATUS_BADGE_COLORS: Record<OrderStatusColor, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};
