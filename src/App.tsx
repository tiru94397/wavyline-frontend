import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { LoginSignup } from './components/LoginSignup';
import { ChatLayout } from './components/ChatLayout';
import { Sparkles, User } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowDemoMode(false);
  };

  const startDemo = () => {
    setCurrentUser('DemoUser');
    setShowDemoMode(true);
  };

  return (
    <div className="size-full">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <LoginSignup onLogin={handleLogin} />
            
            {/* Demo Mode Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <Button
                onClick={startDemo}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Demo Mode
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatLayout 
              currentUser={currentUser} 
              onLogout={handleLogout}
              isDemoMode={showDemoMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Showcase Notification */}
      {showDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Demo Mode: Try swiping, long press, voice messages & more!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
