'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSocial } from '../../contexts/SocialContext';
import Messages from '../../components/Messages';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';

function MessagesContent() {
  const { chats, handleSendMessage } = useSocial();
  const searchParams = useSearchParams();
  const chatUserId = searchParams.get('chat');

  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (chatUserId) {
        setActiveChat(chatUserId);
    }
  }, [chatUserId]);

  return (
    <div className="h-[700px] md:h-[calc(100vh-140px)] min-h-[600px] animate-slide-up">
      <Messages
          chats={chats}
          activeChat={activeChat}
          onSendMessage={handleSendMessage}
          onSelectChat={setActiveChat}
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
