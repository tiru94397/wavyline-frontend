import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Smile, Plus } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  currentUser: string;
  showPicker?: boolean;
}

const quickEmojis = ['😀', '😍', '😂', '😢', '😮', '😡', '👍', '👎', '❤️', '🔥'];

export function MessageReactions({ 
  messageId, 
  reactions, 
  onAddReaction, 
  currentUser,
  showPicker = false 
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onAddReaction(messageId, emoji);
    setShowEmojiPicker(false);
  };

  const hasReactions = reactions.length > 0;

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {hasReactions && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap gap-1 mt-1"
        >
          {reactions.map((reaction, index) => (
            <motion.button
              key={`${reaction.emoji}-${index}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(reaction.emoji)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border transition-all ${
                reaction.hasReacted
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Add Reaction Button */}
      {showPicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
          >
            <Smile className="h-3 w-3 mr-1" />
            React
          </Button>
        </motion.div>
      )}

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50"
          >
            <div className="grid grid-cols-5 gap-2">
              {quickEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}