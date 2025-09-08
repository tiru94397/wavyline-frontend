import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'motion/react';
import { Reply, Forward, Pin, Trash2 } from 'lucide-react';

interface GestureControlsProps {
  children: React.ReactNode;
  messageId: string;
  onSwipeReply?: (messageId: string) => void;
  onSwipeForward?: (messageId: string) => void;
  onLongPressPin?: (messageId: string) => void;
  onLongPressDelete?: (messageId: string) => void;
  isOwnMessage?: boolean;
  disabled?: boolean;
}

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  threshold: number;
  action: () => void;
}

export function GestureControls({
  children,
  messageId,
  onSwipeReply,
  onSwipeForward,
  onLongPressPin,
  onLongPressDelete,
  isOwnMessage = false,
  disabled = false
}: GestureControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  
  const controls = useAnimation();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartTime = useRef<number>(0);

  const leftActions: SwipeAction[] = [
    {
      icon: Reply,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      threshold: 80,
      action: () => onSwipeReply?.(messageId)
    }
  ];

  const rightActions: SwipeAction[] = [
    {
      icon: Forward,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      threshold: 80,
      action: () => onSwipeForward?.(messageId)
    },
    ...(isOwnMessage ? [{
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      threshold: 120,
      action: () => onLongPressDelete?.(messageId)
    }] : [])
  ];

  const handlePanStart = () => {
    if (disabled) return;
    setIsDragging(true);
    dragStartTime.current = Date.now();
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    setDragDirection(null);
    
    const dragDistance = Math.abs(info.offset.x);
    const dragTime = Date.now() - dragStartTime.current;
    
    // Determine which action to trigger based on drag distance and direction
    if (info.offset.x > 0) {
      // Swiped right
      const action = leftActions.find(a => dragDistance >= a.threshold);
      if (action) {
        action.action();
      }
    } else if (info.offset.x < 0) {
      // Swiped left
      const action = rightActions.find(a => dragDistance >= a.threshold);
      if (action) {
        action.action();
      }
    }

    // Reset position
    await controls.start({
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    const dragDistance = Math.abs(info.offset.x);
    const maxDrag = 150;
    const clampedX = Math.max(-maxDrag, Math.min(maxDrag, info.offset.x));
    
    // Determine direction
    if (info.offset.x > 10) {
      setDragDirection('right');
    } else if (info.offset.x < -10) {
      setDragDirection('left');
    }

    controls.set({ x: clampedX });
  };

  const handleLongPressStart = () => {
    if (disabled) return;
    
    setLongPressTriggered(false);
    longPressTimer.current = setTimeout(() => {
      setLongPressTriggered(true);
      setShowActions(true);
      onLongPressPin?.(messageId);
      
      // Hide actions after 3 seconds
      setTimeout(() => setShowActions(false), 3000);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const getSwipeIcon = (direction: 'left' | 'right', dragDistance: number) => {
    const actions = direction === 'right' ? leftActions : rightActions;
    const action = actions.find(a => dragDistance >= a.threshold) || actions[0];
    
    if (!action) return null;

    const Icon = action.icon;
    const opacity = Math.min(dragDistance / action.threshold, 1);
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: dragDistance >= action.threshold ? 1.2 : 1,
          opacity: opacity * 0.8
        }}
        className={`w-8 h-8 rounded-full ${action.bgColor} flex items-center justify-center`}
      >
        <Icon className={`h-4 w-4 ${action.color}`} />
      </motion.div>
    );
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Actions Background */}
      {isDragging && dragDirection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-between px-4 z-0"
        >
          {dragDirection === 'right' && (
            <div className="flex items-center space-x-2">
              {getSwipeIcon('right', Math.abs(controls.get().x || 0))}
            </div>
          )}
          
          {dragDirection === 'left' && (
            <div className="flex items-center space-x-2 ml-auto">
              {getSwipeIcon('left', Math.abs(controls.get().x || 0))}
            </div>
          )}
        </motion.div>
      )}

      {/* Long Press Actions */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-0 right-0 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-50 p-2"
        >
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                onLongPressPin?.(messageId);
                setShowActions(false);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors"
            >
              <Pin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
            {isOwnMessage && (
              <button
                onClick={() => {
                  onLongPressDelete?.(messageId);
                  setShowActions(false);
                }}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Message Content */}
      <motion.div
        animate={controls}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        className={`relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
          longPressTriggered ? 'select-none' : ''
        }`}
        style={{
          touchAction: 'pan-x'
        }}
      >
        {children}
      </motion.div>

      {/* Visual feedback for long press */}
      {longPressTriggered && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.02 }}
          className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none z-20"
        />
      )}
    </div>
  );
}