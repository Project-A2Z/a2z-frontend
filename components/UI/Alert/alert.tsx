"use client";
import React from 'react';
import { Button, ButtonVariant } from './../Buttons/Button';
import styles from './alert.module.css';

export interface AlertButton {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

interface AlertProps {
  message: string;
  setClose: () => void;
  buttons: AlertButton[];
  type?: 'warning' | 'error' | 'info' | 'success';
}

const Alert: React.FC<AlertProps> = ({
  message,
  setClose,
  buttons,
  type = 'info'
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={styles.overlay} onClick={setClose}>
      <div 
        className={`${styles.alert} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.icon}>{getTypeIcon()}</div>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={button.onClick}
              variant={button.variant || 'primary'}
              size="sm"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alert;