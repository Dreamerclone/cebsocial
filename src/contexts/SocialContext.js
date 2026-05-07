'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSocialData } from '../hooks/useSocialData';
import { translations } from '../lib/translations';

const SocialContext = createContext();

export function SocialProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [language, setLanguage] = useState('en');

  // UI States shared across routes
  const [activeFilter, setActiveFilter] = useState('All City');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewingNeighbor, setViewingNeighbor] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState([]);

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
    allUsers: socialData.allUsers || [],
    addToast,
    toasts,
    removeToast,
    language,
    setLanguage,
    t,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    markMessagesAsRead: socialData.markMessagesAsRead,
    // Modal states & setters
    selectedImage, setSelectedImage,
    viewingNeighbor, setViewingNeighbor,
    viewingShop, setViewingShop,
    editingItem, setEditingItem,
    isCreatingGroup, setIsCreatingGroup,
    showMemberModal, setShowMemberModal,
    currentGroupMembers, setCurrentGroupMembers
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
