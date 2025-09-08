import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock, Send, X } from 'lucide-react';

interface MessageSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (content: string, scheduledTime: Date) => void;
  prefillMessage?: string;
}

export function MessageScheduler({ isOpen, onClose, onSchedule, prefillMessage = '' }: MessageSchedulerProps) {
  const [message, setMessage] = useState(prefillMessage);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [quickSchedule, setQuickSchedule] = useState<string | null>(null);

  const quickScheduleOptions = [
    { label: 'In 1 hour', value: '1hour', minutes: 60 },
    { label: 'In 3 hours', value: '3hours', minutes: 180 },
    { label: 'Tomorrow 9 AM', value: 'tomorrow9', custom: true },
    { label: 'Next Monday', value: 'nextmonday', custom: true },
  ];

  const getQuickScheduleTime = (option: string) => {
    const now = new Date();
    
    switch (option) {
      case '1hour':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '3hours':
        return new Date(now.getTime() + 3 * 60 * 60 * 1000);
      case 'tomorrow9':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      case 'nextmonday':
        const nextMonday = new Date(now);
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;
      default:
        return now;
    }
  };

  const handleSchedule = () => {
    if (!message.trim()) return;

    let scheduledTime: Date;

    if (quickSchedule) {
      scheduledTime = getQuickScheduleTime(quickSchedule);
    } else if (selectedDate && selectedTime) {
      scheduledTime = new Date(`${selectedDate}T${selectedTime}`);
    } else {
      return;
    }

    onSchedule(message.trim(), scheduledTime);
    handleClose();
  };

  const handleClose = () => {
    setMessage(prefillMessage);
    setSelectedDate('');
    setSelectedTime('');
    setQuickSchedule(null);
    onClose();
  };

  const formatScheduledTime = () => {
    if (quickSchedule) {
      const time = getQuickScheduleTime(quickSchedule);
      return time.toLocaleString();
    } else if (selectedDate && selectedTime) {
      const time = new Date(`${selectedDate}T${selectedTime}`);
      return time.toLocaleString();
    }
    return '';
  };

  const isValidSchedule = () => {
    if (quickSchedule) return true;
    if (selectedDate && selectedTime) {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`);
      return scheduledTime > new Date();
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Schedule Message
                </h3>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="scheduled-message">Message</Label>
              <textarea
                id="scheduled-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 resize-none h-20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            {/* Quick Schedule Options */}
            <div className="space-y-2">
              <Label>Quick Schedule</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickScheduleOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={quickSchedule === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setQuickSchedule(option.value);
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date/Time */}
            <div className="space-y-2">
              <Label>Or pick custom date & time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setQuickSchedule(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      setQuickSchedule(null);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Scheduled Time Preview */}
            {(quickSchedule || (selectedDate && selectedTime)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Scheduled for: {formatScheduledTime()}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!message.trim() || !isValidSchedule()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Send className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}