import { motion } from 'framer-motion';
import { Cpu, Loader2 } from 'lucide-react';
import MarkdownRenderer from '../Chat/MarkdownRenderer';

export default function ModelPanel({ model, text, isStreaming, color = 'purple' }) {
  const colorMap = {
    purple: {
      badge: 'bg-purple-600/20 border-purple-500/30 text-purple-300',
      dot: 'bg-purple-400',
      glow: 'glow-purple',
      border: 'border-purple-500/20',
    },
    cyan: {
      badge: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300',
      dot: 'bg-cyan-400',
      glow: 'glow-cyan',
      border: 'border-cyan-400/20',
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className={`flex-1 flex flex-col glass rounded-2xl overflow-hidden min-h-0 ${isStreaming ? c.glow : ''} transition-shadow duration-500`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${c.border} bg-white/3`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.badge}`}>
          <Cpu className="w-3 h-3" />
          {model}
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating…</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {!text && !isStreaming ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-600 text-sm">Waiting for query…</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={isStreaming ? 'typing-cursor' : ''}
          >
            <MarkdownRenderer content={text} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
