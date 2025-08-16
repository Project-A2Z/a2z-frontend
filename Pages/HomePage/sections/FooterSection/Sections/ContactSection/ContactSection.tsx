import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';


const ContactSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-secondary1 mb-6">تواصل معنا</h3>
      
      <div className="space-y-4">
        {/* Phone */}
        <div className="flex items-center gap-3 text-gray-200">
          <Phone className="w-5 h-5 text-secondary1 flex-shrink-0" />
          <span className="text-sm">+201002866565</span>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3 text-gray-200">
          <Mail className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div>info@a2z-trading.com</div>
            <div>support@a2z-trading.com</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 text-gray-200">
          <MapPin className="w-5 h-5 text-secondary1 flex-shrink-0 mt-0.5" />
          <span className="text-sm">كوبرى القبة - القاهرة مصر</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactSection);