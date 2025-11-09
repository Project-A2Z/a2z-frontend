'use client'
import React, { useState, useEffect } from "react"

//styles
import styles from '@/components/UI/Chekout/Style.module.css'

//components
import { Button } from '@/components/UI/Buttons/Button' 
import Input from '@/components/UI/Inputs/Input'
import Alert, { AlertButton } from '@/components/UI/Alert/alert'

interface FormData {
    opId: string;
    opImg?: File;
    paymentWith?: string;
}

interface Form {
    Total: number;
    way: 'cash' | 'online';
    onDataChange?: (data: FormData) => void;
}

const Form: React.FC<Form> = ({ Total, way, onDataChange }) => {
    const [price, setPrice] = useState(Total)
    const [transactionId, setTransactionId] = useState('')
    const [transactionDate, setTransactionDate] = useState('')
    const [receiptImage, setReceiptImage] = useState<string | null>(null)
    const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined)
    const [paymentWith, setPaymentWith] = useState('')
    const [isConfirmed, setIsConfirmed] = useState(false)
    
    // Alert state
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        message: string;
        type: 'warning' | 'error' | 'info' | 'success';
        buttons: AlertButton[];
    }>({
        show: false,
        message: '',
        type: 'info',
        buttons: []
    })

    // Calculate price based on payment method
    useEffect(() => {
        if (way === 'cash') {
            setPrice(Math.round(Total * 10 / 100))
        } else {
            setPrice(Total)
        }
    }, [way, Total])

    // Update parent component whenever form data changes
    useEffect(() => {
        if (isConfirmed && transactionId && transactionDate && receiptFile) {
            onDataChange?.({
                opId: transactionId,
                opImg: receiptFile,
                paymentWith: paymentWith || undefined
            });
        }
    }, [isConfirmed, transactionId, transactionDate, receiptFile, paymentWith, way, onDataChange]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setReceiptFile(file)
            
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setReceiptImage(result)
            }
            reader.readAsDataURL(file)
        }
    }

    const showAlert = (message: string, type: 'warning' | 'error' | 'info' | 'success' = 'warning') => {
        setAlertConfig({
            show: true,
            message,
            type,
            buttons: [
                {
                    label: 'حسناً',
                    onClick: () => setAlertConfig(prev => ({ ...prev, show: false })),
                    variant: 'primary'
                }
            ]
        })
    }

    const handleSubmit = () => {
         //console.log('way:', way, 'paymentWith:', paymentWith)

    if (!transactionId || !transactionDate || !receiptFile) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'warning')
        return
    }

    if (!paymentWith) {
        //console.log('❗ Missing paymentWith')
        showAlert('يرجى اختيار وسيلة الدفع', 'warning')
        return
    }
        setIsConfirmed(true)
        
        //console.log('✅ Form confirmed:', {
        //     id: transactionId,
        //     date: transactionDate,
        //     price: price,
        //     file: receiptFile.name,
        //     paymentWith: paymentWith || 'N/A',
        //     way: way,
        //     image: receiptFile
        // })
    }

    const handleEdit = () => {
        setIsConfirmed(false)
    }

    const isFormComplete = transactionId && 
                          transactionDate && 
                          receiptFile && 
                          (way === 'cash' || (way === 'online' && paymentWith))

    return (
        <>
            {/* Custom Alert */}
            {alertConfig.show && (
                <Alert
                    message={alertConfig.message}
                    type={alertConfig.type}
                    setClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                    buttons={alertConfig.buttons}
                />
            )}

            {/* Form Container */}
            <div className={styles.formContainer}>
                <div className={styles.priceSection}>
                    <span className={styles.priceForm}>
                        المبلغ المطلوب:
                        <br/>
                         {price.toLocaleString('ar-EG')} ج
                    </span>
                    
                    {way === 'cash' && (
                        <span className={styles.depositNote}>
                            (مقدم 10% من إجمالي المبلغ)
                        </span>
                    )}
                </div>

                <div className={styles.formFields}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            وسيلة الدفع <span style={{color: 'red'}}>*</span>
                        </label>
                        <select
                            value={paymentWith}
                            onChange={(e) => setPaymentWith(e.target.value)}
                            className={styles.selectInput}
                            disabled={isConfirmed}
                        >
                            <option value="">اختر وسيلة الدفع</option>
                            <option value="instaPay">InstaPay (انستا باي)</option>
                            <option value="vodafone">Vodafone Cash (فودافون كاش)</option>
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            رقم المعاملة <span style={{color: 'red'}}>*</span>
                        </label>
                        <Input
                            placeholder="أدخل رقم المعاملة"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className={styles.customInput}
                            disabled={isConfirmed}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            التاريخ <span style={{color: 'red'}}>*</span>
                        </label>
                        <Input
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            className={styles.customInput}
                            disabled={isConfirmed}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            صورة الإيصال <span style={{color: 'red'}}>*</span>
                        </label>
                        <div className={styles.imageUploadContainer}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={styles.hiddenInput}
                                id="receipt-upload"
                                disabled={isConfirmed}
                            />
                            <label 
                                htmlFor="receipt-upload" 
                                className={`${styles.uploadLabel} ${isConfirmed ? styles.disabled : ''}`}
                            >
                                {receiptImage ? (
                                    <div className={styles.uploadedImageContainer}>
                                        <img 
                                            src={receiptImage} 
                                            alt="Receipt" 
                                            className={styles.uploadedImage} 
                                        />
                                        {!isConfirmed && (
                                            <div className={styles.imageOverlay}>
                                                <span>اضغط لتغيير الصورة</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        
                                        <span>اضغط لرفع صورة الإيصال</span>
                                        <span className={styles.fileNote}>
                                            (PNG, JPG, JPEG - حجم أقصى 5MB)
                                        </span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    {!isConfirmed ? (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSubmit}
                            disabled={!isFormComplete}
                            className={styles.confirm}
                            rounded={true}
                        >
                            تأكيد العملية
                        </Button>
                    ) : (
                        <div className={styles.confirmedState}>
                            <div className={styles.successMessage}>
                                <svg 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>تم تأكيد بيانات الدفع بنجاح</span>
                            </div>
                            <Button
                                variant="custom"
                                size="sm"
                                onClick={handleEdit}
                                className={styles.editBtn}
                            >
                                تعديل البيانات
                            </Button>
                        </div>
                    )}
                </div>

                <div className={styles.paymentInfo}>
                    <div className={styles.title}> معلومات التحويل</div>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoSection}>
                            <div className={styles.infoSectionTitle}>
                                 للدفع باستخدام محفظة فودافون كاش
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>الرقم:</span>
                                <span className={styles.infoValue}>01023456789</span>
                            </div>
                        </div>
                        
                        <div className={styles.infoSection}>
                            <div className={styles.infoSectionTitle}>
                                للدفع باستخدام انستا باي
                            </div>
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
                            <div className={styles.infoSectionTitle}>
                                للدفع باستخدام حساب بنكي
                            </div>
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