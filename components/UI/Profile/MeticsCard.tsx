import React from 'react';
import styles from './profile.module.css';

import CountUp from '../CountUp/CountUp';

interface MetricCardProps {
  icon: React.ReactNode;
  number: string | number;
  title: string;
  className?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  number, 
  title, 
  className = '',
  onClick,
}) => {
  return (
    <div className={`${styles.metric_card} ${className}`} onClick={onClick}>
      <div className={styles.metric_card__icon}>
        {icon}
      </div>
      <div className={styles.metric_card__number}>
        <CountUp from={0}
          to={Number(number)}
          separator=","
          direction="up"
          duration={1}
          className={styles.countup}
        />
      </div>
      <div className={styles.metric_card__title}>
        {title}
      </div>
    </div>
  );
};

export default MetricCard;