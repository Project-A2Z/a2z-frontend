import React, { useState } from 'react';
import styles from './order.module.css';

export type OrderStatus = 'pending' | 'reviewed' | 'processing' | 'shipped' | 'delivered';

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  onStatusUpdate?: (status: OrderStatus) => void;
}

const statusSteps: { key: OrderStatus; label: string }[] = [
  {
    key: 'pending',
    label: 'قيد المراجعة'
  },
  {
    key: 'reviewed', 
    label: 'تمت المراجعة'
  },
  {
    key: 'processing',
    label: 'تم التجهيز'
  },
  {
    key: 'shipped',
    label: 'تم الشحن'
  },
  {
    key: 'delivered',
    label: 'تم التسليم'
  }
];

const CheckIcon = () => (
  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function OrderStatusStepper({ 
  currentStatus = 'pending',
  onStatusUpdate 
}: OrderStatusStepperProps) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus>(currentStatus);

  const getCurrentStepIndex = (status: OrderStatus): number => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex(activeStatus);

  const handleStepClick = (stepIndex: number) => {
    const status = statusSteps[stepIndex]?.key;
    if (status && stepIndex <= currentStepIndex) {
      setActiveStatus(status);
      onStatusUpdate?.(status);
    }
  };

  const handleDemoClick = (status: OrderStatus) => {
    setActiveStatus(status);
    onStatusUpdate?.(status);
  };

  const getConnectorWidth = () => {
    if (currentStepIndex <= 0) return 0;
    return (currentStepIndex / (statusSteps.length - 1)) * 100;
  };

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepsWrapper}>
        {/* Connector Line */}
        <div className={styles.connector}>
          <div 
            className={styles.connectorProgress}
            style={{ width: `${getConnectorWidth()}%` }}
          />
        </div>
        
        {/* Steps */}
        {statusSteps.map((step, index) => {
          const isActive = currentStepIndex === index;
          const isComplete = currentStepIndex > index;
          const isClickable = index <= currentStepIndex;
          
          const circleClasses = [
            styles.stepCircle,
            isComplete ? styles.complete : 
            isActive ? styles.active : styles.inactive,
            !isClickable ? styles.disabled : ''
          ].filter(Boolean).join(' ');

          return (
            <div 
              key={step.key} 
              className={styles.stepItem}
              onClick={() => isClickable && handleStepClick(index)}
            >
              <div className={circleClasses}>
                {isComplete ? (
                  <CheckIcon />
                ) : (
                  <span>{step.label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
}