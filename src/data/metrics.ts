export interface Metric {
  id: string;
  value: number;
  label: string;
  tone: 'lime' | 'blue' | 'orange' | 'charcoal';
  direction: 'up' | 'down';
}

// Assignment reference figures, not verified commercial performance claims.
export const METRICS: readonly Metric[] = [
  { id: 'pickup-primary', value: 58, label: 'Increase in pick up point use', tone: 'lime', direction: 'up' },
  { id: 'pickup-secondary', value: 27, label: 'Increase in pick up point use', tone: 'blue', direction: 'up' },
  { id: 'calls-primary', value: 23, label: 'Decreased in customer phone calls', tone: 'orange', direction: 'down' },
  { id: 'calls-secondary', value: 40, label: 'Decreased in customer phone calls', tone: 'charcoal', direction: 'down' },
];