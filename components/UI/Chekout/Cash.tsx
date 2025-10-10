'use client'

import React, { useState, useEffect } from "react"
import styles from './Style.module.css'
import Form from './CashForm'
import { Button } from "../Buttons"
import Edit from './../../../public/icons/Pen.svg'

export interface PaymentData {
    paymentWay: 'cash' | 'online' | '';
    paymentWith?: 'instaPay' | 'vodafone';
    NumOperation?: string;
    paymentStatus: 'paid' | 'deposit';
    image?: File;
}

interface Cash {
    Total: number;
    editProp: boolean;
    setEditProp: (value: boolean) => void;
    onPaymentDataChange?: (data: PaymentData) => void;
}

const Cash: React.FC<Cash> = ({ Total, editProp, setEditProp, onPaymentDataChange }) => {
    const [way, setWay] = useState<'cash' | 'online' | ''>('')
    const [paymentWith, setPaymentWith] = useState<'instaPay' | 'vodafone' | undefined>()
    const [opId, setOpId] = useState('')
    const [opImg, setOpImg] = useState<File | undefined>()
    const [edit, setEdit] = useState(false)

    // Update parent component with payment data
    useEffect(() => {
        // Payment way is required - must be 'cash' or 'online'
        if (!way || (way !== 'cash' && way !== 'online')) {
            setEdit(true);
            setEditProp(true);
            return;
        }

        const paymentData: PaymentData = {
            paymentWay: way,
            paymentWith:paymentWith || undefined,
            NumOperation: opId || undefined,
            paymentStatus: way === 'cash' ? 'deposit' : 'paid',
            image: opImg
        };
        
        // Check if data is complete
        // Required: way, opId, opImg
        // For online: also need paymentWith
        const isComplete = 
            (way === 'cash' || way === 'online') &&
            opId &&
            opImg &&
            (way === 'cash' || (way === 'online' && paymentWith));
        
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

    const handleClick = (paymentMethod: 'cash' | 'online') => {
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
            
            <div className={styles.In} onClick={() => handleClick('cash')}>
                <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    className={styles.radio}
                    checked={way === 'cash'}
                    onChange={() => handleClick('cash')}
                />
                <label className={styles.radioLabel}>
                    الدفع كاش عند الاستلام + مبلغ أولي بقيمة 15% من إجمالي المبلغ
                </label>
            </div>
            
            {way === 'cash' && (
               <Form
                    way={way}
                    Total={Total + 1000}
                    onDataChange={(data) => {
                        setOpId(data.opId);
                        setOpImg(data.opImg);
                        setPaymentWith(data.paymentWith as 'instaPay' | 'vodafone');
                    }}
                />
            )}
            
            <div className={styles.In} onClick={() => handleClick('online')}>
                <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    className={styles.radio}
                    checked={way === 'online'}
                    onChange={() => handleClick('online')}
                />
                <label className={styles.radioLabel}>
                    الدفع أونلاين - دفع كامل المبلغ
                </label>
            </div>
            
            {way === 'online' && (
                <Form
                    way={way}
                    Total={Total + 1000}
                    onDataChange={(data) => {
                        setOpId(data.opId);
                        setOpImg(data.opImg);
                        setPaymentWith(data.paymentWith as 'instaPay' | 'vodafone');
                    }}
                />
            )}
        </div>
    )
}

export default Cash;
