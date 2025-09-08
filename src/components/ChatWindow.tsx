import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  currentUser: string;
  selectedUser: string | null;
  selectedUserName: string;
}

export function ChatWindow({ messages, currentUser, selectedUser, selectedUserName }: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-blue-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-sky-500',
      'bg-teal-500',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🌊</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome to WaveLine</h3>
          <p className="text-slate-500">Your messages will appear here</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex items-end space-x-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex items-end">
                      {showAvatar && (
                        <Avatar className="h-8 w-8 shadow-sm">
                          <AvatarFallback className={`${getAvatarColor(message.senderName)} text-white text-xs`}>
                            {message.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'order-first' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-white text-slate-800 rounded-bl-md border border-blue-100'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </motion.div>
                    <p className={`text-xs text-slate-500 mt-1 px-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {isCurrentUser && (
                    <div className="w-8 h-8 flex items-end">
                      {showAvatar && (
                        <Avatar className="h-8 w-8 shadow-sm">
                          <AvatarFallback className={`${getAvatarColor(currentUser)} text-white text-xs`}>
                            {currentUser.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}