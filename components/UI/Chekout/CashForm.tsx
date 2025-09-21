'use client'
import React, { useState, useEffect } from "react"
import styles from './Style.module.css'
import { Button } from './../Buttons/Button' 
import Input from './../Inputs/Input' 

//icons 
import Img from './../../../public/icons/Cart Large 4.svg'

interface Form {
    Total: number,
    way: string,
    setOpImg: (value: string) => void,
    setOpId: (value: string) => void,
    setOpPrice: (value: string) => void,
    setOpDate: (value: string) => void,
}

const Form: React.FC<Form> = ({ Total, way, setOpDate, setOpId, setOpImg, setOpPrice }) => {
    const [price, setPrice] = useState(Total)
    const [transactionId, setTransactionId] = useState('')
    const [transactionDate, setTransactionDate] = useState('')
    const [receiptImage, setReceiptImage] = useState(Img)

    useEffect(() => {
        if (way === 'cash') {
            setPrice(Total * 15 / 100)
        } else {
            setPrice(Total)
        }
    }, [way, Total])

    const handleSubmit = () => {
        // Set the values using the props
        setOpId(transactionId)
        setOpDate(transactionDate)
        setOpPrice(price.toString())
        setOpImg(receiptImage)
        
        // Add any additional form submission logic here
        console.log('Form submitted:', {
            id: transactionId,
            date: transactionDate,
            price: price,
            image: receiptImage
        })
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setReceiptImage(result)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <>
            
            {/* Form Container */}
            <div className={styles.formContainer}>
                <div className={styles.priceSection}>
                    <span className={styles.priceForm}>المبلغ المطلوب: {price}ج</span>
                    {/* <img src={Img} alt="Cart" className={styles.cartIcon} /> */}
                </div>

                <div className={styles.formFields}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>رقم المعاملة</label>
                        <Input
                            placeholder="أدخل رقم المعاملة"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className={styles.customInput}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>التاريخ</label>
                        <Input
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            className={styles.customInput}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>صورة الإيصال</label>
                        <div className={styles.imageUploadContainer}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={styles.hiddenInput}
                                id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload" className={styles.uploadLabel}>
                                {receiptImage && receiptImage !== Img ? (
                                    <img src={receiptImage} alt="Receipt" className={styles.uploadedImage} />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <span>اضغط لرفع صورة الإيصال</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSubmit}
                        disabled={!transactionId || !transactionDate}
                        className={styles.confirm}
                        rounded={true}
                    >
                        تأكيد العملية
                    </Button>
                </div>

                {/* Payment Information Section */}
            <div className={styles.paymentInfo}>
                <div className={styles.title}>معلومات التحويل</div>
                <div className={styles.infoGrid}>
                    <div className={styles.infoSection}>
                        <div className={styles.infoSectionTitle}>للدفع باستخدام محفظة</div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>الرقم:</span>
                            <span className={styles.infoValue}>01023456789</span>
                        </div>
                    </div>
                    
                    <div className={styles.infoSection}>
                        <div className={styles.infoSectionTitle}>للدفع باستخدام انستا باي</div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>الرقم:</span>
                            <span className={styles.infoValue}>01023456789</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>حساب الدفع:</span>
                            <span className={styles.infoValue}>atoz@instapay</span>
                        </div>
                    </div>
                    
                    <div className={styles.infoSection}>
                        <div className={styles.infoSectionTitle}>للدفع باستخدام حساب بنكي</div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>اسم المستفيد:</span>
                            <span className={styles.infoValue}>شركة التجارة الإلكترونية</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>رقم الحساب:</span>
                            <span className={styles.infoValue}>1234567890123456</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>البنك:</span>
                            <span className={styles.infoValue}>البنك الأهلي المصري</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>كود SWIFT:</span>
                            <span className={styles.infoValue}>NBEGEGCX</span>
                        </div>
                    </div>
                </div>
            </div>

            </div>
        </>
    )
}

export default Form