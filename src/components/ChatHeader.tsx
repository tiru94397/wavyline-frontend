import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';

interface ChatHeaderProps {
  selectedUser: string | null;
  selectedUserName: string;
  currentUser: string;
  onBack: () => void;
  onShowSettings: () => void;
  onSearchClick: () => void;
}

export function ChatHeader({ 
  selectedUser, 
  selectedUserName, 
  currentUser, 
  onBack, 
  onShowSettings,
  onSearchClick 
}: ChatHeaderProps) {
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

  if (!selectedUser) {
    return null;
  }

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 bg-white/90 backdrop-blur-sm border-b border-blue-100 dark:bg-slate-800/90 dark:border-slate-700 flex items-center justify-between px-4 shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-950"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-3"
        >
          <Avatar className="h-10 w-10 shadow-sm">
            <AvatarFallback className={`${getAvatarColor(selectedUserName)} text-white font-semibold`}>
              {selectedUserName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserName}</h2>
            <p className="text-sm text-green-600 dark:text-green-400">Online</p>
          </div>
        </motion.div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-950"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-950"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-950"
        >
          <Video className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={onShowSettings}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-950"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </motion.header>
  );
}