"use client";
import React from 'react';
import styles from './../../profile.module.css';
import MetricCard from '../../../../components/UI/Profile/MeticsCard';

interface TopMetricsProps {
  metrics: Array<{
    icon: React.ReactNode;
    number: string | number ;
    title: string;
    className?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

const TopMetrics: React.FC<TopMetricsProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={styles.top_metrics}>
      {metrics.map((metric, index) => (
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

export default TopMetrics;