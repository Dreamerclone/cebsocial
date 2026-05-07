'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSocial } from '../../contexts/SocialContext';
import Messages from '../../components/Messages';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';

function MessagesContent() {
  const { chats, allUsers, handleSendMessage, addToast, markMessagesAsRead } = useSocial();
  const searchParams = useSearchParams();
  const chatUserId = searchParams.get('chat');

  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (activeChat) {
      markMessagesAsRead(activeChat);
    }
  }, [activeChat, chats.find(c => c.id === activeChat)?.hasUnread]);

  const activeChatProfile = useMemo(() => {
    if (!chatUserId) return null;
    const found = allUsers?.find(u => u.id === chatUserId);
    if (!found) return null;
    return {
        id: found.id,
        name: found.full_name,
        avatar: found.avatar_url,
        neighborhood: found.neighborhood,
        karma: found.karma
    };
  }, [chatUserId, allUsers]);

  useEffect(() => {
    if (chatUserId) {
        setActiveChat(chatUserId);
    }
  }, [chatUserId]);

  return (
    <div className="h-[calc(100vh-144px)] md:h-[calc(100vh-64px)] animate-slide-up overflow-hidden">
      <Messages
          chats={chats}
          activeChat={activeChat}
          activeChatProfile={activeChatProfile}
          onSendMessage={handleSendMessage}
          onSelectChat={setActiveChat}
          addToast={addToast}
          markMessagesAsRead={markMessagesAsRead}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="h-[600px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 font-black uppercase text-gray-400">Loading Inbox...</div>}>
        <MessagesContent />
      </Suspense>
    </DashboardShell>
  );
}
