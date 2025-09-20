import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'ar', name: 'العربية', flag: 'AR' },
    { code: 'en', name: 'English', flag: 'US' },
  ];

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setIsOpen(false);
    console.log('Language changed to:', langCode);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-sm font-medium">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-sm flex justify-between items-center 
                  hover:bg-gray-50 transition-colors
                  ${currentLanguage === language.code 
                    ? 'text-green-600 font-semibold bg-green-50' 
                    : 'text-gray-700'}`}
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
