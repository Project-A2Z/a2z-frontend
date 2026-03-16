"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { getLocale } from "@/services/api/language";

// styles
import styles from "@/components/UI/Chekout/Style.module.css";

// components
import { Button } from "@/components/UI/Buttons/Button";
import Input from "@/components/UI/Inputs/Input";
import Alert, { AlertButton } from "@/components/UI/Alert/alert";

interface FormData {
  opId: string;
  opImg?: File;
  paymentWith?: string;
}

interface Form {
  Total: number;
  way: "Cash" | "Online";
  onDataChange?: (data: FormData) => void;
}

const Form: React.FC<Form> = ({ Total, way, onDataChange }) => {
  const t = useTranslations('checkout.payment.form');

  const [price, setPrice] = useState(Total);
  const [transactionId, setTransactionId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);
  const [paymentWith, setPaymentWith] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isRTL = getLocale() === 'ar'


  const dateInputRef = useRef<HTMLInputElement>(null);

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "warning" | "error" | "info" | "success";
    buttons: AlertButton[];
  }>({
    show: false,
    message: "",
    type: "info",
    buttons: [],
  });

  useEffect(() => {
    if (way === "Cash") {
      setPrice(Math.round((Total * 10) / 100));
    } else {
      setPrice(Total);
    }
  }, [way, Total]);

  useEffect(() => {
    if (isConfirmed && transactionId && transactionDate && receiptFile) {
      onDataChange?.({
        opId: transactionId,
        opImg: receiptFile,
        paymentWith: paymentWith || undefined,
      });
    }
  }, [isConfirmed, transactionId, transactionDate, receiptFile, paymentWith, way, onDataChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setReceiptImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const showAlert = (
    message: string,
    type: "warning" | "error" | "info" | "success" = "warning",
  ) => {
    setAlertConfig({
      show: true,
      message,
      type,
      buttons: [
        {
          label: t('alerts.ok'),
          onClick: () => setAlertConfig((prev) => ({ ...prev, show: false })),
          variant: "primary",
        },
      ],
    });
  };

  const handleSubmit = () => {
    if (!transactionId || !transactionDate || !receiptFile) {
      showAlert(t('alerts.fillAllFields'), "warning");
      return;
    }
    if (!paymentWith) {
      showAlert(t('alerts.selectPaymentMethod'), "warning");
      return;
    }
    setIsConfirmed(true);
  };

  const handleEdit = () => setIsConfirmed(false);

  const isFormComplete =
    transactionId &&
    transactionDate &&
    receiptFile &&
    (way === "Cash" || (way === "Online" && paymentWith));

  return (
    <>
      {alertConfig.show && (
        <Alert
          message={alertConfig.message}
          type={alertConfig.type}
          setClose={() => setAlertConfig((prev) => ({ ...prev, show: false }))}
          buttons={alertConfig.buttons}
        />
      )}

      <div className={styles.formContainer} style={{direction : isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left' }}>
        <div className={styles.priceSection}>
          <span className={styles.priceForm}>
            {t('amountRequired')} {price.toLocaleString("ar-EG")} ج
          </span>
          {way === "Cash" && (
            <span className={styles.depositNote}>{t('depositNote')}</span>
          )}
        </div>

        <div className={styles.formFields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('paymentMethod')} <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={paymentWith}
              onChange={(e) => setPaymentWith(e.target.value)}
              className={styles.selectionInput}
              disabled={isConfirmed}
            >
              <option value="">{t('selectPaymentMethod')}</option>
              <option value="InstaPay">{t('instaPay')}</option>
              <option value="Vodafone">{t('vodafoneCash')}</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('transactionId')} <span style={{ color: "red" }}>*</span>
            </label>
            <Input
              placeholder={t('transactionIdPlaceholder')}
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className={styles.customInput}
              disabled={isConfirmed}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('date')} <span style={{ color: "red" }}>*</span>
            </label>
            <Input
              ref={dateInputRef}
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className={styles.customInput}
              onClick={() => dateInputRef.current?.showPicker()}
              disabled={isConfirmed}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('receiptImage')} <span style={{ color: "red" }}>*</span>
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
                className={`${styles.uploadLabel} ${isConfirmed ? styles.disabled : ""}`}
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
                        <span>{t('changeImage')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span>{t('uploadImage')}</span>
                    <span className={styles.fileNote}>{t('imageNote')}</span>
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
              {t('confirm')}
            </Button>
          ) : (
            <div className={styles.confirmedState}>
              <div className={styles.successMessage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{t('confirmed')}</span>
              </div>
              <Button variant="custom" size="sm" onClick={handleEdit} className={styles.editBtn}>
                {t('editData')}
              </Button>
            </div>
          )}
        </div>

        <div className={styles.paymentInfo} style={{direction : isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'start' : 'end' }}>
          <div className={styles.title}>{t('transferInfo.title')}</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoSection}>
              <div className={styles.infoSectionTitle}>{t('vodafoneSection')}</div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('number')}</span>
                <span className={styles.infoValue}>01023456789</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoSectionTitle}>{t('instaPaySection')}</div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('number')}</span>
                <span className={styles.infoValue}>01023456789</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('paymentAccount')}</span>
                <span className={styles.infoValue}>atoz@instapay</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoSectionTitle}>{t('bankSection')}</div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('beneficiaryName')}</span>
                <span className={styles.infoValue}>{t('transferInfo.CompanyName')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('accountNumber')}</span>
                <span className={styles.infoValue}>1234567890123456</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('bank')}</span>
                <span className={styles.infoValue}>{t('transferInfo.BankName')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('swiftCode')}</span>
                <span className={styles.infoValue}>NBEGEGCX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Form;