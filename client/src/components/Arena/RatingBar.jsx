import { motion } from 'framer-motion';

export default function RatingBar({ label, score, color = 'purple', delay = 0 }) {
  const num = Number(score) || 0;
  const pct = (num / 10) * 100;
  const colorMap = {
    purple: {
      bar: 'from-amber-700 to-amber-400',
      text: 'text-amber-400',
      bg: 'bg-amber-700/12',
    },
    cyan: {
      bar: 'from-[#3a8a7c] to-[#5ba99a]',
      text: 'text-[#78c4b5]',
      bg: 'bg-[#5ba99a]/10',
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400">{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{num.toFixed(1)}/10</span>
      </div>
      <div className={`h-1.5 rounded-full ${c.bg} overflow-hidden`}>
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
