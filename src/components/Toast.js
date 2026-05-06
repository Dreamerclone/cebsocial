'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-600 text-white',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-3 px-6 py-4 rounded-[2rem] shadow-2xl animate-bounce-in ${styles[type]}`}>
      <span className="animate-pulse">{icons[type]}</span>
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}
