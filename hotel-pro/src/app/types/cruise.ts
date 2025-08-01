import { Excursion } from './excursion';

export interface Cruise {
  _id: string;
  name: string;
  excursions: Excursion[];
  startDate: string; // напр. "2025-08-01"
  endDate: string;   // напр. "2025-08-07"
}