'use client'
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from './Style.module.css'
//components
import { Button } from "./../Buttons/Button"
//icons
import Edit from './../../../public/icons/Pen.svg'
import Location from './../../../public/icons/addLocation.svg'

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  
  firstName?: string;
  lastName?: string;
//   phoneNumber?: string;
  governorate?: string;
  city?: string;
}

interface AddressProp {
    defaultAdd: Address,
    Addresses: Array<Address>
    setDef : (address: Address) => void
}

const Address: React.FC<AddressProp> = ({ defaultAdd, Addresses, setDef }) => {
    const [edit, setEdit] = useState(false)
    const router = useRouter()

    const handleEditClick = () => {
        setEdit(true)
    }

    const handleNewAddressClick = () => {
        router.push('/addAddress') // Adjust the route as needed
    }

    const handleAddressSelect = (address: Address) => {
        setDef(address)
        setEdit(false) // Close edit mode after selection
    }

    return (
        <div className={styles.Container}>
            {!edit ? (
                <div className={styles.mineContainer}>
                    <div className={styles.detailsAdress}>
                        <span className={styles.title}>
                            العنوان
                        </span>
                        <span className={styles.detailsAdress}>
                            {defaultAdd.name}
                        </span>
                        <span className={styles.detailsAdress}>
                            {defaultAdd.phone}
                        </span>
                        <span className={styles.detailsAdress}>
                            {defaultAdd.address}
                        </span>
                    </div>
                    <Button
                        variant="custom"
                        rightIcon={<Edit />}
                        size='sm'
                        onClick={handleEditClick}
                        className={styles.editbtn}
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
                            onClick={() => handleAddressSelect(address)}
                        >
                            <div className={styles.addressInfo}>
                                <span className={styles.addressName}>
                                    {address.name}
                                </span>
                                <span className={styles.addressPhone}>
                                    {address.phone}
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