import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { Metric } from '../data/metrics';

interface MetricCardProps {
  metric: Metric;
  index: number;
}

export function MetricCard({ metric, index }: MetricCardProps) {
  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`metric-position metric-${metric.tone}`} data-card-index={index}>
      <dl className="metric-card" data-reveal="metric">
        <dt className="metric-label">{metric.label}</dt>
        <dd className="metric-number">
          <TrendIcon className="metric-trend" size={20} strokeWidth={1.35} aria-hidden="true" />
          <span className="sr-only">{metric.value}%</span>
          <span aria-hidden="true" className="metric-count" data-value={metric.value}>
            {metric.value}
          </span>
          <span aria-hidden="true" className="metric-percent">%</span>
        </dd>
      </dl>
    </div>
  );
}
