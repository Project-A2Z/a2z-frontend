'use client'
import React, { useState, useEffect } from "react"
import styles from './Style.module.css'
//components
import { Button } from "./../Buttons/Button"
//icons
import Edit from './../../../public/icons/Pen.svg'

interface Detailes {
    price: number,
    start: string,
    ends: string
}

interface Item {
    image: string,
    price: number,
    id: string,
    name: string
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
            <span className={styles.details}>التوصيل بين يومي {deliveryInfo.start} و {deliveryInfo.ends}</span>
            
            {edit ? (
                <div className={styles.mineContainer}>
                    <span className={styles.ordTitle}>طرد</span>
                    
                    {/* Map through orders when in edit mode */}
                    {orders.map((order) => (
                        <div key={order.id} className={styles.orderItem}>
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
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleConfirmClick}
                        rounded={true}
                    >
                        تأكيد تفاصيل التوصيل
                    </Button>
                </div>
            ) : (
                <Button
                    size="sm"
                    leftIcon={<Edit />}
                    onClick={handleEditClick}
                >
                    تعديل
                </Button>
            )}
        </div>
    )
}

export default Delivery