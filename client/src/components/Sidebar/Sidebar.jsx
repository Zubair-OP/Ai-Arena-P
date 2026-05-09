import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, Zap, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ConversationItem from './ConversationItem';
import toast from 'react-hot-toast';

export default function Sidebar({
  isOpen,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  refreshTrigger,
}) {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/conversations');
        setConversations(data.data.conversations || []);
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();

  }, [refreshTrigger]);

  const handleDeleted = (id) => {
    setConversations((prev) => prev.filter((c) => (c._id || c.id) !== id));
    toast.success('Conversation deleted');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Logout failed');
    }
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-[280px] z-30 flex flex-col lg:relative lg:translate-x-0 lg:z-auto"
        style={{ transform: undefined }}
      >
        <div className="h-full flex flex-col glass border-r border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="font-semibold text-sm text-white">AI Arena</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat */}
          <div className="p-3">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-2">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-2 py-2">
              Recent
            </p>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-white/5 animate-pulse"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <MessageSquareIcon />
                <p className="mt-2">No conversations yet</p>
                <p className="text-[10px] mt-1 text-slate-600">Start a new chat above</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id || conv.id}
                  conversation={conv}
                  isActive={activeConversationId === (conv._id || conv.id)}
                  onClick={() => onSelectConversation(conv)}
                  onDeleted={handleDeleted}
                />
              ))
            )}
          </div>

          {/* User footer */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function MessageSquareIcon() {
  return (
    <svg
      className="w-8 h-8 mx-auto text-slate-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
