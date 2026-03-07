'use client'

import React, { useState, useEffect } from "react"
//styles
import styles from '@/components/UI/Chekout/Style.module.css'

//components
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
    const [edit, setEdit] = useState(false)

    // Update parent component with payment data
    useEffect(() => {
        // Payment way is required - must be 'Cash' or 'Online'
        if (!way || (way !== 'Cash' && way !== 'Online')) {
            setEdit(true);
            setEditProp(true);
            return;
        }

        const paymentData: PaymentData = {
            paymentWay: way,
            paymentWith:paymentWith || undefined,
            NumOperation: opId || undefined,
            paymentStatus: way === 'Cash' ? 'Deposit' : 'Paid',
            image: opImg
        };
        
        // Check if data is complete
        // Required: way, opId, opImg
        // For Online: also need paymentWith
        const isComplete = 
            (way === 'Cash' || way === 'Online') &&
            opId &&
            opImg &&
            (way === 'Cash' || (way === 'Online' && paymentWith));
        
        if (isComplete) {
            setEdit(false);
            setEditProp(false);
            onPaymentDataChange?.(paymentData);
        } else {
            setEdit(true);
            setEditProp(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [way, paymentWith, opId, opImg]);

    const handleClick = (paymentMethod: 'Cash' | 'Online') => {
        setWay(paymentMethod)
    }

    return (
        <div className={styles.Container}>
            <span className={styles.title}>
                طريقة الدفع <span style={{color: 'red', marginRight: '5px'}}>*</span>
            </span>
            
            {!way && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#856404'
                }}>
                    ⚠️ يرجى اختيار طريقة الدفع لمتابعة الطلب
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
                <label className={styles.radioLabel}>
                    الدفع كاش عند الاستلام + مبلغ أولي بقيمة 10% من إجمالي المبلغ
                </label>
            </div>
            
            {way === 'Cash' && (
               <Form
                    way={way}
                    Total={Total }
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
                <label className={styles.radioLabel}>
                    الدفع أونلاين - دفع كامل المبلغ
                </label>
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