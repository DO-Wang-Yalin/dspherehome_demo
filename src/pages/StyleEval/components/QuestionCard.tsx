import { motion } from 'motion/react';
import type { Question } from '../data/questions';
import { Baby, Cat, Dog, PawPrint, Star, User, Users, X } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  selectedQuantities?: Record<string, number>;
  textAnswer?: string;
  onOptionSelect: (id: string, delta?: number) => void;
  onTextChange?: (text: string) => void;
}

export function QuestionCard({
  question,
  selectedOptions,
  selectedQuantities,
  onOptionSelect,
}: QuestionCardProps) {
  const hasImages = question.options.some((opt) => opt.imageUrl);

  if (question.id === 'q9') {
    const familyOptions = question.options.filter((o) => o.group === 'family');
    const petOptions = question.options.filter((o) => o.group === 'pet');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-serif text-stone-800 mb-3">{question.title}</h2>
          <p className="text-stone-500 text-lg">{question.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-orange-600">
              <Users size={24} />
              <h3 className="text-xl font-semibold text-stone-800">家庭结构</h3>
            </div>
            <div className="space-y-3">
              {familyOptions.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                const quantity = selectedQuantities?.[option.id] || 0;
                const hasQuantity = ['child_preschool', 'child_teen', 'elder'].includes(option.id);

                return (
                  <div
                    key={option.id}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected ? 'border-[#E15535] bg-white' : 'border-stone-100 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOptionSelect(option.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <span className="text-stone-600">
                        {option.id === 'single' ? (
                          <User size={24} />
                        ) : option.id === 'couple' ? (
                          <Users size={24} />
                        ) : option.id === 'child_preschool' ? (
                          <Baby size={24} />
                        ) : option.id === 'child_teen' ? (
                          <User size={24} />
                        ) : (
                          <User size={24} />
                        )}
                      </span>
                      <span className="font-medium text-stone-800">{option.label}</span>
                    </button>

                    {hasQuantity && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onOptionSelect(option.id, -1)}
                          className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onOptionSelect(option.id, 1)}
                          className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 hover:bg-orange-300"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-orange-600">
              <PawPrint size={24} />
              <h3 className="text-xl font-semibold text-stone-800">有毛孩子吗?</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {petOptions.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => onOptionSelect(option.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                      isSelected ? 'border-[#E15535] bg-white' : 'border-stone-100 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-3xl mb-2 text-stone-600">
                      {option.id === 'pet_cat' ? (
                        <Cat size={32} />
                      ) : option.id === 'pet_dog' ? (
                        <Dog size={32} />
                      ) : option.id === 'pet_other' ? (
                        <Star size={32} />
                      ) : (
                        <X size={32} />
                      )}
                    </span>
                    <span className="font-medium text-stone-700">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`w-full mx-auto ${hasImages ? 'max-w-4xl' : 'max-w-2xl'}`}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif text-stone-800 mb-3">{question.title}</h2>
        <p className="text-stone-500 text-lg">{question.subtitle}</p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(option.id);
          const totalOptions = question.options.length;

          let colClass = '';
          if (!hasImages) {
            if (totalOptions === 6) {
              colClass = 'col-span-2';
            } else if (totalOptions === 4 && question.id === 'q10') {
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
              className={`text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col shrink-0
                ${isSelected ? 'border-[#E15535] bg-white shadow-md' : 'border-stone-100 bg-white hover:border-stone-200 hover:bg-stone-50 hover:shadow-sm'}
                ${colClass}
              `}
            >
              {option.imageUrl && (
                <div className="w-full aspect-video relative overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {hasImages ? (
                <div className="p-3 flex-1">
                  <div className={`font-medium ${isSelected ? 'text-[#E15535]' : 'text-stone-800'}`}>{option.label}</div>
                  {option.description && (
                    <div className={`text-sm mt-1 ${isSelected ? 'text-orange-800/80' : 'text-stone-500'}`}>{option.description}</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center p-5 text-center flex-1">
                  <div className={`font-bold ${isSelected ? 'text-[#E15535]' : 'text-stone-800'}`}>{option.label}</div>
                  {option.description && (
                    <div className={`text-sm mt-1 ${isSelected ? 'text-orange-800/80' : 'text-stone-500'}`}>{option.description}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

