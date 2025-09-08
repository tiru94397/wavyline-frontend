import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Forward, X, Search, Send } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  lastSeen: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type?: string;
}

interface MessageForwardingProps {
  message: Message | null;
  contacts: Contact[];
  isOpen: boolean;
  onClose: () => void;
  onForward: (messageId: string, contactIds: string[]) => void;
}

export function MessageForwarding({ message, contacts, isOpen, onClose, onForward }: MessageForwardingProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleForward = () => {
    if (message && selectedContacts.length > 0) {
      onForward(message.id, selectedContacts);
      setSelectedContacts([]);
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedContacts([]);
    setSearchQuery('');
    onClose();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-sky-500', 'bg-teal-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (!isOpen || !message) return null;

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
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Forward className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Forward Message
                </h3>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Message Preview */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  From: {message.senderName}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                {message.content}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact.id);
                return (
                  <motion.div
                    key={contact.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleContact(contact.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${getAvatarColor(contact.name)} text-white`}>
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        {contact.name}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {contact.isOnline ? 'Online' : contact.lastSeen}
                      </p>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {selectedContacts.length > 0 && (
              <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Forward to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleForward}
                disabled={selectedContacts.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Send className="h-4 w-4 mr-2" />
                Forward
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}