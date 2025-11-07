import React from 'react';
import styles from './../../profile.module.css'; 
import MetricCard from '@/components/UI/Profile/MeticsCard'; 

interface Metric {
  icon: React.ReactNode;
  number: number;
  title: string;
  className?: string;
  onClick?: () => void;
}

interface TopMetricsProps {
  metrics?: Metric[];
  className?: string;
}

const TopMetrics: React.FC<TopMetricsProps> = ({ 
  metrics = [], 
  className = '' 
}) => {
  // Ensure metrics is always an array
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  return (
    <div className={styles.top_metrics}>
      {safeMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon}
          number={metric.number}
          title={metric.title}
          className={metric.className || className}
          onClick={metric.onClick}
        />
      ))}
    </div>
  );
};

export default React.memo(TopMetrics);