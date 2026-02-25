"use client";
import React, { useState, useEffect } from 'react';
import { User } from '@/services/auth/login';
import { FaWhatsapp } from 'react-icons/fa';
import { MessageCircle } from 'lucide-react';
import { inquiryService, checkBackendHealth } from '@/services/api/inquiry';
import { UserStorage } from '@/services/auth/login';

/**
 * Get auth token from localStorage (optional)
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

interface FloatingChatProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FloatingChat({ isOpen: externalOpen, onOpenChange }: FloatingChatProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const whatsappHref = 'https://wa.me/201007710805';
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = UserStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (!formData.name || !formData.phoneNumber || !formData.description) {
        throw new Error('الرجاء ملء جميع الحقول المطلوبة');
      }

      if (formData.name.length < 2 || formData.name.length > 100) {
        throw new Error('الاسم يجب أن يكون بين 2 و100 حرف');
      }

      const phoneRegex = /^01[0-9]{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        throw new Error('رقم الهاتف غير صالح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقمًا');
      }

      if (formData.description.length < 10 || formData.description.length > 1000) {
        throw new Error('الوصف يجب أن يكون بين 10 و1000 حرف');
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        throw new Error('البريد الإلكتروني غير صالح');
      }

      const inquiryData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        description: formData.description.trim()
      };

      await inquiryService.createInquiry(inquiryData);

      setSubmitStatus({
        success: true,
        message: 'تم إرسال استفسارك بنجاح. سنتواصل معك قريباً!'
      });

      setFormData({ name: '', phoneNumber: '', email: '', description: '' });

      setTimeout(() => {
        setOpen(false);
        setSubmitStatus(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error in handleSubmit:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });

      let errorMessage = error.message || 'حدث خطأ أثناء إرسال الاستفسار';

      if (error.name === 'ValidationError' && error.cause?.length) {
        errorMessage = 'خطأ في البيانات:\n' + error.cause.map((err: any) => `- ${err.message}`).join('\n');
      } else if (error.message.includes('البيانات المرسلة غير صالحة')) {
        errorMessage = 'البيانات المرسلة غير صالحة. تحقق من الاسم، رقم الهاتف، والوصف.';
      }

      setSubmitStatus({ success: false, message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-24 md:bottom-4 z-50 flex flex-col-reverse gap-4">
      {/* Chat button */}
      {isMounted && (
        <button
          onClick={() => setOpen(true)}
          className={`${
            user ? 'hidden md:flex' : 'flex'
          } relative group w-14 h-14 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center hover:shadow-xl transition-all`}
          aria-label="الدردشة"
          type="button"
        >
          <MessageCircle className="w-6 h-6 text-primary" />
          <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            تواصل معنا
          </span>
        </button>
      )}

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

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSubmitting && setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            dir="rtl"
          >
            {/* Close button */}
            <button
              onClick={() => !isSubmitting && setOpen(false)}
              className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-40 text-xl leading-none"
              disabled={isSubmitting}
              aria-label="إغلاق"
              type="button"
            >
              ✕
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pt-10 pb-8 space-y-4">
              {/* Title */}
              <h3 className="text-center text-xl font-semibold text-gray-800 mb-6">
                للشكاوي والاستفسارات
              </h3>

              {/* Name + Phone row */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="رقم الهاتف"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                  required
                  pattern="01[0-9]{9}"
                  title="يجب إدخال رقم هاتف صحيح (يبدأ بـ 01 ويحتوي على 11 رقم)"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="الاسم"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="البريد الإلكتروني"
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                required
                disabled={isSubmitting}
              />

              {/* Textarea */}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="اكتب الشكوي او الاستفسار لنتمكن من تقديم المساعدة"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-60"
                required
                minLength={10}
                maxLength={1000}
                disabled={isSubmitting}
              />

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`p-3 rounded-xl text-sm text-right ${
                    submitStatus.success
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {submitStatus.message.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
              )}

              {/* Submit button */}
              <div className="pt-1 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-16 rounded-full transition-colors text-base ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}