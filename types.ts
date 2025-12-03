
export type EventType = string;

export type Department = string;

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type UserRole = 'Student' | 'Professional' | 'Entrepreneur' | 'Other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  type: EventType;
  department: Department;
  status: TaskStatus;
  recurrence?: Recurrence;
  order?: number; // For manual ordering
  meetLink?: string;
  location?: string;
  attendees?: string[];
  resources?: ResourceItem[];
}

export interface DocItem {
  id: string;
  title: string;
  type: 'figma' | 'pdf' | 'doc' | 'sheet';
  updatedAt: string;
  author: string;
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
}

export interface ResourceItem {
  id: string;
  url: string;
  type: string;
  title: string;
  category?: string;
}

// Subscription Tracker Types
export type SubscriptionType = 'software' | 'entertainment' | 'utility' | 'rent' | 'service' | 'other';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: Date;
  endDate?: Date;
  link?: string;
  type: SubscriptionType;
  isActive: boolean;
  color?: string; // Custom hex color
  icon?: string; // Icon name key
}

export interface WeatherForecastItem {
  time: string; // "10:00 AM"
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy' | 'Night' | 'Clear';
  humidity?: string;
  windSpeed?: string;
  precipitation?: string;
}

export const getColorForString = (str: string): string => {
  if (!str) return 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400';
  const colors = [
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30';
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
    case 'todo':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  }
};
