import React from 'react';
import styles from './Welcom.module.css';
import SplitText from '@/components/UI/SpiltText/SpiltText';

interface WelcomeProps {
  name: string;
}

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

const Welcome: React.FC<WelcomeProps> = ({ name }) => {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.waveEmoji}>
          <span>👋</span>
        </div>
        <SplitText
          text={`مرحبا ${name}`}
          className={styles.welcomeText}
          tag='h1'
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
          isArabic={true}
        />
      </div>
    </div>
  );
};

export default Welcome;