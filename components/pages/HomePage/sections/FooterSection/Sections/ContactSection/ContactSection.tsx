"use client";
import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContactItem {
  type: "phone" | "email" | "address";
  value: string | string[];
}

interface ContactInfoProps {
  contacts?: ContactItem[];
}

const ContactInfo: React.FC<ContactInfoProps> = ({ contacts }) => {
  const t = useTranslations('footer.contact');

  const defaultContacts: ContactItem[] = [
    { type: "phone", value: "+20 12 20612372" },
    { type: "address", value: "كوبرى القبة - القاهرة مصر" },
    { type: "email", value: ["info@a2z-trading.com", "support@a2z-trading.com"] },
  ];

  const finalContacts = contacts || defaultContacts;

  const icons: Record<string, React.ReactNode> = {
    phone: <Phone className="w-5 h-5 text-secondary1 flex-shrink-0" />,
    address: <MapPin className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
    email: <Mail className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />,
  };

  const getLink = (type: string, value: string): string => {
    switch (type) {
      case "phone": return `tel:${value.replace(/\s/g, "")}`;
      case "email": return `https://mail.google.com/mail/?view=cm&fs=1&to=${value.trim()}`;
      case "address": return `https://maps.app.goo.gl/41u4Vh6848gD8ybs5`;
      default: return "#";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, type: string, value: string) => {
    if (type === "email" || type === "address") {
      e.preventDefault();
      window.open(getLink(type, value), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0">
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none tracking-normal text-secondary1 text-right">
        {t('title')}
      </h3>
      <div className="text-left w-full mt-3 grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:flex-col md:gap-y-3">
        {finalContacts.map((item, index) => (
          <div key={index} className="text-black87">
            {Array.isArray(item.value) ? (
              <div className="flex flex-col gap-2">
                {item.value.map((v, i) => (
                  <div key={i} className="flex items-center justify-start gap-3">
                    {icons[item.type]}
                    <a
                      href={getLink(item.type, v)}
                      onClick={(e) => handleClick(e, item.type, v)}
                      className="text-sm text-left leading-snug hover:text-secondary1 transition-colors duration-200 hover:underline cursor-pointer"
                    >
                      {v}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-start gap-3">
                {icons[item.type]}
                <a
                  href={getLink(item.type, item.value as string)}
                  onClick={(e) => handleClick(e, item.type, item.value as string)}
                  className="text-sm text-left leading-snug hover:text-secondary1 transition-colors duration-200 hover:underline cursor-pointer"
                >
                  {item.value}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ContactInfo);