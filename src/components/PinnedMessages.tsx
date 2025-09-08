import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Pin, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice';
  isPinned?: boolean;
}

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  onUnpinMessage: (messageId: string) => void;
  onMessageClick: (messageId: string) => void;
  currentUser: string;
}

export function PinnedMessages({ pinnedMessages, onUnpinMessage, onMessageClick, currentUser }: PinnedMessagesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (pinnedMessages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800"
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {pinnedMessages.length} Pinned Message{pinnedMessages.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-800"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ScrollArea className="max-h-40 mt-3">
                <div className="space-y-2">
                  {pinnedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors group"
                      onClick={() => onMessageClick(message.id)}
                    >
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className={`${getAvatarColor(message.senderName)} text-white text-xs`}>
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {message.senderId === currentUser ? 'You' : message.senderName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpinMessage(message.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-amber-600 hover:text-amber-700 hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-800 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}