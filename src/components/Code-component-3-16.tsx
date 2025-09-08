import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';

interface QuickRepliesProps {
  onReplySelect: (reply: string) => void;
  isVisible: boolean;
}

const quickReplies = [
  { text: '👍', category: 'reaction' },
  { text: 'Thanks!', category: 'gratitude' },
  { text: 'Sure thing!', category: 'agreement' },
  { text: 'On my way!', category: 'status' },
  { text: 'Let me check', category: 'action' },
  { text: 'Sounds good 😊', category: 'agreement' },
  { text: 'Not right now', category: 'decline' },
  { text: 'Call you later', category: 'action' },
  { text: 'Perfect! ✨', category: 'agreement' },
  { text: 'Maybe tomorrow?', category: 'scheduling' },
  { text: 'Working on it', category: 'status' },
  { text: 'Almost done!', category: 'status' }
];

export function QuickReplies({ onReplySelect, isVisible }: QuickRepliesProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="px-4 pb-2"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Quick Replies</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <motion.div
              key={reply.text + index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReplySelect(reply.text)}
                className="h-8 px-3 text-xs bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-700/80 dark:hover:bg-slate-600 transition-all duration-200"
              >
                {reply.text}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}