'use client'

import React, { useState, useEffect } from "react"
import styles from './Style.module.css'
import Form from './CashForm'
import { Button } from "../Buttons"
import Edit from './../../../public/icons/Pen.svg'

interface CashData {
    way: string;
    opId: string;
    opDate: string;
    opPrice: string;
    opImg: string;
}

interface Cash {
    Total: number,
    editProp: boolean,
    setEditProp: (value: boolean) => void
}

const Cash: React.FC<Cash> = ({ Total, editProp, setEditProp }) => {
    const [way, setWay] = useState('')
    const [opId, setOpId] = useState('')
    const [opDate, setOpDate] = useState('')
    const [opPrice, setOpPrice] = useState('')
    const [opImg, setOpImg] = useState('')
    const [edit, setEdit] = useState(false)
    
    // Data object to store all form data
    const [cashData, setCashData] = useState<CashData>({
        way: '',
        opId: '',
        opDate: '',
        opPrice: '',
        opImg: ''
    });

    // Function to check if any field is null/empty
    const checkForNulls = (data: CashData): boolean => {
        return Object.values(data).some(value => 
            value === null || 
            value === undefined || 
            value === '' || 
            (typeof value === 'string' && value.trim() === '')
        );
    };

    // Update cashData whenever individual states change
    useEffect(() => {
        const newData: CashData = {
            way,
            opId,
            opDate,
            opPrice,
            opImg
        };
        
        setCashData(newData);
        
        // Check for nulls and update edit states
        const hasNulls = checkForNulls(newData);
        
        if (!hasNulls && way !== '') {
            setEdit(false);
            setEditProp(false);
        } else {
            setEdit(true);
            setEditProp(true);
        }
    }, [way, opId, opDate, opPrice, opImg, setEditProp]);

    const handleEditClick = () => {
        setEdit(true);
        setEditProp(true);
    }

    const handleClick = (paymentMethod: string) => {
        setWay(paymentMethod)
    }

    // Function to save/submit the data (you can customize this)
    const saveData = () => {
        console.log('Saved Cash Data:', cashData);
        // Here you can send the data to your backend or local storage
        // Example: localStorage.setItem('cashData', JSON.stringify(cashData));
        // Or: await submitToAPI(cashData);
    };

    // Auto-save when data is complete
    useEffect(() => {
        if (!checkForNulls(cashData) && cashData.way !== '') {
            saveData();
        }
    }, [cashData]);

    return (
        <div className={styles.Container}>
            <span className={styles.title}>طريقة الدفع</span>
            
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
                    Total={Total  + 1000}
                    setOpDate={setOpDate}
                    setOpId={setOpId}
                    setOpImg={setOpImg}
                    setOpPrice={setOpPrice}
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
                    setOpDate={setOpDate}
                    setOpId={setOpId}
                    setOpImg={setOpImg}
                    setOpPrice={setOpPrice}
                />
            )}
            
            {/* <Button
                variant="custom"
                rightIcon={<Edit />}
                size='sm'
                onClick={handleEditClick}
                className={styles.editbtn}
                disabled={edit} // Disable button when in edit mode
            >
                تعديل
            </Button> */}
            
            {/* Debug info - remove in production */}
            {/* <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                <p>Edit: {edit.toString()}</p>
                <p>EditProp: {editProp.toString()}</p>
                <p>Has Nulls: {checkForNulls(cashData).toString()}</p>
                <p>Data Complete: {(!checkForNulls(cashData) && way !== '').toString()}</p>
            </div> */}
        </div>
    )
}

export default Cash;