"use client";
import React, { useState, useEffect } from "react";
import Alert from "@/components/UI/Alert/alert";
import AlertHandlerService, { AlertConfig } from "@/services/Utils/alertHandler";

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AlertHandlerService.setHandler((config: AlertConfig) => {
      setAlertConfig(config);
      setIsOpen(true);
    });

    return () => {
      AlertHandlerService.clearHandler();
    };
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {children}
      {isOpen && alertConfig && (
        <Alert
          isOpen={isOpen}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          setClose={handleClose}
          onConfirm={() => {
            alertConfig.onConfirm?.();
            handleClose();
          }}
          onCancel={() => {
            alertConfig.onCancel?.();
            handleClose();
          }}
        />
      )}
    </>
  );
};

export default AlertProvider;