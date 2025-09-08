import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface TypingIndicatorProps {
  username: string;
  isVisible: boolean;
}

export function TypingIndicator({ username, isVisible }: TypingIndicatorProps) {
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

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-end space-x-2 justify-start mb-4"
    >
      <div className="w-8 h-8 flex items-end">
        <Avatar className="h-8 w-8 shadow-sm">
          <AvatarFallback className={`${getAvatarColor(username)} text-white text-xs`}>
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="bg-white text-slate-800 rounded-2xl rounded-bl-md border border-blue-100 px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-slate-600">{username} is typing</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-blue-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}