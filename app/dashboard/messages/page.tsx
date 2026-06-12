'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Send, MoreHorizontal,
  Clock, CheckCheck, Star, Archive, Trash2, Ban,
  User, ChevronLeft, Paperclip, Image, Smile
} from 'lucide-react';

const mockConversations = [
  { id: '1', username: 'premium_fan', lastMessage: 'Love your exclusive content!', time: 'Hace 2m', unread: 3, avatar: null, isStarred: true },
  { id: '2', username: 'vip_subscriber', lastMessage: 'Can you make more tutorials?', time: 'Hace 15m', unread: 0, avatar: null, isStarred: false },
  { id: '3', username: 'music_lover99', lastMessage: 'Thanks for the quick response!', time: 'Hace 1h', unread: 1, avatar: null, isStarred: false },
  { id: '4', username: 'art_enthusiast', lastMessage: 'Your art is amazing', time: 'Hace 3h', unread: 0, avatar: null, isStarred: true },
  { id: '5', username: 'chill_viewer', lastMessage: 'hey there', time: 'Hace 1d', unread: 0, avatar: null, isStarred: false },
];

const mockRequests = [
  { id: '6', username: 'new_fan_2024', message: 'Hi! I would like to connect with you', time: 'Hace 30m', avatar: null },
  { id: '7', username: 'curious_user', message: 'Hello, saw your profile and loved it', time: 'Hace 2h', avatar: null },
];

const mockBlocked = [
  { id: '8', username: 'spam_account', reason: 'Contenido inapropiado', blockedAt: '2024-01-10' },
];

const mockMessages = [
  { id: 1, sender: 'them', content: 'Hey! Big fan of your work', time: '10:30 AM' },
  { id: 2, sender: 'me', content: 'Thank you so much! Glad you like it', time: '10:32 AM' },
  { id: 3, sender: 'them', content: 'Love your exclusive content!', time: '10:45 AM' },
  { id: 4, sender: 'them', content: 'Do you have any tips for beginners?', time: '10:46 AM' },
];

type Tab = 'inbox' | 'requests' | 'archived' | 'blocked';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'inbox', label: 'Bandeja', count: mockConversations.filter((c) => c.unread > 0).length },
    { id: 'requests', label: 'Solicitudes', count: mockRequests.length },
    { id: 'archived', label: 'Archivados' },
    { id: 'blocked', label: 'Bloqueados' },
  ];

  const filteredConversations = mockConversations.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Mensajes</h1>
            <p className="text-gray-400 text-sm mt-1">Comunica con tu comunidad</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-pink-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 border-r border-white/5`}>
          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'inbox' && (
                <motion.div
                  key="inbox"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-white/[0.03]"
                >
                  {filteredConversations.map((conv, i) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors ${
                        selectedConversation === conv.id ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold">
                          {conv.username[0].toUpperCase()}
                        </div>
                        {conv.unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white font-medium text-sm flex items-center gap-1">
                            @{conv.username}
                            {conv.isStarred && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                          </span>
                          <span className="text-gray-500 text-xs">{conv.time}</span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{conv.lastMessage}</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {activeTab === 'requests' && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-white/[0.03]"
                >
                  {mockRequests.map((req, i) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-white font-bold">
                        {req.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">@{req.username}</p>
                        <p className="text-gray-400 text-sm truncate">{req.message}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{req.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-xs font-medium">
                          Aceptar
                        </button>
                        <button className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                          Ignorar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'blocked' && (
                <motion.div
                  key="blocked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-white/[0.03]"
                >
                  {mockBlocked.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">@{user.username}</p>
                        <p className="text-gray-400 text-xs">{user.reason}</p>
                        <p className="text-gray-500 text-xs">Bloqueado: {user.blockedAt}</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                        Desbloquear
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'archived' && (
                <motion.div
                  key="archived"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <Archive size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">No hay conversaciones archivadas</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat View */}
        <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-[#0a0a12]`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-sm">
                  {mockConversations.find((c) => c.id === selectedConversation)?.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    @{mockConversations.find((c) => c.id === selectedConversation)?.username}
                  </p>
                  <p className="text-emerald-400 text-xs">En linea</p>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Star size={18} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        msg.sender === 'me'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md'
                          : 'bg-white/10 text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'}`}>
                        {msg.time}
                        {msg.sender === 'me' && <CheckCheck size={12} className="inline ml-1" />}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Image size={18} />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <Smile size={18} />
                    </button>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 transition-opacity">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-pink-400" />
                </div>
                <p className="text-white font-medium mb-1">Selecciona una conversacion</p>
                <p className="text-gray-500 text-sm">Elige una conversacion de la lista para empezar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
