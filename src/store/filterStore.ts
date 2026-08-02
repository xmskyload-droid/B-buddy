import { create } from 'zustand';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export type DateFilterType =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

interface FilterState {
  filterType: DateFilterType;
  startDate: Date | null;
  endDate: Date | null;
  selectedSingleDate: Date | null;
  setFilterType: (type: DateFilterType) => void;
  setCustomRange: (start: Date, end: Date) => void;
  setSelectedSingleDate: (date: Date | null) => void;
  resetFilter: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filterType: 'THIS_MONTH',
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  selectedSingleDate: null,

  setFilterType: (type: DateFilterType) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (type) {
      case 'TODAY':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'YESTERDAY':
        const yday = subDays(now, 1);
        start = startOfDay(yday);
        end = endOfDay(yday);
        break;
      case 'THIS_WEEK':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'LAST_WEEK':
        const lastW = subWeeks(now, 1);
        start = startOfWeek(lastW, { weekStartsOn: 1 });
        end = endOfWeek(lastW, { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'LAST_MONTH':
        const lastM = subMonths(now, 1);
        start = startOfMonth(lastM);
        end = endOfMonth(lastM);
        break;
      case 'ALL':
        start = null;
        end = null;
        break;
      case 'CUSTOM':
        break;
    }

    set({
      filterType: type,
      startDate: start,
      endDate: end,
      selectedSingleDate: null,
    });
  },

  setCustomRange: (start: Date, end: Date) => {
    set({
      filterType: 'CUSTOM',
      startDate: startOfDay(start),
      endDate: endOfDay(end),
      selectedSingleDate: null,
    });
  },

  setSelectedSingleDate: (date: Date | null) => {
    if (date) {
      set({
        filterType: 'CUSTOM',
        startDate: startOfDay(date),
        endDate: endOfDay(date),
        selectedSingleDate: date,
      });
    } else {
      set({
        filterType: 'THIS_MONTH',
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        selectedSingleDate: null,
      });
    }
  },

  resetFilter: () => {
    const now = new Date();
    set({
      filterType: 'THIS_MONTH',
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      selectedSingleDate: null,
    });
  },
}));
