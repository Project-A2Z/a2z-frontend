"use client";
import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

interface ContactItem {
  type: "phone" | "email" | "address";
  value: string | string[];
}

interface ContactInfoProps {
  contacts?: ContactItem[];
}

const ContactInfo: React.FC<ContactInfoProps> = ({ contacts }) => {
  const defaultContacts: ContactItem[] = [
    { type: "phone", value: "+201002866565" },
    { type: "address", value: "كوبرى القبة - القاهرة مصر" },
    { type: "email", value: ["info@a2z-trading.com", "support@a2z-trading.com"] },
  ];

  const finalContacts = contacts || defaultContacts;

  const handleContactClick = (type: string, value: string) => {
    switch (type) {
      case "phone":
        window.location.href = `tel:${value}`;
        break;
      case "address":
        // Encode the address for Google Maps URL
        const encodedAddress = encodeURIComponent(value);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        break;
      case "email":
        window.location.href = `mailto:${value}`;
        break;
      default:
        break;
    }
  };

  const icons: Record<string, React.ReactNode> = {
    phone: <Phone className="w-5 h-5 text-secondary1 flex-shrink-0" />,
    address: <MapPin className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
    email: <Mail className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0">
      <div className="w-full">
        <h3 
          className="text-secondary1 text-right"
          style={{
            fontFamily: 'Beiruti',
            fontWeight: 600,
            fontStyle: 'SemiBold',
            fontSize: '16px',
            lineHeight: '100%',
            letterSpacing: '0%',
            width: '63px',
            height: '19px',
            opacity: 1,
            transform: 'rotate(0deg)'
          }}
        >
          تواصل معنا
        </h3>
      </div>
      <div className="text-left w-full mt-3 grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:flex-col md:gap-y-3">
        {finalContacts.map((item, index) => {
          const values = Array.isArray(item.value) ? item.value : [item.value];
          
          return values.map((value, i) => (
            <div
              key={`${index}-${i}`}
              className="flex items-center justify-start gap-3 text-black87 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleContactClick(item.type, value)}
            >
              {i === 0 && icons[item.type]}
              <span className="text-sm text-left leading-snug">
                {value}
              </span>
            </div>
          ));
        })}
      </div>
    </div>
  );
};

export default React.memo(ContactInfo);