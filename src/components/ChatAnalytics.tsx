import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Clock, Heart, TrendingUp, Calendar, X, Download } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice' | 'file' | 'image' | 'sticker';
  reactions?: any[];
}

interface ChatAnalyticsProps {
  messages: Message[];
  currentUser: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MessageStats {
  totalMessages: number;
  sentByUser: number;
  receivedByUser: number;
  averageLength: number;
  mostActiveDay: string;
  mostActiveHour: number;
  reactionCount: number;
  messageTypes: { [key: string]: number };
  dailyActivity: { day: string; messages: number }[];
  hourlyActivity: { hour: number; messages: number }[];
}

export function ChatAnalytics({ messages, currentUser, isOpen, onClose }: ChatAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'activity' | 'content'>('overview');

  const calculateStats = (): MessageStats => {
    const stats: MessageStats = {
      totalMessages: messages.length,
      sentByUser: messages.filter(m => m.senderId === currentUser).length,
      receivedByUser: messages.filter(m => m.senderId !== currentUser).length,
      averageLength: 0,
      mostActiveDay: '',
      mostActiveHour: 0,
      reactionCount: 0,
      messageTypes: {},
      dailyActivity: [],
      hourlyActivity: [],
    };

    if (messages.length === 0) return stats;

    // Calculate average message length
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    stats.averageLength = Math.round(totalLength / messages.length);

    // Count reactions
    stats.reactionCount = messages.reduce((sum, msg) => {
      return sum + (msg.reactions?.reduce((reactionSum, reaction) => reactionSum + reaction.count, 0) || 0);
    }, 0);

    // Count message types
    messages.forEach(msg => {
      const type = msg.type || 'text';
      stats.messageTypes[type] = (stats.messageTypes[type] || 0) + 1;
    });

    // Daily activity
    const dailyCount: { [key: string]: number } = {};
    const hourlyCount: { [key: number]: number } = {};

    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      const hour = date.getHours();

      dailyCount[dayKey] = (dailyCount[dayKey] || 0) + 1;
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });

    // Convert to arrays for charts
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    stats.dailyActivity = days.map(day => ({
      day,
      messages: dailyCount[day] || 0
    }));

    stats.hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      messages: hourlyCount[hour] || 0
    }));

    // Find most active day and hour
    stats.mostActiveDay = Object.entries(dailyCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    stats.mostActiveHour = Object.entries(hourlyCount).sort((a, b) => b[1] - a[1])[0]?.[0] 
      ? parseInt(Object.entries(hourlyCount).sort((a, b) => b[1] - a[1])[0][0])
      : 0;

    return stats;
  };

  const stats = calculateStats();

  const pieColors = ['#3b82f6', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'];

  const messageTypeData = Object.entries(stats.messageTypes).map(([type, count], index) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: pieColors[index % pieColors.length]
  }));

  const exportData = () => {
    const exportStats = {
      ...stats,
      exportDate: new Date().toISOString(),
      chatPartner: messages.find(m => m.senderId !== currentUser)?.senderName || 'Unknown'
    };

    const dataStr = JSON.stringify(exportStats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
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
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Chat Analytics
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-2">
              {[
                { key: 'overview', label: 'Overview', icon: MessageSquare },
                { key: 'activity', label: 'Activity', icon: Clock },
                { key: 'content', label: 'Content', icon: Heart }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedView === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView(key as any)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {selectedView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Messages */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <span>Total Messages</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.totalMessages}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      You sent: {stats.sentByUser} ({Math.round((stats.sentByUser / stats.totalMessages) * 100)}%)
                    </div>
                  </CardContent>
                </Card>

                {/* Average Length */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Length</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.averageLength}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      characters per message
                    </div>
                  </CardContent>
                </Card>

                {/* Reactions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>Reactions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.reactionCount}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      total reactions given
                    </div>
                  </CardContent>
                </Card>

                {/* Most Active Day */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span>Most Active Day</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.mostActiveDay || 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Active Hour */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <span>Most Active Hour</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.mostActiveHour}:00
                    </div>
                  </CardContent>
                </Card>

                {/* Message Types */}
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Message Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={messageTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {messageTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedView === 'activity' && (
              <div className="space-y-6">
                {/* Daily Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Messages sent by day of the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.dailyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="messages" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Hourly Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Activity</CardTitle>
                    <CardDescription>Messages sent by hour of the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.hourlyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="messages" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedView === 'content' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Message Type Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {messageTypeData.map((type) => (
                        <div key={type.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            <span className="text-sm font-medium">{type.name}</span>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {type.value} ({Math.round((type.value / stats.totalMessages) * 100)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Conversation Balance
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(stats.sentByUser / stats.totalMessages) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {Math.round((stats.sentByUser / stats.totalMessages) * 100)}% you
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Engagement Level
                        </div>
                        <div className="text-2xl font-bold text-green-500">
                          {stats.reactionCount > 20 ? 'High' : stats.reactionCount > 10 ? 'Medium' : 'Low'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Based on reactions and message frequency
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}