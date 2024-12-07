// core/frontend/src/utils/date.ts

import { format, formatDistance, formatRelative, isValid } from 'date-fns';

export const dateUtils = {
  format: (date: Date | string | number, formatStr: string = 'PP'): string => {
    const dateObj = new Date(date);
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid Date';
  },

  relative: (date: Date | string | number): string => {
    const dateObj = new Date(date);
    return isValid(dateObj) ? formatRelative(dateObj, new Date()) : 'Invalid Date';
  },

  timeAgo: (date: Date | string | number): string => {
    const dateObj = new Date(date);
    return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : 'Invalid Date';
  },

  isValid: (date: Date | string | number): boolean => {
    return isValid(new Date(date));
  },

  isFuture: (date: Date | string | number): boolean => {
    const dateObj = new Date(date);
    return isValid(dateObj) && dateObj > new Date();
  },

  isPast: (date: Date | string | number): boolean => {
    const dateObj = new Date(date);
    return isValid(dateObj) && dateObj < new Date();
  },
};
