'use client'
import React, { useState, useEffect } from "react"

//styles
import styles from '@/components/UI/Chekout/Style.module.css'

//components
import { Button } from "@/components/UI/Buttons/Button"

//icons
import Edit from '@/public/icons/Pen.svg'

interface Detailes {
    price: number,
    start: string,
    ends: string
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
    deliveryInfo: Detailes,
    orders: Array<Item>,
    editProp: boolean,
    setEditProp: (value: boolean) => void
}

const Delivery: React.FC<DeliveryProp> = ({ deliveryInfo, orders, editProp, setEditProp }) => {
    const [edit, setEdit] = useState<boolean>(editProp)
    
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
        <div className={styles.Container}>
            <span className={styles.title}>تفاصيل التوصيل</span>
            <span className={styles.details}>مصاريف التوصيل: {deliveryInfo.price}ج</span>
            <br/>
            <span className={styles.details}>التوصيل بين يومي {deliveryInfo.start} و {deliveryInfo.ends}</span>
           
            {edit ? (
                <div className={styles.mineContainer}>
                    <span className={styles.orderTitle}>طرد</span>
                   
                    {/* Scrollable container for order items */}
                    <div className={styles.orderItemsContainer}>
                        {orders.map((order, index) => (
                            <div 
                                key={order.id} 
                                className={styles.orderItem}
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <div className={styles.orderImage}>
                                    <img
                                        src={order.image}
                                        alt={order.name}
                                        className={styles.itemImage}
                                    />
                                </div>
                                <div className={styles.orderDetails}>
                                    <span className={styles.orderName}>
                                        {order.name}
                                    </span>
                                    <span className={styles.orderPrice}>
                                        {order.price}ج
                                    </span>
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
                        تأكيد تفاصيل التوصيل
                    </Button>
                </div>
            ) : (
                <Button
                    variant="custom"
                    rightIcon={<Edit />}
                    size='sm'
                    onClick={handleEditClick}
                    className={styles.editbtn}
                >
                    تعديل
                </Button>
            )}
        </div>
    )
}

export default Delivery