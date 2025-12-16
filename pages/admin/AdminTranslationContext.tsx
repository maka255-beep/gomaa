
import React, { createContext, useContext } from 'react';

const LanguageContext = createContext<any>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAdminTranslation = () => {
    return { t: (k: string) => k, language: 'ar', setLanguage: () => {} };
};
