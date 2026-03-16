'use client'
import React, { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { getLocale } from "@/services/api/language";

// styles
import styles from '@/components/UI/Chekout/Style.module.css'

// components
import { Button } from "@/components/UI/Buttons/Button"

// icons
import Edit from '@/public/icons/Pen.svg'

interface Detailes {
  price: number;
  start: string;
  ends: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  availability: string;
}

interface DeliveryProp {
  deliveryInfo: Detailes;
  orders: Array<Item>;
  editProp: boolean;
  setEditProp: (value: boolean) => void;
}

const Delivery: React.FC<DeliveryProp> = ({ deliveryInfo, orders, editProp, setEditProp }) => {
  const [edit, setEdit] = useState<boolean>(editProp)
  const t = useTranslations('checkout.delivery')
  const isRTL = getLocale() === 'ar'


  useEffect(() => {
    setEdit(editProp)
  }, [editProp])

  const handleEditClick = () => {
    const newEditState = !edit
    setEdit(newEditState)
    setEditProp(newEditState)
  }

  const handleConfirmClick = () => {
    setEdit(false)
    setEditProp(false)
  }

  return (
    <div className={styles.Container} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
      <span className={styles.title} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
        {t('title')}
      </span>
      <span className={styles.details} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>{t('cost')}</span>
      <span className={styles.price}>
        {deliveryInfo.price === 0 ? (
          <span className={styles.priceNote}>{t('determinedLater')}</span>
        ) : (
          `${deliveryInfo.price} ${t('pound')}`
        )}
      </span>
      <br />
      <span className={styles.details} style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
        {t('determinedLater')}
      </span>

      {edit ? (
        <div className={styles.mineContainer}>
          <span className={styles.orderTitle}>{t('parcel')}</span>

          <div className={styles.orderItemsContainer}>
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={styles.orderItem}
                style={{ animationDelay: `${index * 0.1}s` , direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}
              >
                <div className={styles.orderImage}>
                  <img
                    src={order.image}
                    alt={order.name}
                    className={styles.itemImage}
                  />
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.orderName}>{order.name}</span>
                  <span className={styles.orderPrice}>{order.price} ج</span>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirmClick}
            rounded={true}
            className={styles.confirm}
          >
            {t('confirm')}
          </Button>
        </div>
      ) : (
        <Button
          variant="custom"
          rightIcon={<Edit />}
          size="sm"
          onClick={handleEditClick}
          className={styles.editbtn}
        >
          {t('edit')}
        </Button>
      )}
    </div>
  )
}

export default Delivery