import React, { useEffect, useState, useRef } from 'react';
import { useLocale } from '../context/LocaleContext';
import { LANGUAGES } from '../data/languages';
import { Globe, Check, ChevronDown, Sparkles, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export const GoogleTranslateBar: React.FC = () => {
  const { language, setLanguage } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [activeLangCode, setActiveLangCode] = useState<string>(() => {
    // Check cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : (language || 'en');
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Element
  useEffect(() => {
    // Define the global callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages:
                'en,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,mai,sa,sat,ks,ne,sd,gom,doi,mni-Mtei,bho,es',
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
              autoDisplay: false,
            },
            'google_translate_element'
          );
          setScriptLoaded(true);
        }
      } catch (e) {
        console.warn('Google Translate initialization notice:', e);
      }
    };

    // Load Google script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      setScriptLoaded(true);
    }

    // Close on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const changeLanguage = (code: string) => {
    setActiveLangCode(code);
    setLanguage(code);
    setIsOpen(false);

    try {
      // Set Google Translate cookie
      const domain = window.location.hostname;
      if (code === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; domain=${domain}; path=/;`;
      }

      // Try triggering select directly
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = code;
        combo.dispatchEvent(new Event('change'));
      } else {
        // Reload to apply translation smoothly if widget hasn't mounted combo
        window.location.reload();
      }
    } catch (err) {
      console.warn('Translate switch info:', err);
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLangCode) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs"
        title="Google Translate (All Indian Languages)"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline font-medium text-slate-300">Translate:</span>
        <span className="text-white font-bold">{currentLangObj.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col text-white animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Globe className="w-4 h-4" />
                <span>Google Translate</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded-md border border-indigo-800/80 font-mono">
                All Indian Languages
              </span>
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Hindi, Tamil, Telugu..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Language List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-64 divide-y divide-slate-800/40">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === activeLangCode;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-400">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching Indian language found.
              </div>
            )}
          </div>

          {/* Footer Reset */}
          <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => changeLanguage('en')}
              className="text-slate-400 hover:text-white underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to English (Original)
            </button>
            <span className="text-[10px] text-slate-500">22+ Languages</span>
          </div>
        </div>
      )}
    </div>
  );
};
