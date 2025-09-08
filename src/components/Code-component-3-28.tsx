import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Smile, Heart, Zap, Star, Sun } from 'lucide-react';

interface AnimatedStickersProps {
  onStickerSelect: (sticker: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const stickerCategories = {
  emotions: [
    { emoji: '😀', animation: 'bounce' },
    { emoji: '😍', animation: 'pulse' },
    { emoji: '😂', animation: 'shake' },
    { emoji: '🥳', animation: 'spin' },
    { emoji: '😎', animation: 'slide' },
    { emoji: '🤔', animation: 'wiggle' },
    { emoji: '😴', animation: 'float' },
    { emoji: '🤗', animation: 'heartbeat' }
  ],
  reactions: [
    { emoji: '👍', animation: 'bounce' },
    { emoji: '👏', animation: 'shake' },
    { emoji: '🙌', animation: 'wave' },
    { emoji: '💪', animation: 'pulse' },
    { emoji: '✌️', animation: 'wiggle' },
    { emoji: '🤝', animation: 'slide' },
    { emoji: '👋', animation: 'wave' },
    { emoji: '🤟', animation: 'spin' }
  ],
  hearts: [
    { emoji: '❤️', animation: 'heartbeat' },
    { emoji: '💙', animation: 'pulse' },
    { emoji: '💚', animation: 'float' },
    { emoji: '💛', animation: 'bounce' },
    { emoji: '💜', animation: 'spin' },
    { emoji: '🖤', animation: 'slide' },
    { emoji: '🤍', animation: 'wiggle' },
    { emoji: '💖', animation: 'sparkle' }
  ],
  nature: [
    { emoji: '🌟', animation: 'sparkle' },
    { emoji: '⚡', animation: 'flash' },
    { emoji: '🔥', animation: 'flicker' },
    { emoji: '🌈', animation: 'rainbow' },
    { emoji: '☀️', animation: 'rotate' },
    { emoji: '🌙', animation: 'float' },
    { emoji: '✨', animation: 'twinkle' },
    { emoji: '💫', animation: 'orbit' }
  ]
};

const animations = {
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.6, repeat: Infinity }
  },
  pulse: {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 1, repeat: Infinity }
  },
  shake: {
    animate: { x: [0, -2, 2, -2, 2, 0] },
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 2, repeat: Infinity, ease: "linear" }
  },
  slide: {
    animate: { x: [0, 5, 0] },
    transition: { duration: 1.5, repeat: Infinity }
  },
  wiggle: {
    animate: { rotate: [-5, 5, -5] },
    transition: { duration: 0.5, repeat: Infinity }
  },
  float: {
    animate: { y: [0, -5, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  heartbeat: {
    animate: { scale: [1, 1.1, 1, 1.1, 1] },
    transition: { duration: 1.5, repeat: Infinity }
  },
  wave: {
    animate: { rotate: [0, 20, -20, 0] },
    transition: { duration: 0.8, repeat: Infinity }
  },
  sparkle: {
    animate: { 
      scale: [1, 1.3, 1],
      rotate: [0, 180, 360]
    },
    transition: { duration: 1.5, repeat: Infinity }
  },
  flash: {
    animate: { opacity: [1, 0.3, 1] },
    transition: { duration: 0.3, repeat: Infinity, repeatDelay: 1 }
  },
  flicker: {
    animate: { opacity: [1, 0.8, 1, 0.9, 1] },
    transition: { duration: 0.8, repeat: Infinity }
  },
  rainbow: {
    animate: { 
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(60deg)',
        'hue-rotate(120deg)',
        'hue-rotate(180deg)',
        'hue-rotate(240deg)',
        'hue-rotate(300deg)',
        'hue-rotate(360deg)'
      ]
    },
    transition: { duration: 2, repeat: Infinity }
  },
  rotate: {
    animate: { rotate: 360 },
    transition: { duration: 3, repeat: Infinity, ease: "linear" }
  },
  twinkle: {
    animate: { 
      opacity: [1, 0.3, 1],
      scale: [1, 0.8, 1]
    },
    transition: { duration: 1, repeat: Infinity }
  },
  orbit: {
    animate: { 
      rotate: 360,
      scale: [1, 1.1, 1]
    },
    transition: { duration: 2, repeat: Infinity }
  }
};

export function AnimatedStickers({ onStickerSelect, isOpen, onClose }: AnimatedStickersProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof stickerCategories>('emotions');

  const categoryIcons = {
    emotions: Smile,
    reactions: Star,
    hearts: Heart,
    nature: Sun
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category as keyof typeof stickerCategories)}
              className="flex-1 rounded-none h-10"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Stickers Grid */}
        <ScrollArea className="h-48 p-3">
          <div className="grid grid-cols-4 gap-3">
            {stickerCategories[selectedCategory].map((sticker, index) => (
              <motion.button
                key={`${sticker.emoji}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onStickerSelect(sticker.emoji);
                  onClose();
                }}
                className="relative p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
              >
                <motion.span
                  className="text-2xl block"
                  {...animations[sticker.animation]}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {sticker.emoji}
                </motion.span>
                
                {/* Hover Effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none"
                />
              </motion.button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {selectedCategory} • Tap to send
            </span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 px-2 text-xs">
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}