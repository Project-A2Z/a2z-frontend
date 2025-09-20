import React from 'react';
import { IconButton } from '@/components/UI/Buttons/Button';

const FloatingWhatsApp: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 lg:hidden">
      <IconButton
        aria-label="open whatsapp"
        title="واتساب"
        size="md"
        className="rounded-full bg-[#25D366] text-white shadow-lg hover:bg-opacity-90"
        icon={<img src="/icons/whatsapp.svg" alt="واتساب" className="w-6 h-6" />}
      />
    </div>
  );
};

export default FloatingWhatsApp;


