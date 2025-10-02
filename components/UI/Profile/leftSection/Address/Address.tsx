'use client';

import React, { useState } from 'react';
import { Button } from './../../../Buttons/Button';
import styles from './address.module.css';
import { useRouter } from 'next/navigation';
import { AddressService, AddressError } from './../../../../../services/profile/address';

// Icons
import Edit from './../../../../../public/icons/Pen.svg'
import Delete from './../../../../../public/icons/Trash Bin Trash.svg'
import Add from './../../../../../public/icons/addLocation.svg'

interface Address {
  _id: string;
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  region?: string;
  governorate?: string;
  isDefault?: boolean;
}

interface ADDProp {
  Addresses: Array<Address> | [];
}

const Address: React.FC<ADDProp> = ({ Addresses }) => {
  const [addresses, setAddresses] = useState<Address[]>(Addresses || []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFullName = (address: Address): string => {
    if (address.name) return address.name;
    if (address.firstName && address.lastName) {
      return `${address.firstName} ${address.lastName}`;
    }
    return address.firstName || address.lastName || 'غير محدد';
  };

  const getPhone = (address: Address): string => {
    return address.phoneNumber || address.phone || 'غير محدد';
  };

  const handleEdit = (addressId: string, event: React.MouseEvent) => {
    // Prevent the card click event from firing
    event.stopPropagation();
    
    const addressToEdit = addresses.find(addr => addr._id === addressId || addr.id?.toString() === addressId);
    if (addressToEdit) {
      const queryParams = new URLSearchParams({
        id: addressToEdit._id || addressToEdit.id?.toString() || '',
        firstName: addressToEdit.firstName || '',
        lastName: addressToEdit.lastName || '',
        phoneNumber: getPhone(addressToEdit),
        address: addressToEdit.address || '',
        region: addressToEdit.region || addressToEdit.governorate || '',
        city: addressToEdit.city || '',
        isDefault: addressToEdit.isDefault ? 'true' : 'false',
        mode: 'edit'
      });
      
      router.push(`/addAddress?${queryParams.toString()}`);
    }
  };

  const handleDelete = async (addressId: string, event: React.MouseEvent) => {
    // Prevent the card click event from firing
    event.stopPropagation();
    
    if (!window.confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return;
    }

    if (!AddressService.isAuthenticated()) {
      setError('يجب تسجيل الدخول للقيام بهذا الإجراء');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AddressService.deleteAddress(addressId);
      
      setAddresses(prev => prev.filter(address => 
        address._id !== addressId && address.id?.toString() !== addressId
      ));
      
      console.log('✅ Address deleted successfully:', addressId);
      
    } catch (err) {
      console.error('❌ Error deleting address:', err);
      
      if (err instanceof AddressError) {
        setError(err.message);
        
        if (err.statusCode === 401) {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        setError('فشل في حذف العنوان. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!AddressService.isAuthenticated()) {
      setError('يجب تسجيل الدخول لإضافة عنوان');
      router.push('/login');
      return;
    }

    console.log('Add new address');
    router.push('/addAddress');
  };

  const handleSetDefault = async (addressId: string) => {
    // Find the clicked address
    const clickedAddress = addresses.find(addr => 
      addr._id === addressId || addr.id?.toString() === addressId
    );

    // If already default, don't do anything
    if (clickedAddress?.isDefault) {
      console.log('Address is already default');
      return;
    }

    if (!AddressService.isAuthenticated()) {
      setError('يجب تسجيل الدخول للقيام بهذا الإجراء');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const addressToUpdate = addresses.find(addr => 
        addr._id === addressId || addr.id?.toString() === addressId
      );

      if (!addressToUpdate) {
        throw new Error('العنوان غير موجود');
      }

      // Call the update API to set as default
      await AddressService.updateAddress({
        addressId: addressToUpdate._id,
        isDefault: true
      });
      
      // Update local state - set only this address as default
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: (address._id === addressId || address.id?.toString() === addressId)
        }))
      );
      
      console.log('✅ Default address set:', addressId);
      
    } catch (err) {
      console.error('❌ Error setting default address:', err);
      
      if (err instanceof AddressError) {
        setError(err.message);
        
        if (err.statusCode === 401) {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        setError('فشل في تعيين العنوان الافتراضي. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container_form}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>عناوينك</h1>
        
        {error && (
          <div className={styles.errorMessage} style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div className={styles.addressList}>
          {addresses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <p>لا توجد عناوين محفوظة</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                قم بإضافة عنوان جديد للبدء
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div 
                key={address._id || address.id} 
                className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ''}`}
                onClick={() => handleSetDefault(address._id || address.id!.toString())}
                style={{ cursor: address.isDefault ? 'default' : 'pointer' }}
              >
                <div className={styles.addressContent}>
                  <div className={styles.addressHeader}>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressDetails}>
                        <h3 className={styles.addressName}>{getFullName(address)}</h3>
                        <p className={styles.addressPhone}>{getPhone(address)}</p>
                        <p className={styles.addressText}>
                          {address.address}
                          {address.city && `, ${address.city}`}
                          {(address.region || address.governorate) && `, ${address.region || address.governorate}`}
                        </p>
                        {address.isDefault && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            padding: '4px 12px',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            العنوان الافتراضي
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.addressActions}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => handleEdit(address._id || address.id!.toString(), e)}
                      disabled={isLoading}
                      aria-label="تعديل"
                    >
                      <Edit />
                      <span>تعديل</span>
                    </button>
                    
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={(e) => handleDelete(address._id || address.id!.toString(), e)}
                      disabled={isLoading || addresses.length <= 1}
                      aria-label="حذف"
                      title={addresses.length <= 1 ? 'يجب الاحتفاظ بعنوان واحد على الأقل' : ''}
                    >
                      <Delete />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
            disabled={isLoading}
          >
            إضافة عنوان 
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Address;