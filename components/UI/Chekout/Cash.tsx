'use client'
import React , {useState} from "react"
import styles from './Style.module.css'

import Form from './CashForm'

interface Cash {
    Total : number,
    editProp : boolean,
    setEditProp : (value : boolean) => void
}

const Cash : React.FC<Cash> = ({Total , editProp , setEditProp}) => {
    const [way , setWay] = useState('')
    const [opId , setOpId] = useState('')
    const [opDate , setOpDate] = useState('')
    const [opPrice , setOpPrice] = useState('')
    const [opImg , setOpImg] = useState('')


    const handelClick = (std : string) => {
        setWay(std)
    }
    
    return(
        <div className={styles.Container}>
            <input 
                type="radio" 
                value={'الدفع كاش عند الأستلام+ 10% من إجمالي المبلغ'} 
                className={styles.radio}
                onClick={() =>handelClick('cash')}
            />
            {way === 'cash' &&  (
                <Form 
                    way={way}
                    Total={Total}
                    setOpDate={setOpDate}
                    setOpId={setOpId}
                    setOpImg={setOpImg}
                    setOpPrice={setOpPrice}
                />
            )}
            <input 
                type="radio" 
                value={'الدفع اونلاين'} 
                className={styles.radio}
                onClick={() => handelClick('online')}
            />
            {way === 'online' && (
                <Form 
                    way={way}
                    Total={Total}
                    setOpDate={setOpDate}
                    setOpId={setOpId}
                    setOpImg={setOpImg}
                    setOpPrice={setOpPrice}
                />
            )}
        </div>
    )
}
export default Cash;