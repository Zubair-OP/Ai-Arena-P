import { motion } from 'framer-motion';

export default function RatingBar({ label, score, color = 'purple', delay = 0 }) {
  const num = Number(score) || 0;
  const pct = (num / 10) * 100;
  const colorMap = {
    purple: {
      bar: 'from-purple-600 to-purple-400',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    cyan: {
      bar: 'from-cyan-600 to-cyan-400',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{num.toFixed(1)}/10</span>
      </div>
      <div className={`h-2 rounded-full ${c.bg} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
          className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
        />
      </div>
    </div>
  );
}
