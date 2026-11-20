import React, { createContext, useContext, useState } from 'react';
import { en, Translations } from './en';
import { hi } from './hi';
import { LanguageCode } from '../types/safety';

export interface I18nContextValue {
  language: LanguageCode;
  t: Translations;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLanguage?: LanguageCode }> = ({
  children,
  initialLanguage = 'en',
}) => {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = language === 'hi' ? hi : en;

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
