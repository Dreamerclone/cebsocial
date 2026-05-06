'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSocialData } from '../hooks/useSocialData';
import { translations } from '../lib/translations';

const SocialContext = createContext();

export function SocialProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [language, setLanguage] = useState('en');

  const t = useMemo(() => translations[language], [language]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const socialData = useSocialData(addToast);

  const value = {
    ...socialData,
    addToast,
    toasts,
    removeToast,
    language,
    setLanguage,
    t
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
