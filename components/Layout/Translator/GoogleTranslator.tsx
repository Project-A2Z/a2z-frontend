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
  const scriptLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (scriptLoadedRef.current) return;

    // Check if script already exists
    const existingScript = document.getElementById('google-translate-script');
    if (existingScript) return;

    // CRITICAL: Protect React's DOM from Google Translate
    const style = document.createElement('style');
    style.innerHTML = `
      /* Prevent Google Translate from affecting layout */
      body {
        top: 0 !important;
        position: static !important;
      }
      
      /* Hide Google Translate banner */
      .goog-te-banner-frame {
        display: none !important;
      }
      
      .skiptranslate {
        display: none !important;
      }
      
      /* Prevent Google Translate from breaking React */
      .translated-ltr, .translated-rtl {
        margin: 0 !important;
      }
      
      /* CRITICAL: Prevent Google Translate from modifying React root */
      #__next {
        isolation: isolate;
      }
      
      /* Disable transitions during translation to prevent DOM conflicts */
      body.translating * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);

    // CRITICAL: Mark React root as "notranslate" to prevent DOM conflicts
    const protectReactDOM = () => {
      const nextRoot = document.getElementById('__next');
      const reactRoot = document.getElementById('root');
      
      if (nextRoot) {
        nextRoot.classList.add('notranslate');
        nextRoot.setAttribute('translate', 'no');
      }
      if (reactRoot) {
        reactRoot.classList.add('notranslate');
        reactRoot.setAttribute('translate', 'no');
      }
    };

    protectReactDOM();

    // Initialize Google Translate with safer configuration
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          // Add translating class before initialization
          document.body.classList.add('translating');
          
          new window.google.translate.TranslateElement(
            {
              pageLanguage: pageLanguage,
              includedLanguages: 'ar,en',
              layout: 0, 
              autoDisplay: false,
            },
            'google_translate_element'
          );
          
          console.log('✅ Google Translate initialized');
          
          // Remove translating class after initialization
          setTimeout(() => {
            document.body.classList.remove('translating');
          }, 1000);
          
        } catch (error) {
          console.error('❌ Error initializing Google Translate:', error);
          document.body.classList.remove('translating');
        }
      }
    };

    // Add Google Translate script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Translate script');
      scriptLoadedRef.current = false;
      document.body.classList.remove('translating');
    };

    script.onload = () => {
      console.log('✅ Google Translate script loaded');
      scriptLoadedRef.current = true;
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Keep script loaded but clean up classes
      document.body.classList.remove('translating');
    };
  }, [pageLanguage]);

  return (
    <div 
      ref={containerRef}
      id="google_translate_element" 
      className="notranslate"
      translate="no"
      style={{ 
        display: 'none',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        isolation: 'isolate'
      }}
    />
  );
};

export default GoogleTranslate;