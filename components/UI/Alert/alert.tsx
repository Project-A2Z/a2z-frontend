"use client";
import React from 'react';
import styles from './alert.module.css';

interface AlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info' | 'success';
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'موافق',
  cancelText = 'إلغاء',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.alert} ${styles[type]}`}>
        <div className={styles.header}>
          <div className={styles.icon}>
            {type === 'warning' && '⚠️'}
            {type === 'error' && '❌'}
            {type === 'info' && 'ℹ️'}
            {type === 'success' && '✅'}
          </div>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;