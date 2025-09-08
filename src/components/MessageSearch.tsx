import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Search, X, Calendar, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice';
}

interface MessageSearchProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
  currentUser: string;
}

export function MessageSearch({ messages, isOpen, onClose, onMessageSelect, currentUser }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages([]);
      return;
    }

    const filtered = messages.filter(message => {
      const matchesQuery = message.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        selectedFilter === 'all' ||
        (selectedFilter === 'sent' && message.senderId === currentUser) ||
        (selectedFilter === 'received' && message.senderId !== currentUser);
      
      return matchesQuery && matchesFilter && message.type !== 'voice';
    });

    setFilteredMessages(filtered.slice(-50)); // Limit to last 50 matches
  }, [searchQuery, selectedFilter, messages, currentUser]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Messages
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in messages..."
                className="pl-10"
                autoFocus
              />
            </div>
            
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', icon: Calendar },
                { key: 'sent', label: 'Sent', icon: User },
                { key: 'received', label: 'Received', icon: User }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(key as any)}
                  className="text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 p-4">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Type to search through your messages</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No messages found</p>
              <p className="text-slate-400 text-sm mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500 mb-4">
                Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </p>
              
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onMessageSelect(message.id)}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {message.senderId === currentUser ? 'You' : message.senderName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {highlightMatch(message.content, searchQuery)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}