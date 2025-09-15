"use client";
import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

/**
 * FloatingChat renders two floating action buttons on all pages:
 * - General chat button (opens a contact route or chat widget)
 * - WhatsApp quick contact
 *
 * Place this near the end of your layout to overlay on top of page content.
 */
const FloatingChat: React.FC = () => {
  // You can change these targets as needed
  const chatHref = "/contact"; // TODO: point to your chat/contact page or widget trigger
  const whatsappHref = `https://wa.me/201234567890`; // TODO: replace with your WhatsApp number

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-center gap-3">
      {/* Chat button */}
      <Link
        href={chatHref}
        className="group rounded-full shadow-lg bg-white border border-black8 w-12 h-12 flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="الدردشة"
      >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </Link>

      {/* WhatsApp button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full shadow-lg bg-[#25D366] w-12 h-12 flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="واتساب"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
      </a>
    </div>
  );
};

export default FloatingChat;
