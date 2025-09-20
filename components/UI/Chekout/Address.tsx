'use client'
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from './Style.module.css'
//components
import { Button } from "./../Buttons/Button"
//icons
import Edit from './../../../public/icons/Pen.svg'
import Location from './../../../public/icons/addLocation.svg'

interface Add {
    userName: string,
    id: string,
    address: string,
    userNum: string
}

interface AddressProp {
    defaultAdd: Add,
    Addresses: Array<Add>
}

const Address: React.FC<AddressProp> = ({ defaultAdd, Addresses }) => {
    const [edit, setEdit] = useState(false)
    const router = useRouter()

    const handleEditClick = () => {
        setEdit(true)
    }

    const handleNewAddressClick = () => {
        router.push('/NewAddress') // Adjust the route as needed
    }

    return (
        <div className={styles.Container}>
            {!edit ? (
                <div className={styles.mineContainer}>
                    <div className={styles.details}>
                        <span className={styles.title}>
                            العنوان
                        </span>
                        <span className={styles.details}>
                            {defaultAdd.userName}
                        </span>
                        <span className={styles.details}>
                            {defaultAdd.userNum}
                        </span>
                        <span className={styles.details}>
                            {defaultAdd.address}
                        </span>
                    </div>
                    <Button
                        leftIcon={<Edit />}
                        size='sm'
                        onClick={handleEditClick}
                    >
                        تعديل
                    </Button>
                </div>
            ) : (
                <div className={styles.edit}>
                    {/* Map through addresses when in edit mode */}
                    {Addresses.map((address) => (
                        <div 
                            key={address.id} 
                            className={`${styles.add} ${
                                defaultAdd.id === address.id ? styles.def : ''
                            }`}
                        >
                            <div className={styles.addressInfo}>
                                <span className={styles.addressName}>
                                    {address.userName}
                                </span>
                                <span className={styles.addressPhone}>
                                    {address.userNum}
                                </span>
                                <span className={styles.addressText}>
                                    {address.address}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add new address button */}
                    <Button
                        leftIcon={<Location />}
                        variant="primary"
                        size="md"
                        onClick={handleNewAddressClick}
                        rounded = {true}
                    >
                        إضافة عنوان
                    </Button>
                </div>
            )}
        </div>
    )
}

export default Address