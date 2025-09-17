"use client";
import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const FloatingChat: React.FC = () => {
const chatHref = "/contact";
const whatsappHref = `https://wa.me/201234567890`; // TODO: replace with your WhatsApp number
const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {/* WhatsApp button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-full shadow-lg bg-[#25D366] w-14 h-14 flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-x-1"
        aria-label="واتساب"
      >
        <FaWhatsapp className="w-6 h-6 text-white" />
        <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          تواصل معنا عبر واتساب
        </span>
      </a>

      {/* Chat button opens modal */}
      <button
        onClick={() => setOpen(true)}
        className="group rounded-full shadow-lg bg-white border border-gray-200 w-14 h-14 flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-x-1"
        aria-label="الدردشة"
        type="button"
      >
        <div className="w-6 h-6 text-primary group-hover:scale-110 transition-transform">
          <MessageCircle className="w-full h-full" />
        </div>
        <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          تواصل معنا
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed  inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal card */}
          <div className="relative z-[61] w-[92%] max-w-3xl bg-white rounded-2xl shadow-2xl border border-black8 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-black87 mx-auto">للشكاوى والاستفسارات</h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute left-3 top-3 text-black60 hover:text-black87"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: handle submit
                setOpen(false);
              }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="الاسم"
                    className="w-full rounded-full border border-black16 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="w-full rounded-full border border-black16 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full rounded-full border border-black16 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <textarea
                  rows={5}
                  placeholder="اكتب الشكوى أو الاستفسار لنتمكن من تقديم المساعدة"
                  className="w-full rounded-2xl border border-black16 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-primary text-white px-8 py-2.5 hover:bg-primary/90 transition-colors"
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
};

export default React.memo(FloatingChat);
