import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Loader2 } from 'lucide-react';
import MarkdownRenderer from '../Chat/MarkdownRenderer';

export default function ModelPanel({ model, text, isStreaming, color = 'purple' }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text]);

  const colorMap = {
    purple: {
      badge: 'bg-amber-700/15 border-amber-600/20 text-amber-400',
      glow: 'glow-model-a',
      border: 'border-amber-600/15',
      spinner: 'text-amber-400/60',
    },
    cyan: {
      badge: 'bg-[#5ba99a]/10 border-[#5ba99a]/20 text-[#78c4b5]',
      glow: 'glow-model-b',
      border: 'border-[#5ba99a]/15',
      spinner: 'text-[#78c4b5]/60',
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className={`flex-1 flex flex-col glass rounded-2xl overflow-hidden ${isStreaming ? c.glow : ''} transition-shadow duration-500`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${c.border} bg-white/[0.02]`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.badge}`}>
          <Cpu className="w-3 h-3" />
          {model}
        </div>
        {isStreaming && (
          <div className={`flex items-center gap-1.5 text-xs ${c.spinner}`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating…</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="overflow-y-auto p-4 max-h-[55vh]">
        {!text && !isStreaming ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-stone-600 text-sm">Waiting for query…</p>
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
