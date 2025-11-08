"use client";
import { useEffect, useRef } from 'react';

interface GoogleTranslateProps {
  pageLanguage?: string;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

const GoogleTranslate: React.FC<GoogleTranslateProps> = ({ 
  pageLanguage = 'ar' 
}) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create container outside React root
    let translateContainer = document.getElementById('google_translate_element');
    if (!translateContainer) {
      translateContainer = document.createElement('div');
      translateContainer.id = 'google_translate_element';
      translateContainer.className = 'notranslate';
      translateContainer.setAttribute('translate', 'no');
      document.body.appendChild(translateContainer);
    }

    // Add protective styles
    const style = document.createElement('style');
    style.id = 'google-translate-styles';
    style.innerHTML = `
      body { top: 0 !important; }
      .goog-te-banner-frame { display: none !important; }
      .skiptranslate { display: none !important; }
      
      /* Hide the Google Translate widget completely */
      #google_translate_element {
        display: none !important;
      }
      
      .goog-te-gadget {
        display: none !important;
      }
      
      .goog-te-combo {
        display: none !important;
      }
      
      body > .skiptranslate {
        display: none !important;
      }
      
      iframe.skiptranslate {
        display: none !important;
      }
      
      /* Prevent translation of currency symbols */
      .notranslate, [translate="no"] {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    
    if (!document.getElementById('google-translate-styles')) {
      document.head.appendChild(style);
    }

    // Add custom translation glossary for currency
    const glossaryStyle = document.createElement('style');
    glossaryStyle.id = 'currency-translation-fix';
    glossaryStyle.innerHTML = `
      /* Force currency display */
      .currency-symbol::after {
        content: attr(data-currency);
      }
    `;
    if (!document.getElementById('currency-translation-fix')) {
      document.head.appendChild(glossaryStyle);
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate && translateContainer) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: pageLanguage,
              includedLanguages: 'ar,en',
              layout: 0,
              autoDisplay: false,
            },
            'google_translate_element'
          );

          // Monitor for translation changes
          const observer = new MutationObserver(() => {
            // Re-apply notranslate class to currency elements if needed
            document.querySelectorAll('.currency, .notranslate').forEach(el => {
              if (!el.classList.contains('notranslate')) {
                el.classList.add('notranslate');
                el.setAttribute('translate', 'no');
              }
            });
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'translate']
          });

        } catch (error) {
          console.error('Error initializing Google Translate:', error);
        }
      }
    };

    // Load script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {};
  }, [pageLanguage]);

  return null;
};

export default GoogleTranslate;