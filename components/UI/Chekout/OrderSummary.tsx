'use client'
import React , {useState , useEffect} from "react";
import styles from './Style.module.css'
import {Button} from './../../UI/Buttons/Button'
// import {useRouter} from "next/navigatation";
import { useRouter } from 'next/navigation';


interface SummaryInter {
    Total : number,
    delivery? : number ,
    numberItems : number,
    disabled : boolean
}

const Summary : React.FC<SummaryInter> = ({ Total , delivery = 1000 , numberItems , disabled}) =>{

    const router = useRouter()

    const handleSubmit =() => {
        
        router.push('/')
    }
    return(
        <div className={styles.SummaryContainer}>
            <span className={styles.title}>
                ملخص الطلب
            </span>

            <span className={styles.details}>عدد المنجات({numberItems})</span>
            <span className={styles.price}>ج{Total}</span>

            <span className={styles.details}>التوصيل</span>
            <span className={styles.price}>ج{delivery}</span>

            <span className={styles.details}>الاجمالي</span>
            <span className={styles.price}>ج{Total + delivery}</span>

            
            <Button 
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={styles.button}
                onClick={handleSubmit}
                disabled={disabled}
            > إتمام عملية الشراء</Button>
        </div>
    )

}
export default Summary;