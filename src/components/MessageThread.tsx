import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageSquare, Send, X, ArrowUpRight } from 'lucide-react';

interface Reply {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  replies?: Reply[];
}

interface MessageThreadProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (messageId: string, content: string) => void;
  currentUser: string;
}

export function MessageThread({ message, isOpen, onClose, onSendReply, currentUser }: MessageThreadProps) {
  const [replyText, setReplyText] = useState('');

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

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && message) {
      onSendReply(message.id, replyText.trim());
      setReplyText('');
    }
  };

  const handleClose = () => {
    setReplyText('');
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, x: 300 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.9, opacity: 0, x: 300 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Thread</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Original Message */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarFallback className={`${getAvatarColor(message.senderName)} text-white text-xs`}>
                {message.senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {message.senderId === currentUser ? 'You' : message.senderName}
                </span>
                <span className="text-xs text-slate-500">
                  {formatTime(message.timestamp)}
                </span>
                <ArrowUpRight className="h-3 w-3 text-blue-500" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {message.content}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {message.replies && message.replies.length > 0 ? (
              message.replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <Avatar className="h-7 w-7 shadow-sm">
                    <AvatarFallback className={`${getAvatarColor(reply.senderName)} text-white text-xs`}>
                      {reply.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {reply.senderId === currentUser ? 'You' : reply.senderName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(reply.timestamp)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-lg rounded-tl-sm p-3 shadow-sm border border-slate-200 dark:border-slate-600">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No replies yet</p>
                <p className="text-slate-400 text-sm mt-1">Start the conversation below</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Reply Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSendReply} className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to this message..."
                className="pr-10"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!replyText.trim()}
              className="px-3 bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}