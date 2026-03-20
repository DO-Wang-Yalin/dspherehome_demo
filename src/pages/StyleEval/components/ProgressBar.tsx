import { motion } from 'motion/react';

interface ProgressBarProps {
  /** 已答完的题目数（非当前题序号） */
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 md:mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 sm:gap-4 mb-3 md:mb-3.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C87800] mb-1">测评进度</p>
          <p className="text-lg md:text-xl font-semibold text-stone-900 tabular-nums">
            已完成 <span className="text-[#E15535]">{completed}</span>
            <span className="text-stone-400 font-medium mx-1">/</span>
            {total} 题
          </p>
        </div>
        <p className="text-sm md:text-base font-medium tabular-nums text-stone-500 sm:text-right">{percentage}%</p>
      </div>
      <div
        className="w-full rounded-full h-2.5 md:h-3 bg-stone-200/90 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FF9C3E] to-[#EF6B00]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
