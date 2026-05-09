import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ConversationItem({ conversation, isActive, onClick, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const date = new Date(conversation.createdAt);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/api/conversations/${conversation._id || conversation.id}`);
      onDeleted(conversation._id || conversation.id);
    } catch {
      toast.error('Failed to delete conversation');
      setDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group flex items-start gap-2.5 cursor-pointer ${
        isActive
          ? 'bg-purple-600/20 border border-purple-500/30 text-white'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
      }`}
      onClick={onClick}
    >
      <MessageSquare
        className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400'}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate leading-relaxed">
          {conversation.title || 'Untitled conversation'}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{formatted}</p>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all mt-0.5"
        title="Delete conversation"
      >
        {deleting
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <Trash2 className="w-3 h-3" />
        }
      </button>
    </motion.div>
  );
}
