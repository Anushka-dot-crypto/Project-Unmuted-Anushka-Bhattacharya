import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/languages';
import { REGIONS } from '../data/regions';
import { Region } from '../types';

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large';
}

interface LocaleContextType {
  language: string;
  setLanguage: (code: string) => void;
  region: Region;
  setRegionCode: (code: string) => void;
  accessibility: AccessibilitySettings;
  accessibilitySettings: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  t: (key: string, defaultText?: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'unmuted_locale_prefs';

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) return parsed.language;
      }
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  const [regionCode, setRegionCodeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.regionCode) return parsed.regionCode;
      }
    } catch (e) {
      console.error(e);
    }
    return 'IN-ALL';
  });

  const [accessibility, setAccessibilityState] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accessibility) {
          return {
            largeText: parsed.accessibility.largeText || false,
            highContrast: parsed.accessibility.highContrast || false,
            reducedMotion: parsed.accessibility.reducedMotion || false,
            theme: parsed.accessibility.theme || 'system',
            fontSize: parsed.accessibility.fontSize || 'normal',
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      largeText: false,
      highContrast: false,
      reducedMotion: false,
      theme: 'system',
      fontSize: 'normal',
    };
  });

  useEffect(() => {
    localStorage.setItem(
      LOCALE_STORAGE_KEY,
      JSON.stringify({ language, regionCode, accessibility })
    );

    // Apply root accessibility DOM classes
    const root = document.documentElement;

    // Theme mode
    if (accessibility.theme === 'dark') {
      root.classList.add('dark');
    } else if (accessibility.theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    if (accessibility.largeText || accessibility.fontSize === 'large') {
      root.classList.add('text-lg-mode');
    } else {
      root.classList.remove('text-lg-mode');
    }

    if (accessibility.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (accessibility.reducedMotion) {
      root.classList.add('reduced-motion-mode');
    } else {
      root.classList.remove('reduced-motion-mode');
    }
  }, [language, regionCode, accessibility]);

  const setLanguage = (code: string) => {
    setLanguageState(code);
  };

  const setRegionCode = (code: string) => {
    setRegionCodeState(code);
  };

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibilityState((prev) => ({ ...prev, ...settings }));
  };

  const currentRegion = REGIONS.find((r) => r.code === regionCode) || REGIONS[0];

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return defaultText || key;
  };

  return (
    <LocaleContext.Provider
      value={{
        language,
        setLanguage,
        region: currentRegion,
        setRegionCode,
        accessibility,
        accessibilitySettings: accessibility,
        updateAccessibility,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
