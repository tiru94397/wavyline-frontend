import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";
import { ChatHeader } from "./ChatHeader";
import { ChatWindow } from "./ChatWindow";
import { EnhancedMessageInput } from "./EnhancedMessageInput";
import { ChatList } from "./ChatList";
import { MessageSearch } from "./MessageSearch";
import { FileUpload } from "./FileUpload";
import { PinnedMessages } from "./PinnedMessages";
import { MessageThread } from "./MessageThread";
import { QuickReplies } from "./QuickReplies";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface Reply {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type?: "text" | "voice" | "file" | "image" | "sticker";
  status?: "sent" | "delivered" | "read";
  reactions?: Reaction[];
  duration?: number;
  waveform?: number[];
  isPinned?: boolean;
  replies?: Reply[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface ChatLayoutProps {
  currentUser: string;
  onLogout: () => void;
}

export function ChatLayout({ currentUser, onLogout }: ChatLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);

  const [socket, setSocket] = useState<Socket | null>(null);

  // ------------------- SOCKET SETUP -------------------
  useEffect(() => {
    const s = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to socket server:", s.id);
    });

    s.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    s.on("chat-history", (history: Message[]) => {
      setMessages(history);
    });

    return () => {
      s.disconnect();
    };
  }, [currentUser]);

  // ------------------- JOIN ROOM -------------------
  useEffect(() => {
    if (selectedUser && socket) {
      socket.emit("join-room", { userId: currentUser, recipientId: selectedUser });
      socket.emit("get-history", { userId: currentUser, recipientId: selectedUser });
    }
  }, [selectedUser, socket, currentUser]);

  // ------------------- SEND MESSAGE -------------------
  const handleSendMessage = (
    content: string,
    type: "text" | "voice" | "file" | "image" | "sticker" = "text",
    extra?: any
  ) => {
    if (!selectedUser || !socket) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser,
      senderName: currentUser,
      content,
      timestamp: new Date(),
      type,
      status: "sent",
      reactions: [],
      replies: [],
      isPinned: false,
      ...(type === "voice" && extra && {
        duration: extra.duration,
        waveform: extra.waveform,
      }),
      ...(type === "file" && extra && {
        fileUrl: extra.fileUrl,
        fileName: extra.fileName,
        fileSize: extra.fileSize,
      }),
      ...(type === "image" && extra && {
        fileUrl: extra.fileUrl,
        fileName: extra.fileName,
        fileSize: extra.fileSize,
      }),
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("send-message", {
      ...newMessage,
      recipientId: selectedUser,
    });
  };

  // ------------------- OTHER HELPERS -------------------
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          const reactions = message.reactions || [];
          const existingReaction = reactions.find((r) => r.emoji === emoji);

          if (existingReaction) {
            if (existingReaction.hasReacted) {
              return {
                ...message,
                reactions: reactions
                  .map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          count: r.count - 1,
                          hasReacted: false,
                          users: r.users.filter((u) => u !== currentUser),
                        }
                      : r
                  )
                  .filter((r) => r.count > 0),
              };
            } else {
              return {
                ...message,
                reactions: reactions.map((r) =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count + 1,
                        hasReacted: true,
                        users: [...r.users, currentUser],
                      }
                    : r
                ),
              };
            }
          } else {
            return {
              ...message,
              reactions: [
                ...reactions,
                { emoji, count: 1, users: [currentUser], hasReacted: true },
              ],
            };
          }
        }
        return message;
      })
    );
  };

  const handleStartChat = (username: string) => {
    setSelectedUser(username);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
    setPinnedMessages([]);
    setShowSearch(false);
    setShowFileUpload(false);
    setShowQuickReplies(false);
    setThreadMessage(null);
  };

  const handleFileUpload = (file: File, preview?: string) => {
    const isImage = file.type.startsWith("image/");
    const fileUrl = preview || URL.createObjectURL(file);

    handleSendMessage(isImage ? "Image" : file.name, isImage ? "image" : "file", {
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const handlePinMessage = (messageId: string) => {
    const messageToPin = messages.find((m) => m.id === messageId);
    if (messageToPin) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isPinned: true } : msg
        )
      );
      setPinnedMessages((prev) => [...prev, { ...messageToPin, isPinned: true }]);
    }
  };

  const handleUnpinMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: false } : msg
      )
    );
    setPinnedMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleMessageSelect = (messageId: string) => {
    setShowSearch(false);
  };

  const handleSendReply = (messageId: string, content: string) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      senderId: currentUser,
      senderName: currentUser,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, replies: [...(msg.replies || []), newReply] }
          : msg
      )
    );

    if (threadMessage) {
      setThreadMessage((prev) =>
        prev
          ? {
              ...prev,
              replies: [...(prev.replies || []), newReply],
            }
          : null
      );
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply, "text");
  };

  const handleStickerSelect = (emoji: string) => {
    handleSendMessage(emoji, "sticker");
  };

  // ------------------- UI -------------------
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="h-full flex flex-col"
          >
            <ChatHeader
              selectedUser={selectedUser}
              selectedUserName={selectedUser}
              currentUser={currentUser}
              onBack={handleBack}
              onShowSettings={handleBack}
              onSearchClick={() => setShowSearch(true)}
            />

            <PinnedMessages
              pinnedMessages={pinnedMessages}
              onUnpinMessage={handleUnpinMessage}
              onMessageClick={handleMessageSelect}
              currentUser={currentUser}
            />

            <ChatWindow
              messages={messages}
              currentUser={currentUser}
              selectedUser={selectedUser}
              selectedUserName={selectedUser}
              isTyping={otherUserTyping}
              onAddReaction={handleAddReaction}
              onPinMessage={handlePinMessage}
              onReplyToMessage={setThreadMessage}
              onStickerSelect={handleStickerSelect}
            />

            <QuickReplies
              onReplySelect={handleQuickReply}
              isVisible={showQuickReplies}
            />

            <EnhancedMessageInput
              onSendMessage={handleSendMessage}
              disabled={false}
              onTyping={setIsTyping}
              onFileUpload={() => setShowFileUpload(true)}
              onToggleQuickReplies={() =>
                setShowQuickReplies(!showQuickReplies)
              }
              onStickerSelect={handleStickerSelect}
            />

            <MessageSearch
              messages={messages}
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onMessageSelect={handleMessageSelect}
              currentUser={currentUser}
            />

            <FileUpload
              onFileUpload={handleFileUpload}
              onClose={() => setShowFileUpload(false)}
              isOpen={showFileUpload}
            />

            <MessageThread
              message={threadMessage}
              isOpen={!!threadMessage}
              onClose={() => setThreadMessage(null)}
              onSendReply={handleSendReply}
              currentUser={currentUser}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="h-full"
          >
            <ChatList
              currentUser={currentUser}
              onStartChat={handleStartChat}
              onLogout={onLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
