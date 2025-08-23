import React from 'react';
import styles from './background.module.css';

export default function Background() {
  return (
    <div className={styles.background}>
      <div className={styles.ball1}></div>
      <div className={styles.ball2}></div>
      <div className={styles.ball3}></div>
    </div>
  );
}