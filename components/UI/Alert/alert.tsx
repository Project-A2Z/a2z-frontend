"use client";
import React from 'react';
import { Button } from '@/components/UI/Buttons/Button';
import styles from '@/components/UI/Alert/alert.module.css';

export interface AlertButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
}

interface AlertProps {
  isOpen?: boolean;
  title?: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
  setClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  buttons?: AlertButton[];
}

const Alert: React.FC<AlertProps> = ({
  isOpen = true,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  setClose,
  confirmText = 'OK',
  cancelText = 'Cancel',
  buttons
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

  const handleClose = setClose || onCancel;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div 
        className={`${styles.alert} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.icon}>{getTypeIcon()}</div>
          </div>
        )}
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          {buttons ? (
            buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant || 'outline'}
                size="sm"
              >
                {button.label}
              </Button>
            ))
          ) : (
            <>
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className={styles.cancelButton}
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                variant={type === 'error' ? 'danger' : 'primary'}
                size="sm"
                className={styles.confirmButton}
              >
                {confirmText}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;