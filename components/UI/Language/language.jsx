import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'ar', name: 'العربية', flag: 'AR' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setIsOpen(false);
    // Handle language change logic here
    console.log('Language changed to:', langCode);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        
        <span className="text-sm">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage === language.code ? 'bg-green-50 text-green-600' : 'text-gray-700'
                }`}
              >
                <span>{language.flag}</span>
                <span className="text-sm">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;