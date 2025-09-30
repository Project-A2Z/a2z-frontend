'use client';

import React, { useState } from 'react';
import { Button } from './../../../Buttons/Button';
import styles from './address.module.css';
import { useRouter } from 'next/navigation';

// Icons
import Edit from './../../../../../public/icons/Pen.svg'
import Delete from './../../../../../public/icons/Trash Bin Trash.svg'
import Add from './../../../../../public/icons/addLocation.svg'

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  governorate?: string;
  city?: string;
}

interface ADDProp {
  Addresses : Array <Address> 
}

const Address: React.FC<ADDProp> = ({Addresses}) => {
  const [addresses, setAddresses] = useState<Address[]>(Addresses || []);
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (id: number) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      // Create query parameters with the address data
      const queryParams = new URLSearchParams({
        id: addressToEdit.id.toString(),
        firstName: addressToEdit.firstName || '',
        lastName: addressToEdit.lastName || '',
        phoneNumber: addressToEdit.phoneNumber || addressToEdit.phone || '',
        address: addressToEdit.address || '',
        governorate: addressToEdit.governorate || '',
        city: addressToEdit.city || '',
        isDefault: addressToEdit.isDefault ? 'true' : 'false',
        mode: 'edit'
      });
      
      router.push(`/addAddress?${queryParams.toString()}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAddresses(prev => prev.filter(address => address.id !== id));
        console.log('Address deleted:', id);
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('فشل في حذف العنوان. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddAddress = () => {
    console.log('Add new address');
    router.push('/addAddress');
  };

  const handleSetDefault = async (id: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      );
      console.log('Default address set:', id);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('فشل في تعيين العنوان الافتراضي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container_form}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>عناوينك</h1>
        
        <div className={styles.addressList}>
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ''}`}
            >
              <div className={styles.addressContent}>
                <div className={styles.addressHeader}>
                  <div className={styles.addressInfo}>
                    <div className={styles.addressDetails}>
                      <h3 className={styles.addressName}>{address.name}</h3>
                      <p className={styles.addressPhone}>{address.phone}</p>
                      <p className={styles.addressText}>{address.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.addressActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEdit(address.id)}
                    disabled={isLoading}
                    aria-label="تعديل "
                  >
                    <Edit />
                    <span>تعديل</span>
                  </button>
                  
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(address.id)}
                    disabled={isLoading || addresses.length <= 1}
                    aria-label="حذف"
                  >
                    <Delete />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            state={isLoading ? 'loading' : 'default'}
            loadingText="جاري المعالجة..."
            rightIcon={<Add />}
            fullWidth
            className={styles.addButton}
            rounded={true}
            onClick={handleAddAddress}
          >
            إضافة عنوان 
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Address;