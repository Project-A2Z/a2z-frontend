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
    { type: "email", value: ["info@a2z-trading.com", "support@a2z-trading.com"] },
    { type: "address", value: "كوبرى القبة - القاهرة مصر" },
  ];

  const finalContacts = contacts || defaultContacts;

  const icons: Record<string, React.ReactNode> = {
    phone: <Phone className="w-5 h-5 text-secondary1 flex-shrink-0" />,
    email: <Mail className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
    address: <MapPin className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className="w-[18%] h-[15vh] rounded-lg">
      <h3 className="font-beiruti font-semibold text-base leading-none tracking-normal text-secondary1 text-right">
        تواصل معنا
      </h3>
      <div className="text-right w-full h-[12vh] mt-4">
        {finalContacts.map((item, index) => (
          <div
            key={index}
            className="flex items-end justify-end gap-4 text-black87 mb-3 text-center"
          >
            {/* content */}
            {Array.isArray(item.value) ? (
              <div className="text-sm">
                {item.value.map((v, i) => (
                  <div key={i}>{v}</div>
                ))}
              </div>
            ) : (
              <span className="text-sm">{item.value}</span>
            )}
            {/* icon */}
            {icons[item.type]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ContactInfo);
