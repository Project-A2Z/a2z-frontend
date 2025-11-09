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
    return localStorage.getItem('authToken'); // Optional; sends if available
  }
  return null;
};

export default function FloatingChat() {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const whatsappHref = 'https://wa.me/2010957676137';
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = UserStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    // Format user's name from first and last name
    const formatUserName = (user: User | null): string => {
      if (!user) return '';
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    };
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
      // Basic form validation
      if (!formData.name || !formData.phoneNumber || !formData.description) {
        throw new Error('الرجاء ملء جميع الحقول المطلوبة');
      }

      // Name validation (2-100 characters)
      if (formData.name.length < 2 || formData.name.length > 100) {
        throw new Error('الاسم يجب أن يكون بين 2 و100 حرف');
      }

      // Phone number validation (Egyptian number: starts with 01, 11 digits)
      const phoneRegex = /^01[0-9]{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        throw new Error('رقم الهاتف غير صالح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقمًا');
      }

      // Description validation (10-1000 characters)
      if (formData.description.length < 10 || formData.description.length > 1000) {
        throw new Error('الوصف يجب أن يكون بين 10 و1000 حرف');
      }

      // Email validation (if provided)
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        throw new Error('البريد الإلكتروني غير صالح');
      }

      // Prepare the request data
      const inquiryData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        description: formData.description.trim()
      };

      //console.log('Submitting inquiry:', inquiryData);

      // Call the API to create inquiry
      await inquiryService.createInquiry(inquiryData);

      // Show success message
      setSubmitStatus({
        success: true,
        message: 'تم إرسال استفسارك بنجاح. سنتواصل معك قريباً!'
      });

      // Reset form
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        description: ''
      });
      
      // Auto-close after 3 seconds
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
      
      // Handle validation errors
      if (error.name === 'ValidationError' && error.cause?.length) {
        errorMessage = 'خطأ في البيانات:\n' + error.cause.map((err: any) => `- ${err.message}`).join('\n');
      }
      // Handle 400 errors
      else if (error.message.includes('البيانات المرسلة غير صالحة')) {
        errorMessage = 'البيانات المرسلة غير صالحة. تحقق من الاسم، رقم الهاتف، والوصف.';
      }

      setSubmitStatus({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-24 md:bottom-4 z-50 flex flex-col-reverse gap-4">
      {/* Chat button - Only render after component mounts to prevent hydration mismatch */}
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

      {/* WhatsApp button - Always show on all screen sizes */}
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
            className="absolute inset-0 bg-black/50"
            onClick={() => !isSubmitting && setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-4 text-center relative">
              <h3 className="text-lg font-semibold">اتصل بنا</h3>
              <button 
                onClick={() => !isSubmitting && setOpen(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 disabled:opacity-50"
                disabled={isSubmitting}
                aria-label="إغلاق"
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="الاسم"
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    minLength={2}
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="رقم الهاتف"
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    pattern="01[0-9]{9}"
                    title="يجب إدخال رقم هاتف صحيح (يبدأ بـ 01 ويحتوي على 11 رقم)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="البريد الإلكتروني"
                  className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="اكتب الشكوى أو الاستفسار لنتمكن من تقديم المساعدة"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  minLength={10}
                  maxLength={1000}
                  disabled={isSubmitting}
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  submitStatus.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {submitStatus.message.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-full transition-colors ${
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