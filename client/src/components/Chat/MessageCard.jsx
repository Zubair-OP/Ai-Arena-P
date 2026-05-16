import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Scale, Trophy, User } from 'lucide-react';
import RatingBar from '../Arena/RatingBar';
import MarkdownRenderer from './MarkdownRenderer';

export default function MessageCard({ message }) {
  const [judgeOpen, setJudgeOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* User query */}
      <div className="flex justify-end">
        <div className="max-w-lg flex items-start gap-2.5">
          <div className="glass rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-stone-200 leading-relaxed">
            {message.query}
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Model responses */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Model A
            </span>
          </div>
          <MarkdownRenderer content={message.responseA?.content || message.responses?.modelA || '—'} />
        </div>
        <div className="glass rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#78c4b5] uppercase tracking-wider">
              Model B
            </span>
          </div>
          <MarkdownRenderer content={message.responseB?.content || message.responses?.modelB || '—'} />
        </div>
      </div>

      {/* Judge panel (collapsible) */}
      {(message.judgeText || message.judge) && (
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setJudgeOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-400">Judge Verdict</span>
              {(message.judge?.winner || message.winner) && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-500/20">
                  <Trophy className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[10px] text-amber-300">
                    {message.judge?.winner || message.winner}
                  </span>
                </div>
              )}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-500 transition-transform ${judgeOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {judgeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-white/[0.07] pt-3">
                  <MarkdownRenderer content={message.judgeText || message.judge?.reasoning || ''} />
                  {message.judge && (
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <RatingBar label="Model A" score={message.judge.ratingA} color="purple" />
                      <RatingBar label="Model B" score={message.judge.ratingB} color="cyan" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
