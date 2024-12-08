// src/utils/i18n.ts

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

class I18nManager {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await i18next
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          fallbackLng: 'en',
          debug: import.meta.env.DEV,
          interpolation: {
            escapeValue: false
          },
          backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json'
          },
          detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
          }
        });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
    }
  }

  changeLanguage(language: string): Promise<void> {
    return i18next.changeLanguage(language);
  }

  getCurrentLanguage(): string {
    return i18next.language;
  }

  t(key: string, options?: any): string {
    return i18next.t(key, options);
  }
}

export const i18n = new I18nManager();
