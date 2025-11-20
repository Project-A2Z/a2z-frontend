"use client";
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const languages = [
    { code: 'ar', name: 'العربية', flag: 'AR' },
    { code: 'en', name: 'English', flag: 'US' },
   
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'ar';
    setCurrentLanguage(savedLang);
    
    if (savedLang !== 'ar') {
      const attemptTranslation = () => {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          setTimeout(() => {
            triggerTranslation(savedLang);
          }, 3000);
        } else {
          setTimeout(attemptTranslation, 3000);
        }
      };
      
      setTimeout(attemptTranslation, 3000);
    }
  }, []);

  const triggerTranslation = (langCode: string) => {
    try {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement && selectElement.value !== langCode) {
        setIsTranslating(true);
        
        // CRITICAL: Add class to prevent animations during translation
        document.body.classList.add('translating');
        
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Wait for translation to complete
        setTimeout(() => {
          setIsTranslating(false);
          document.body.classList.remove('translating');
        }, 2000);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      document.body.classList.remove('translating');
    }
  };

  const handleLanguageChange = (langCode: string) => {
    if (isTranslating) return;
    
    setCurrentLanguage(langCode);
    setIsOpen(false);
    localStorage.setItem('selectedLanguage', langCode);
    
    const html = document.documentElement;
    
    if (langCode === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      
      // Clear Google Translate cookies
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      
      // IMPROVED: Use proper navigation instead of reload
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 3000);
    } else {
      html.setAttribute('dir', langCode === 'ar' ? 'rtl' : 'ltr');
      html.setAttribute('lang', langCode);
      
      const checkAndTranslate = () => {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          triggerTranslation(langCode);
        } else {
          setTimeout(checkAndTranslate, 3000);
        }
      };
      
      checkAndTranslate();
    }
  };

  return (
    <div className="relative notranslate" translate="no">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={`flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100 ${
          isTranslating ? 'opacity-50 cursor-wait' : ''
        }`}
        aria-label="Select language"
      >
        <span className="text-sm font-medium">
          {isTranslating ? 'جاري الترجمة...' : languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isTranslating && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2.5 text-sm flex justify-between items-center 
                  hover:bg-gray-50 transition-colors
                  ${currentLanguage === language.code 
                    ? 'text-green-600 font-semibold bg-green-50' 
                    : 'text-gray-700'}`}
                aria-current={currentLanguage === language.code ? 'true' : undefined}
              >
                <span>{language.name}</span>
                <span className="text-xs text-gray-400">{language.flag}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;