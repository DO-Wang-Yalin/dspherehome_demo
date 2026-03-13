import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto px-4"
    >
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Sparkles className="text-orange-400" size={36} />
      </div>

      <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-6 leading-tight">
        寻找属于你的
        <br />
        <span className="text-orange-400 italic">居住美学</span>
      </h1>

      <p className="text-lg text-stone-500 mb-12 leading-relaxed max-w-lg">
        家，是内心的投射。通过 10 个简单的问题，我们将带您探索最契合您生活方式的家居风格。
      </p>

      <button
        type="button"
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-stone-800 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-stone-800/20"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-stone-800 to-stone-700" />
        <span className="relative flex items-center gap-2">
          开始测评
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </span>
      </button>
    </motion.div>
  );
}

