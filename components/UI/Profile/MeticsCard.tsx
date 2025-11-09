import React from 'react';

//styles
import styles from '@/components/UI/Profile/profile.module.css'; 

//components
import CountUp from '@/components/UI/CountUp/CountUp';

interface MetricCardProps {
  icon: React.ReactNode;
  number?: number;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  number = 0, 
  title = '', 
  className = '', 
  onClick 
}) => {
  return (
    <div 
      className={`${styles.metric_card} ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.metric_card__icon}>
        {icon}
      </div>
      <div className={styles.metric_card__number}>
        <CountUp
          from={0}
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

export default React.memo(MetricCard);