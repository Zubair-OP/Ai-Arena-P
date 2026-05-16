import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Trophy, Loader2, ChevronDown } from 'lucide-react';
import RatingBar from './RatingBar';
import MarkdownRenderer from '../Chat/MarkdownRenderer';

export default function JudgePanel({ text, ratings, winner, isVisible, streamPhase }) {
  const [collapsed, setCollapsed] = useState(false);
  const isJudging = streamPhase === 'judge';
  const isComplete = streamPhase === 'complete';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="glass rounded-2xl overflow-hidden flex-shrink-0"
      >
        {/* Header */}
        <button
          onClick={() => isComplete && setCollapsed((p) => !p)}
          className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02] ${isComplete ? 'hover:bg-white/[0.04] transition-colors cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600/15 border border-amber-500/20 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-stone-200">AI Judge</span>

            {isComplete && winner && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-500/18 ml-1">
                <Trophy className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[10px] text-amber-300 font-medium">
                  Winner: Model {winner}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isJudging && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
                <Loader2 className="w-3 h-3 animate-spin" />
                Deliberating…
              </div>
            )}
            {isComplete && (
              <ChevronDown
                className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
              />
            )}
          </div>
        </button>

        {/* Collapsible body */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {isJudging && !text && (
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    Analyzing responses…
                  </div>
                )}

                {text && <MarkdownRenderer content={text} />}

                {isComplete && ratings && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-6 pt-2 border-t border-white/[0.07]"
                  >
                    <RatingBar label="Model A (Mixtral)" score={ratings.modelA} color="purple" delay={0.1} />
                    <RatingBar label="Model B (Gemini)"  score={ratings.modelB} color="cyan"   delay={0.3} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
