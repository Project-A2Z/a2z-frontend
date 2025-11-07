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
    // Only initialize once
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
      
      /* Hide all Google Translate UI elements */
      .goog-te-gadget {
        display: none !important;
      }
      
      .goog-te-combo {
        display: none !important;
      }
      
      /* Hide the top frame */
      body > .skiptranslate {
        display: none !important;
      }
      
      iframe.skiptranslate {
        display: none !important;
      }
    `;
    
    if (!document.getElementById('google-translate-styles')) {
      document.head.appendChild(style);
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

    // No cleanup - let Google Translate persist
    return () => {};
  }, [pageLanguage]);

  // Return null - container is outside React
  return null;
};

export default GoogleTranslate;