import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { MessageCircle } from 'lucide-react';

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const whatsappHref = 'https://wa.me/2010957676137';

  return (
    //fixed right-4 bottom-1/2 transform translate-y-1/2 z-50 flex flex-col items-end gap-4
    <div className="fixed right-4 bottom-1/2  z-50 flex flex-col-reverse gap-4">
      {/* WhatsApp button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        aria-label="واتساب"
      >
        <FaWhatsapp className="w-6 h-6 text-white" />
        <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          تواصل معنا عبر واتساب
        </span>
      </a>

      {/* Chat button */}
      <button
        onClick={() => setOpen(true)}
        className="relative group w-14 h-14 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        aria-label="الدردشة"
        type="button"
      >
        <MessageCircle className="w-6 h-6 text-primary" />
        <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          تواصل معنا
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-4 text-center relative">
              <h2 className="text-lg font-bold">للشكاوى والاستفسارات</h2>
              <button 
                onClick={() => setOpen(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="الاسم"
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="اكتب الشكوى أو الاستفسار لنتمكن من تقديم المساعدة"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-full transition-colors"
                >
                  إرسال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
