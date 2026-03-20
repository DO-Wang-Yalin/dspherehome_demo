import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { DreamOneLogo } from '../../../components/DreamOneLogo';

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
      className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto px-5 sm:px-8"
    >
      <div className="mb-8 flex w-full justify-center px-2">
        <DreamOneLogo
          trimExcessCanvas
          wrapperClassName="h-[4.5rem] w-[min(100%,420px)] sm:h-[5.25rem] sm:w-[min(100%,480px)]"
          className="h-full w-full"
          alt="DREAM.ONE"
        />
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-stone-900 mb-5 md:mb-6 leading-[1.15] tracking-tight">
        寻找属于你的
        <br />
        <span className="text-[#E15535] italic font-medium">居住美学</span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-stone-600 mb-10 md:mb-12 leading-relaxed max-w-xl font-normal">
        家，是内心的投射。通过一组精心设计的问题，我们将带您探索最契合生活方式的家居风格。
      </p>

      <button
        type="button"
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-10 py-4 md:py-4 text-base md:text-lg font-semibold text-white bg-stone-800 rounded-full overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-stone-800/25"
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

