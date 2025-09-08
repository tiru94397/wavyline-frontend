import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
  avatar?: string;
}

interface UserSidebarProps {
  users: User[];
  currentUser: string;
  selectedUser: string | null;
  onSelectUser: (userId: string) => void;
  isOpen: boolean;
}

export function UserSidebar({ users, currentUser, selectedUser, onSelectUser, isOpen }: UserSidebarProps) {
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

  const filteredUsers = users.filter(user => user.username !== currentUser);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ 
        x: isOpen ? 0 : -300,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-xl border-r border-blue-100 z-40 md:relative md:translate-x-0 md:opacity-100"
    >
      <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Online Users</h2>
        <p className="text-sm text-slate-600">{filteredUsers.filter(u => u.isOnline).length} active</p>
      </div>
      
      <ScrollArea className="h-full pb-20">
        <div className="p-4 space-y-2">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => onSelectUser(user.id)}
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedUser === user.id
                  ? 'bg-gradient-to-r from-blue-100 to-cyan-100 shadow-md'
                  : 'hover:bg-blue-50'
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 shadow-md">
                  <AvatarFallback className={`${getAvatarColor(user.username)} text-white font-semibold`}>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-slate-800 truncate">{user.username}</p>
                  {user.isOnline && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0">
                      Online
                    </Badge>
                  )}
                </div>
                {!user.isOnline && user.lastSeen && (
                  <p className="text-xs text-slate-500">{user.lastSeen}</p>
                )}
              </div>
            </motion.div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">🌊</div>
              <p className="text-slate-500">No other users online</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}