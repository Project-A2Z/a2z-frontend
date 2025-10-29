"use client";
import React from 'react';
import { Button } from './../Buttons/Button';
import styles from './alert.module.css';

interface AlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div 
        className={`${styles.alert} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.icon}>{getTypeIcon()}</div>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <Button
            onClick={onCancel}
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
        </div>
      </div>
    </div>
  );
};

export default Alert;