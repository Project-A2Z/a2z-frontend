'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './Welcom.module.css';
import SplitText from '@/components/UI/SpiltText/SpiltText';

import { getLocale } from '@/services/api/language'

interface WelcomeProps {
  name: string;
}

const handleAnimationComplete = () => {};

const Welcome: React.FC<WelcomeProps> = ({ name }) => {
  const t = useTranslations('profile.left');
  const isRtl = getLocale() === 'ar';

  return (
    <div className={styles.welcomeContainer} style={{direction: isRtl ? 'rtl' : 'ltr'}}>
      <div className={styles.welcomeContent}>
        <div className={styles.waveEmoji}>
          <span>👋</span>
        </div>
        <SplitText
          text={t('welcome.greeting', { name })}
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