import { motion } from 'motion/react';
import type { Question } from '../data/questions';

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  textAnswer?: string;
  onOptionSelect: (id: string) => void;
  onTextChange?: (text: string) => void;
}

export function QuestionCard({
  question,
  selectedOptions,
  onOptionSelect,
}: QuestionCardProps) {
  const hasImages = question.options.some((opt) => opt.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`w-full mx-auto ${hasImages ? 'max-w-6xl' : 'max-w-4xl'}`}
    >
      <header className="mb-8 md:mb-12 text-center px-1">
        {question.title?.trim() ? (
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#C87800] mb-3 md:mb-4">
            {question.title}
          </p>
        ) : null}
        <h2 className="text-2xl sm:text-3xl md:text-[1.875rem] lg:text-[2.125rem] font-semibold text-stone-900 leading-[1.38] tracking-tight max-w-[min(100%,42rem)] mx-auto">
          {question.subtitle}
        </h2>
      </header>

      <div className="grid grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(option.id);
          const totalOptions = question.options.length;

          let colClass = '';
          if (!hasImages) {
            if (totalOptions === 6) {
              colClass = 'col-span-2';
            } else if (totalOptions === 4) {
              colClass = 'col-span-3';
            } else {
              colClass = index < 3 ? 'col-span-2' : index === 3 ? 'col-span-2 col-start-2' : 'col-span-2 col-start-4';
            }
          } else {
            colClass = index < 3 ? 'col-span-2' : index === 3 ? 'col-span-2 col-start-2' : 'col-span-2';
          }

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={`text-left rounded-2xl md:rounded-3xl border-2 transition-all duration-200 overflow-hidden flex flex-col shrink-0 min-h-[3rem]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E15535]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF3]
                ${isSelected ? 'border-[#E15535] bg-white shadow-md md:shadow-lg ring-1 ring-[#E15535]/20' : 'border-stone-100/90 bg-white hover:border-stone-300 hover:bg-stone-50/90 hover:shadow-sm'}
                ${colClass}
              `}
            >
              {option.imageUrl && (
                <div className="w-full aspect-[4/3] sm:aspect-video relative overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {hasImages ? (
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <span
                    className={`text-base md:text-lg font-semibold leading-snug ${isSelected ? 'text-[#E15535]' : 'text-stone-900'}`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <p
                      className={`text-sm md:text-[0.9375rem] mt-2 leading-[1.65] ${isSelected ? 'text-stone-700' : 'text-stone-600'}`}
                    >
                      {option.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center w-full p-5 sm:p-6 md:p-7 flex-1 min-h-[9.5rem] md:min-h-[10.5rem]">
                  <span
                    className={`block w-full text-lg sm:text-xl md:text-[1.35rem] font-bold leading-snug tracking-tight ${isSelected ? 'text-[#C73E1D]' : 'text-stone-900'}`}
                  >
                    {option.label}
                  </span>
                  {option.description ? (
                    <p
                      className={`mt-4 pt-4 border-t w-full max-w-[36ch] sm:max-w-[42ch] mx-auto text-sm sm:text-[0.9375rem] md:text-base font-normal leading-[1.7] text-center ${
                        isSelected
                          ? 'border-[#E15535]/35 text-stone-700'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {option.description}
                    </p>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
