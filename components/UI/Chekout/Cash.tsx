'use client'
import React, { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { getLocale } from "@/services/api/language";

// styles
import styles from '@/components/UI/Chekout/Style.module.css'

// components
import Form from '@/components/UI/Chekout/CashForm'

export interface PaymentData {
  paymentWay: 'Cash' | 'Online' | '';
  paymentWith?: 'InstaPay' | 'Vodafone';
  NumOperation?: string;
  paymentStatus: 'Paid' | 'Deposit';
  image?: File;
}

interface Cash {
  Total: number;
  editProp: boolean;
  setEditProp: (value: boolean) => void;
  onPaymentDataChange?: (data: PaymentData) => void;
}

const Cash: React.FC<Cash> = ({ Total, editProp, setEditProp, onPaymentDataChange }) => {
  const [way, setWay] = useState<'Cash' | 'Online' | ''>('')
  const [paymentWith, setPaymentWith] = useState<'InstaPay' | 'Vodafone' | undefined>()
  const [opId, setOpId] = useState('')
  const [opImg, setOpImg] = useState<File | undefined>()
  const t = useTranslations('checkout.payment')
  const isRTL = getLocale() === 'ar'


  useEffect(() => {
    if (!way || (way !== 'Cash' && way !== 'Online')) {
      setEditProp(true);
      return;
    }

    const paymentData: PaymentData = {
      paymentWay: way,
      paymentWith: paymentWith || undefined,
      NumOperation: opId || undefined,
      paymentStatus: way === 'Cash' ? 'Deposit' : 'Paid',
      image: opImg,
    };

    const isComplete =
      (way === 'Cash' || way === 'Online') &&
      opId &&
      opImg &&
      (way === 'Cash' || (way === 'Online' && paymentWith));

    if (isComplete) {
      setEditProp(false);
      onPaymentDataChange?.(paymentData);
    } else {
      setEditProp(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [way, paymentWith, opId, opImg]);

  const handleClick = (paymentMethod: 'Cash' | 'Online') => {
    setWay(paymentMethod)
  }

  return (
    <div className={styles.Container} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
      <span className={styles.title} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
        {t('title')} <span style={{ color: 'red', marginRight: '5px' }}>*</span>
      </span>

      {!way && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#856404',
          }}
        >
          {t('selectMethodWarning')}
        </div>
      )}

      <div className={styles.In} onClick={() => handleClick('Cash')}>
        <input
          type="radio"
          name="paymentMethod"
          value="Cash"
          className={styles.radio}
          checked={way === 'Cash'}
          onChange={() => handleClick('Cash')}
        />
        <label className={styles.radioLabel}>{t('cash')}</label>
      </div>

      {way === 'Cash' && (
        <Form
          way={way}
          Total={Total}
          onDataChange={(data) => {
            setOpId(data.opId);
            setOpImg(data.opImg);
            setPaymentWith(data.paymentWith as 'InstaPay' | 'Vodafone');
          }}
        />
      )}

      <div className={styles.In} onClick={() => handleClick('Online')}>
        <input
          type="radio"
          name="paymentMethod"
          value="Online"
          className={styles.radio}
          checked={way === 'Online'}
          onChange={() => handleClick('Online')}
        />
        <label className={styles.radioLabel}>{t('online')}</label>
      </div>

      {way === 'Online' && (
        <Form
          way={way}
          Total={Total}
          onDataChange={(data) => {
            setOpId(data.opId);
            setOpImg(data.opImg);
            setPaymentWith(data.paymentWith as 'InstaPay' | 'Vodafone');
          }}
        />
      )}
    </div>
  )
}

export default Cash;