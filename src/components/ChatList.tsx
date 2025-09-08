import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Search, Plus } from 'lucide-react';

interface ChatPreview {
  id: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatListProps {
  currentUser: string;
  onStartChat: (username: string) => void;
  onLogout: () => void;
}

export function ChatList({ currentUser, onStartChat, onLogout }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // Mock recent chats
  const recentChats: ChatPreview[] = [
    {
      id: '1',
      username: 'Alice',
      lastMessage: 'That sounds exciting! What kind of features?',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      username: 'Bob',
      lastMessage: 'Sure, I\'ll send you the files shortly',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: true
    },
    {
      id: '3',
      username: 'Charlie',
      lastMessage: 'Thanks for your help with the project!',
      timestamp: 'Yesterday',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '4',
      username: 'Diana',
      lastMessage: 'Let\'s catch up soon 😊',
      timestamp: '2 days ago',
      unreadCount: 1,
      isOnline: true
    }
  ];

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

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newUsername.trim() !== currentUser) {
      onStartChat(newUsername.trim());
      setNewUsername('');
      setShowNewChat(false);
    }
  };

  const filteredChats = recentChats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌊</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              WaveLine
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Welcome, {currentUser}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-slate-600 hover:text-blue-600"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Search and New Chat */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>

          {showNewChat ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleStartNewChat}
              className="flex space-x-2"
            >
              <Input
                type="text"
                placeholder="Enter username to chat with..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                autoFocus
              />
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                Start
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewChat(false);
                  setNewUsername('');
                }}
              >
                Cancel
              </Button>
            </motion.form>
          ) : (
            <Button
              onClick={() => setShowNewChat(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onStartChat(chat.username)}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-white/90 border border-blue-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 shadow-sm">
                      <AvatarFallback className={`${getAvatarColor(chat.username)} text-white font-semibold`}>
                        {chat.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 truncate">{chat.username}</h3>
                      <span className="text-xs text-slate-500">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 shrink-0">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No chats found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation!'}
              </p>
              {!searchQuery && !showNewChat && (
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Chat
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
