"use client";

import AdminLayout from '@/components/AdminLayout';
import { useState } from 'react';

const MOCK_CHATS = [
  { id: '1', user: 'John Doe', lastMsg: "Le carton arrived wet, check video", time: '10:45', unread: true, role: 'Buyer' },
  { id: '2', user: 'Agent #04 (Lagos)', lastMsg: "Inspection TL-29381 completed", time: '09:30', unread: false, role: 'Agent' },
  { id: '3', user: 'Ade J.', lastMsg: "When is my refund coming?", time: 'Hier', unread: false, role: 'Buyer' },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
        {/* Chats Sidebar */}
        <div className="w-80 border-r border-border flex flex-col bg-gray-50/30">
          <div className="p-6 border-b border-border bg-white">
            <h2 className="text-xl font-bold tracking-tight">Messagerie Hub</h2>
            <div className="mt-4 relative">
              <input type="text" placeholder="Rechercher..." className="w-full bg-gray-100 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_CHATS.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`p-5 cursor-pointer border-b border-border transition-all flex items-start gap-3 ${activeChat.id === chat.id ? 'bg-white shadow-inner border-l-4 border-l-accent' : 'hover:bg-white/50'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${chat.role === 'Agent' ? 'bg-primary' : 'bg-accent'}`}>
                  {chat.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-sm font-bold truncate ${activeChat.id === chat.id ? 'text-primary' : 'text-foreground'}`}>{chat.user}</p>
                    <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium">{chat.lastMsg}</p>
                </div>
                {chat.unread && <div className="w-2 h-2 bg-accent rounded-full mt-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md ${activeChat.role === 'Agent' ? 'bg-primary' : 'bg-accent'}`}>
                  {activeChat.user.charAt(0)}
                </div>
                <div>
                   <h3 className="font-bold text-foreground">{activeChat.user}</h3>
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">{activeChat.role} • En ligne</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-gray-50/20">
             <div className="flex justify-center">
                <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Aujourd'hui</span>
             </div>

             <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-xs">J</div>
                <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                   <p className="text-sm font-medium text-foreground leading-relaxed">Bonjour support. J'ai reçu mon colis ce matin à Cotonou, mais il y a un problème. Le carton est tout mouillé.</p>
                   <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">10:42</p>
                </div>
             </div>

             <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-xs">J</div>
                <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                   <p className="text-sm font-medium text-foreground leading-relaxed">Regardez ma vidéo d'ouverture que j'ai postée dans le litige.</p>
                   <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">10:43</p>
                </div>
             </div>

             <div className="flex flex-row-reverse items-start gap-3 max-w-[80%] ml-auto">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-xs">A</div>
                <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-primary/20">
                   <p className="text-sm font-medium leading-relaxed">Bonjour John. Nous avons bien reçu votre signalement. Nous comparons actuellement votre vidéo avec celle de notre agent à Lagos.</p>
                   <p className="text-[10px] text-white/60 mt-2 font-bold uppercase tracking-tighter">10:45</p>
                </div>
             </div>
          </div>

          {/* Footer Input */}
          <div className="p-6 border-t border-border flex items-center gap-4">
             <button className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
             </button>
             <div className="flex-1 relative">
                <input type="text" placeholder="Écrire un message..." className="w-full bg-gray-50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
             </div>
             <button className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all hover:-translate-y-1">
                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
             </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
