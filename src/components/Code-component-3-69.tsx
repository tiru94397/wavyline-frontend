import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Smile, Mic, Image, Paperclip, Zap, Sticker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceMessage } from './VoiceMessage';
import { AnimatedStickers } from './AnimatedStickers';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'voice' | 'file' | 'image' | 'sticker', extra?: any) => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
  onFileUpload?: () => void;
  onToggleQuickReplies?: () => void;
  onStickerSelect?: (sticker: string) => void;
}

export function EnhancedMessageInput({ 
  onSendMessage, 
  disabled, 
  onTyping, 
  onFileUpload,
  onToggleQuickReplies,
  onStickerSelect 
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    const typing = value.length > 0;
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping?.(typing);
    }
  };

  const handleVoiceMessage = (duration: number, waveform: number[]) => {
    onSendMessage('Voice message', 'voice', { duration, waveform });
    setShowVoiceMessage(false);
  };

  const handleStickerSelect = (sticker: string) => {
    onSendMessage(sticker, 'sticker');
    onStickerSelect?.(sticker);
    setShowStickers(false);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showVoiceMessage && (
          <VoiceMessage
            onSendVoiceMessage={handleVoiceMessage}
            onCancel={() => setShowVoiceMessage(false)}
          />
        )}
      </AnimatePresence>

      <AnimatedStickers
        onStickerSelect={handleStickerSelect}
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white/80 backdrop-blur-sm border-t border-blue-100 dark:bg-slate-800/80 dark:border-slate-700"
      >
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onFileUpload}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950 shrink-0"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onFileUpload}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950 shrink-0"
              >
                <Image className="h-5 w-5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowStickers(!showStickers)}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950 shrink-0"
              >
                <Sticker className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950 z-10"
              >
                <Smile className="h-5 w-5" />
              </Button>
              
              <Input
                value={message}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? "Select a user to start chatting..." : "Type a message..."}
                disabled={disabled}
                className="pl-12 pr-24 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 dark:border-slate-600 dark:focus:border-blue-500"
              />
              
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onToggleQuickReplies}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </motion.div>

                {!message.trim() && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowVoiceMessage(true)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!message.trim() || disabled}
                    className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md dark:from-blue-600 dark:to-cyan-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}