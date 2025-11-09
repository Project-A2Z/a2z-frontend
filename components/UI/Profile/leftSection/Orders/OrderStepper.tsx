import React, { useState } from 'react';

//styles
import styles from '@/components/UI/Profile/leftSection/Orders/order.module.css';


export type OrderStatus = "Under review" | "reviewed" | "prepared" | "shipped" | "delivered" | "cancelled";

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  onStatusUpdate?: (status: OrderStatus) => void;
}

const statusSteps: { key: OrderStatus; label: string }[] = [
  {
    key: 'Under review',
    label: 'قيد المراجعة'
  },
  {
    key: 'reviewed', 
    label: 'تمت المراجعة'
  },
  {
    key: 'prepared',
    label: 'تم التجهيز'
  },
  {
    key: 'shipped',
    label: 'تم الشحن'
  },
  {
    key: 'delivered',
    label: 'تم التسليم'
  },
  {
    key: 'cancelled',
    label: 'ملغي'
  }
];

const CheckIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '20px', height: '20px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function OrderStatusStepper({ 
  currentStatus = 'delivered',
  onStatusUpdate 
}: OrderStatusStepperProps) {
  //console.log('Component props - currentStatus:', currentStatus, 'typeof:', typeof currentStatus);
  
  const [activeStatus, setActiveStatus] = useState<OrderStatus>(currentStatus);

  const getCurrentStepIndex = (status: OrderStatus): number => {
    const index = statusSteps.findIndex(step => step.key === status);
    //console.log(`getCurrentStepIndex for "${status}":`, index);
    //console.log('Available steps:', statusSteps.map(s => s.key));
    
    // Fallback: if status not found, return 0 (first step)
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus); // Max allowed step
  const activeStepIndex = getCurrentStepIndex(activeStatus); // Currently selected step

  const handleStepClick = (stepIndex: number) => {
    const status = statusSteps[stepIndex]?.key;
    if (status && stepIndex <= currentStepIndex) {
      setActiveStatus(status);
      onStatusUpdate?.(status);
    }
  };

  // Determine step state based on both current status (max) and active status (selected)
  const getStepState = (stepIndex: number) => {
    if (stepIndex < activeStepIndex) {
      return 'complete';
    } else if (stepIndex === activeStepIndex) {
      return 'active';
    } else {
      return 'inactive';
    }
  };

  // Determine if step is clickable (based on max allowed currentStatus)
  const isStepClickable = (stepIndex: number) => {
    return stepIndex <= currentStepIndex;
  };

  // Determine if connector line should be active (based on selected activeStatus)
  const isConnectorActive = (stepIndex: number) => {
    return stepIndex < activeStepIndex;
  };

  // Debug logging to help understand the issue
  //console.log('Current Status:', currentStatus, 'Index:', currentStepIndex);
  //console.log('Active Status:', activeStatus, 'Index:', activeStepIndex);

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepsWrapper}>
        {statusSteps.map((step, index) => {
          const stepState = getStepState(index);
          const isClickable = isStepClickable(index);
          const showConnector = index < statusSteps.length - 1;
          const connectorActive = isConnectorActive(index);

          const circleClasses = [
            styles.stepCircle,
            stepState === 'active' ? styles.active : '',
            stepState === 'complete' ? styles.complete : '',
            stepState === 'inactive' ? styles.inactive : '',
            !isClickable ? styles.disabled : ''
          ].filter(Boolean).join(' ');

          // Fix: Show check icon for both complete and active states
          const shouldShowCheckIcon = stepState === 'complete' || stepState === 'active';

          // Debug logging for each step
          //console.log(`Step ${index} (${step.key}):`, {
          //   stepState,
          //   shouldShowCheckIcon,
          //   isClickable,
          //   connectorActive
          // });

          return (
            <React.Fragment key={step.key}>
              <div 
                className={styles.stepItem}
                onClick={() => isClickable && handleStepClick(index)}
              >
                <div className={circleClasses}>
                  {/* Text shown on desktop */}
                  <span className={styles.stepText}>
                    {step.label}
                  </span>
                  
                  {/* Icon shown on mobile - Fixed logic */}
                  <span className={styles.stepCheckIcon}>
                    {shouldShowCheckIcon ? (
                      <CheckIcon />
                    ) : (
                      <span></span>
                    )}
                  </span>
                </div>
                
                {/* Label shown below on mobile */}
                <div className={styles.stepLabel}>
                  {step.label}
                </div>
              </div>

              {/* Individual connector line between each step */}
              {showConnector && (
                <div className={`${styles.stepConnector} ${connectorActive ? styles.stepConnectorActive : styles.stepConnectorInactive}`}>
                  <div className={styles.connectorLine}></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}