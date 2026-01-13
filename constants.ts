import { User, UserRole } from './types';

// Production: Initial System Defaults only.
// Real data is fetched from the database/API.

export const CHART_DATA_HISTORY_TEMPLATE = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
];

export const CHART_DATA_HISTORY = [
  { name: 'May', value: 45000 },
  { name: 'Jun', value: 48000 },
  { name: 'Jul', value: 47500 },
  { name: 'Aug', value: 51000 },
  { name: 'Sep', value: 52500 },
  { name: 'Oct', value: 54000 },
];

export const CHART_DATA_REQUESTS = [
  { name: 'Mon', value: 2 },
  { name: 'Tue', value: 5 },
  { name: 'Wed', value: 3 },
  { name: 'Thu', value: 8 },
  { name: 'Fri', value: 12 },
  { name: 'Sat', value: 4 },
  { name: 'Sun', value: 1 },
];