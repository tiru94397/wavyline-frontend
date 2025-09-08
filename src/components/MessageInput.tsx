import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white/80 backdrop-blur-sm border-t border-blue-100"
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 shrink-0"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Select a user to start chatting..." : "Type a message..."}
              disabled={disabled}
              className="pr-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm"
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || disabled}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}