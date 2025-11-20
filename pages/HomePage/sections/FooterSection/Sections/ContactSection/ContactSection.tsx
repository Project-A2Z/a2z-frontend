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

  const icons: Record<string, React.ReactNode> = {
    phone: <Phone className="w-5 h-5 text-secondary1 flex-shrink-0" />,
    address: <MapPin className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
    email: <Mail className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0">
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none tracking-normal text-secondary1 text-right">
        تواصل معنا
      </h3>
      <div className="text-left w-full mt-3 grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:flex-col md:gap-y-3">
        {finalContacts.map((item, index) => (
            <div
             key={index}
             className="flex items-center justify-start gap-3 text-black87"
           >
             {/* icon */}
             {icons[item.type]}
             {/* content */}
             {Array.isArray(item.value) ? (
               <div className="text-sm text-left leading-snug">
                 {item.value.map((v, i) => (
                   <div key={i}>{v}</div>
                 ))}
               </div>
             ) : (
               <span className="text-sm text-left leading-snug">{item.value}</span>
             )}
           </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ContactInfo);
