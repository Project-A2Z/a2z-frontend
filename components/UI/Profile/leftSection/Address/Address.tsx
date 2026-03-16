"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

//components
import { Button } from "@/components/UI/Buttons/Button";
import Alert from "@/components/UI/Alert/alert";

//services
import { useRouter } from "next/navigation";
import { AddressService, AddressError } from "@/services/profile/address";
import AlertHandler from "@/services/Utils/alertHandler";
import { getLocale } from "@/services/api/language";

//styles
import styles from "./address.module.css";

// Icons
import Edit from "./../../../../../public/icons/Pen.svg";
import Delete from "./../../../../../public/icons/Trash Bin Trash.svg";
import Add from "./../../../../../public/icons/addLocation.svg";

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
  const t = useTranslations("profile.left.address");
  const isRtl = getLocale() === "ar";

  const [addresses, setAddresses] = useState<Address[]>(Addresses || []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmAlert, setDeleteConfirmAlert] = useState<{
    isOpen: boolean;
    addressId: string | null;
  }>({
    isOpen: false,
    addressId: null,
  });

  const getFullName = (address: Address): string => {
    if (address.name) return address.name;
    if (address.firstName && address.lastName) {
      return `${address.firstName} ${address.lastName}`;
    }
    return address.firstName || address.lastName || t("fallback.name");
  };

  const getPhone = (address: Address): string => {
    return address.phoneNumber || address.phone || t("fallback.phone");
  };

  const handleEdit = (addressId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const addressToEdit = addresses.find(
      (addr) => addr._id === addressId || addr.id?.toString() === addressId,
    );
    if (addressToEdit) {
      const queryParams = new URLSearchParams({
        id: addressToEdit._id || addressToEdit.id?.toString() || "",
        firstName: addressToEdit.firstName || "",
        lastName: addressToEdit.lastName || "",
        phoneNumber: getPhone(addressToEdit),
        address: addressToEdit.address || "",
        region: addressToEdit.region || addressToEdit.governorate || "",
        city: addressToEdit.city || "",
        isDefault: addressToEdit.isDefault ? "true" : "false",
        mode: "edit",
      });

      router.push(`/addAddress?${queryParams.toString()}`);
    }
  };

  const handleDeleteClick = (addressId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setDeleteConfirmAlert({
      isOpen: true,
      addressId: addressId,
    });
  };

  const handleDeleteConfirm = async () => {
    const addressId = deleteConfirmAlert.addressId;

    if (!addressId) return;

    setDeleteConfirmAlert({ isOpen: false, addressId: null });

    if (!AddressService.isAuthenticated()) {
      AlertHandler.error(t("errors.loginRequired"));
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    setIsLoading(true);

    try {
      await AddressService.deleteAddress(addressId);

      setAddresses((prev) =>
        prev.filter(
          (address) =>
            address._id !== addressId && address.id?.toString() !== addressId,
        ),
      );
    } catch (err) {
      if (err instanceof AddressError) {
        if (!err.message.includes("تم حذف")) {
          AlertHandler.error(err.message);
        }

        if (err.statusCode === 401) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        AlertHandler.error(t("errors.deleteFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmAlert({ isOpen: false, addressId: null });
  };

  const handleAddAddress = () => {
    if (!AddressService.isAuthenticated()) {
      AlertHandler.error(t("errors.loginRequiredToAdd"));
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    router.push("/addAddress");
  };

  const handleSetDefault = async (addressId: string) => {
    const clickedAddress = addresses.find(
      (addr) => addr._id === addressId || addr.id?.toString() === addressId,
    );

    if (clickedAddress?.isDefault) return;

    if (!AddressService.isAuthenticated()) {
      AlertHandler.error(t("errors.loginRequired"));
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    setIsLoading(true);

    try {
      const addressToUpdate = addresses.find(
        (addr) => addr._id === addressId || addr.id?.toString() === addressId,
      );

      if (!addressToUpdate) {
        throw new Error(t("errors.addressNotFound"));
      }

      await AddressService.updateAddress({
        addressId: addressToUpdate._id,
        isDefault: true,
      });

      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault:
            address._id === addressId || address.id?.toString() === addressId,
        })),
      );
    } catch (err) {
      if (err instanceof AddressError) {
        if (!err.message.includes("تم تحديث")) {
          AlertHandler.error(err.message);
        }

        if (err.statusCode === 401) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        AlertHandler.error(t("errors.setDefaultFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container_form} style={{direction: isRtl ? 'rtl' : 'ltr'}}>
      <div className={styles.formCard} style={{ textAlign: isRtl ? 'right' : 'left' }}>
        <h1 className={styles.title} style={{textAlign: isRtl ? 'right' : 'left'}}>{t("title")}</h1>

        <div className={styles.addressList} style={{ textAlign: isRtl ? 'right' : 'left' }}>
          {addresses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#666",
              }}
            >
              <p>{t("empty.message")}</p>
              <p style={{ fontSize: "14px", marginTop: "8px" , direction: isRtl ? 'rtl' : 'ltr' }}>
                {t("empty.hint")}
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address._id || address.id}
                className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ""}`}
                onClick={() =>
                  handleSetDefault(address._id || address.id!.toString())
                }
                style={{ cursor: address.isDefault ? "default" : "pointer" , textAlign: isRtl ? 'right' : 'left' , direction: isRtl ? 'rtl' : 'ltr' }}
              >
                <div className={styles.addressContent}>
                  <div className={styles.addressHeader}>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressDetails}>
                        <div className={styles.head}>
                          <h3 className={styles.addressName}>
                            {getFullName(address)}
                          </h3>
                          <div className={styles.addressActions}>
                            <button
                              className={styles.actionButton}
                              onClick={(e) =>
                                handleEdit(
                                  address._id || address.id!.toString(),
                                  e,
                                )
                              }
                              disabled={isLoading}
                              aria-label={t("actions.edit")}
                            >
                              <Edit />
                              <span>{t("actions.edit")}</span>
                            </button>

                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={(e) =>
                                handleDeleteClick(
                                  address._id || address.id!.toString(),
                                  e,
                                )
                              }
                              disabled={isLoading || addresses.length <= 1}
                              aria-label={t("actions.delete")}
                              title={
                                addresses.length <= 1
                                  ? t("card.deleteDisabledTitle")
                                  : ""
                              }
                            >
                              <Delete />
                              <span>{t("actions.delete")}</span>
                            </button>
                          </div>
                        </div>
                        <p className={styles.addressPhone}>
                          {getPhone(address)}
                        </p>
                        <p className={styles.addressText}>
                          {address.address}
                          {address.city && `, ${address.city}`}
                          {(address.region || address.governorate) &&
                            `, ${address.region || address.governorate}`}
                        </p>
                        {address.isDefault && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "8px",
                              padding: "4px 12px",
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {t("card.defaultBadge")}
                          </span>
                        )}
                      </div>
                    </div>
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
            state={isLoading ? "loading" : "default"}
            loadingText={t("actions.loadingText")}
            rightIcon={<Add />}
            fullWidth
            className={styles.addButton}
            rounded={true}
            onClick={handleAddAddress}
            disabled={isLoading}
          >
            {t("actions.addAddress")}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      <Alert
        isOpen={deleteConfirmAlert.isOpen}
        type="warning"
        title={t("deleteAlert.title")}
        message={t("deleteAlert.message")}
        confirmText={t("deleteAlert.confirm")}
        cancelText={t("deleteAlert.cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        setClose={handleDeleteCancel}
      />
    </div>
  );
};

export default Address;