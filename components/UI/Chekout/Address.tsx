'use client'
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'

// styles
import styles from '@/components/UI/Chekout/Style.module.css'

// components
import { Button } from "@/components/UI/Buttons/Button"

// icons
import Edit from '@/public/icons/Pen.svg'
import Location from '@/public/icons/addLocation.svg'

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  firstName?: string;
  lastName?: string;
  governorate?: string;
  city?: string;
}

interface AddressProp {
  defaultAdd: Address | null;
  Addresses: Array<Address>;
  setDef: (address: Address) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  fetchAddresses?: () => Promise<void>;
}

const Address: React.FC<AddressProp> = ({
  defaultAdd,
  Addresses,
  setDef,
  isLoading = false,
  onRefresh,
  fetchAddresses,
}) => {
  const [edit, setEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations('checkout.address')

  useEffect(() => {
    const loadAddresses = async () => {
      if (!Addresses || Addresses.length === 0) {
        if (fetchAddresses) {
          setLoading(true)
          try {
            await fetchAddresses()
          } catch (error) {
            // handled by parent
          } finally {
            setLoading(false)
          }
        }
      }
    }
    loadAddresses()
  }, [])

  const handleEditClick = () => setEdit(true)
  const handleNewAddressClick = () => router.push('/addAddress')
  const handleAddressSelect = (address: Address) => {
    setDef(address)
    setEdit(false)
  }

  if (isLoading || loading) {
    return (
      <div className={styles.Container}>
        <div className={styles.AddContainer}>
          <div className={styles.detailsAdress}>
            <span className={styles.title}>{t('title')}</span>
            <span className={styles.detailsAdress}>{t('loading')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!defaultAdd && Addresses.length === 0) {
    return (
      <div className={styles.Container}>
        <div className={styles.AddContainer}>
          <div className={styles.detailsAdress}>
            <span className={styles.title}>{t('title')}</span>
            <span className={styles.detailsAdress}>{t('noAddresses')}</span>
          </div>
          <Button
            leftIcon={<Location />}
            variant="primary"
            size="md"
            onClick={handleNewAddressClick}
            rounded={true}
          >
            {t('addAddress')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.Container}>
      {!edit ? (
        <div className={styles.AddContainer}>
          <div className={styles.detailsAdress}>
            <span className={styles.title}>{t('title')}</span>
            {defaultAdd ? (
              <>
                <span className={styles.addressName}>{defaultAdd.name}</span>
                <span className={styles.addressPhone}>{defaultAdd.phone}</span>
                <span className={styles.addressText}>{defaultAdd.address}</span>
              </>
            ) : (
              <span className={styles.detailsAdress}>{t('noSelectedAddress')}</span>
            )}
          </div>
          <Button
            variant="custom"
            rightIcon={<Edit />}
            size="sm"
            onClick={handleEditClick}
            className={styles.editbtn}
          >
            {t('edit')}
          </Button>
        </div>
      ) : (
        <div className={styles.edit}>
          {Addresses.length > 0 ? (
            <>
              {Addresses.map((address) => (
                <div
                  key={address.id}
                  className={`${styles.add} ${defaultAdd?.id === address.id ? styles.def : ''}`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className={styles.addressInfo}>
                    <span className={styles.addressName}>{address.name}</span>
                    <span className={styles.addressPhone}>{address.phone}</span>
                    <span className={styles.addressText}>{address.address}</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className={styles.detailsAdress}>
              <span>{t('noAvailableAddresses')}</span>
            </div>
          )}

          <Button
            leftIcon={<Location />}
            variant="primary"
            size="md"
            onClick={handleNewAddressClick}
            rounded={true}
          >
            {t('addAddress')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Address