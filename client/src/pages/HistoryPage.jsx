import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare } from 'lucide-react';
import MessageCard from '../components/Chat/MessageCard';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HistoryPage({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const convId = conversation?._id || conversation?.id;

  useEffect(() => {
    if (!convId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/conversations/${convId}/messages`);
        setMessages(data.data.messages || []);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [convId]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-stone-700" />
          </div>
          <h2 className="text-lg font-semibold text-stone-400 mb-2">No conversation selected</h2>
          <p className="text-sm text-stone-600">Pick a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading messages…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.07]">
        <h2 className="text-sm font-semibold text-stone-300 truncate">
          {conversation.title || 'Conversation'}
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          {new Date(conversation.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-stone-600 text-sm">No messages found</div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg._id || msg.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <MessageCard message={msg} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
