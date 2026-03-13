import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between text-sm text-stone-500 mb-2">
        <span>
          第 {current} / {total} 题
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

