'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, CheckCheck } from 'lucide-react';

export default function Messages({ chats, activeChat, onSendMessage, onSelectChat }) {
  const [text, setText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const currentChat = chats.find(c => c.id === activeChat);

  // --- TYPING INDICATOR SIMULATION ---
  useEffect(() => {
    if (activeChat) {
        setIsOtherTyping(true);
        const timer = setTimeout(() => setIsOtherTyping(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [activeChat]);

  // --- AUTO-SCROLL LOGIC ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // --- SOUND LOGIC (Simulated with AudioContext) ---
  const playSendSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported or blocked");
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(activeChat, text);
    playSendSound(); // Play the "pop" sound
    setText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-50 dark:border-slate-800 p-4 overflow-y-auto bg-gray-50/20 dark:bg-slate-950/20">
          <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 px-2 tracking-[0.2em]">Your Inbox</h3>
          <div className="space-y-2">
            {chats.map(chat => (
              <button key={chat.id} onClick={() => onSelectChat(chat.id)} className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${activeChat === chat.id ? 'bg-white shadow-md' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                <div className={`w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold overflow-hidden shadow-inner`}>
                  {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover" /> : chat.name[0]}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="font-bold text-xs truncate text-gray-900 dark:text-slate-100 uppercase tracking-tight">{chat.name}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">{chat.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {currentChat ? (
            <>
              <div className="p-5 border-b border-gray-50 dark:border-slate-800 flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-100 overflow-hidden">
                    {currentChat.avatar ? <img src={currentChat.avatar} className="w-full h-full object-cover" /> : currentChat.name[0]}
                 </div>
                 <div>
                    <p className="font-black text-xs text-gray-900 dark:text-slate-100 uppercase tracking-widest">{currentChat.name}</p>
                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">Connected</p>
                 </div>
              </div>

              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#FBFBFE] dark:bg-slate-950/50">
                {currentChat.messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-3xl text-xs leading-relaxed font-medium shadow-sm ${m.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-tl-none text-gray-700 dark:text-slate-200'}`}>
                      {m.text}
                    </div>
                    {m.sender === 'me' && (
                        <div className="flex items-center mt-1 pr-1 space-x-1">
                            <span className="text-[8px] text-gray-400 font-bold uppercase">Seen</span>
                            <CheckCheck size={12} className="text-blue-500" />
                        </div>
                    )}
                  </div>
                ))}

                {isOtherTyping && (
                    <div className="flex justify-start animate-slide-down">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            <span className="text-[10px] text-gray-400 font-bold ml-2">Neighbor is typing...</span>
                        </div>
                    </div>
                )}

                {/* Scroll Target */}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 flex space-x-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-5 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-50 dark:text-slate-200 transition-all"
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all active:scale-95"
                >
                  <Send size={18}/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700 space-y-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
                    <User size={32} />
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.3em]">Choose a neighbor to chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
