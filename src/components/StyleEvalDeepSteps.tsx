import React from 'react';
import { Baby, Cat, Dog, Minus, PawPrint, Plus, Star, User, Users } from 'lucide-react';
import type { FormData } from '../types';
import { StepWrapper, SubQuestion, RadioCard, CheckboxCard } from './ui';
import { styleEvalDeepBridgeQuestions } from '../pages/StyleEval/data/questions';

type StepProps = {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep?: () => void;
};

const [q8, q9, q10] = styleEvalDeepBridgeQuestions;

export const StepStyleQ8 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="DE-03：居住定位" subtitle={q8.subtitle}>
    <div className="space-y-6">
      <div className="space-y-4">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full" />
          请选最贴近的一项
        </SubQuestion>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {q8.options.map((opt) => (
            <RadioCard
              key={opt.id}
              label={opt.label}
              description={opt.description}
              selected={data.styleEvalQ8Positioning === opt.id}
              onClick={() => updateData({ styleEvalQ8Positioning: opt.id })}
            />
          ))}
        </div>
      </div>
    </div>
  </StepWrapper>
);

export const StepStyleQ9 = ({ data, updateData }: StepProps) => {
  const coreOptions = q9.options.filter((o) => o.group === 'core');
  const familyOptions = q9.options.filter((o) => o.group === 'family');
  const petOptions = q9.options.filter((o) => o.group === 'pet');
  const sel = data.styleEvalQ9Selections ?? [];
  const qty = data.styleEvalQ9Quantities ?? {};

  React.useEffect(() => {
    const s = data.styleEvalQ9Selections ?? [];
    if (!s.includes('pet_none')) return;
    updateData({ styleEvalQ9Selections: s.filter((x) => x !== 'pet_none') });
  }, [data.styleEvalQ9Selections, updateData]);

  const setCoreHousehold = (id: 'single' | 'couple') => {
    const other = id === 'single' ? 'couple' : 'single';
    if (sel.includes(id)) {
      updateData({ styleEvalQ9Selections: sel.filter((x) => x !== id) });
    } else {
      updateData({ styleEvalQ9Selections: [...sel.filter((x) => x !== other), id] });
    }
  };

  const toggle = (id: string) => {
    if (sel.includes(id)) {
      const nextQty = { ...qty };
      delete nextQty[id];
      updateData({
        styleEvalQ9Selections: sel.filter((x) => x !== id),
        styleEvalQ9Quantities: Object.keys(nextQty).length ? nextQty : {},
      });
    } else {
      updateData({
        styleEvalQ9Selections: [...sel, id],
        styleEvalQ9Quantities: { ...qty, [id]: Math.max(1, qty[id] ?? 1) },
      });
    }
  };

  const setQty = (id: string, delta: number) => {
    const cur = qty[id] ?? 0;
    const next = Math.max(0, cur + delta);
    const nextQty = { ...qty, [id]: next };
    if (next === 0) {
      delete nextQty[id];
      updateData({
        styleEvalQ9Quantities: Object.keys(nextQty).length ? nextQty : {},
        styleEvalQ9Selections: sel.filter((x) => x !== id),
      });
    } else {
      updateData({
        styleEvalQ9Quantities: nextQty,
        styleEvalQ9Selections: sel.includes(id) ? sel : [...sel, id],
      });
    }
  };

  return (
    <StepWrapper title="DE-04：同住成员" subtitle={q9.subtitle}>
      <div className="space-y-8">
        <div className="space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#EF6B00]" />
            基础居住形态
          </SubQuestion>
          <p className="text-sm text-gray-500 -mt-2">
            单身人士与夫妻/伴侣单独呈现；二选一或不选，可与下方「家庭成员」叠加
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coreOptions.map((option) => (
              <RadioCard
                key={option.id}
                label={option.label}
                description={
                  option.id === 'single'
                    ? '一人常住为主，按个人动线与习惯规划。'
                    : '二人同住，动线与收纳需兼顾双方节奏。'
                }
                selected={sel.includes(option.id)}
                onClick={() => setCoreHousehold(option.id as 'single' | 'couple')}
              />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EF6B00]" />
            家庭成员
          </SubQuestion>
          <p className="text-sm text-gray-500 -mt-2">
            除上述形态外，同住的儿童与长辈（选中后可按人数调整）
          </p>
          <div className="space-y-3">
            {familyOptions.map((option) => {
              const isSelected = sel.includes(option.id);
              const quantity = qty[option.id] ?? 0;

              return (
                <div
                  key={option.id}
                  className={`rounded-xl border transition-all ${
                    isSelected ? 'border-[#EF6B00] ring-1 ring-[#EF6B00] bg-white' : 'border-dashed border-gray-200 bg-[#FFFDF3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => toggle(option.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <span className="text-gray-500 flex-shrink-0">
                        {option.id === 'child_preschool' ? (
                          <Baby size={22} />
                        ) : (
                          <User size={22} />
                        )}
                      </span>
                      <span className="font-bold text-gray-800">{option.label}</span>
                    </button>
                    {isSelected && (
                      <div
                        className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="减少人数"
                          onClick={() => setQty(option.id, -1)}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        >
                          <Minus size={18} strokeWidth={2.25} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#EF6B00] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="增加人数"
                          onClick={() => setQty(option.id, 1)}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        >
                          <Plus size={18} strokeWidth={2.25} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-[#EF6B00]" />
            宠物
          </SubQuestion>
          <p className="text-sm text-gray-500 -mt-2">不养宠物无需选择任何一项</p>
          <div className="space-y-3">
            {petOptions.map((option) => {
              const isSelected = sel.includes(option.id);
              const quantity = qty[option.id] ?? 0;

              return (
                <div
                  key={option.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#EF6B00] ring-1 ring-[#EF6B00] bg-white'
                      : 'border-dashed border-gray-200 bg-[#FFFDF3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => toggle(option.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <span className="text-gray-500 flex-shrink-0">
                        {option.id === 'pet_cat' ? (
                          <Cat size={22} />
                        ) : option.id === 'pet_dog' ? (
                          <Dog size={22} />
                        ) : (
                          <Star size={22} />
                        )}
                      </span>
                      <span className="font-bold text-gray-800">{option.label}</span>
                    </button>
                    {isSelected && (
                      <div
                        className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="减少数量"
                          onClick={() => setQty(option.id, -1)}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        >
                          <Minus size={18} strokeWidth={2.25} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#EF6B00] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="增加数量"
                          onClick={() => setQty(option.id, 1)}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        >
                          <Plus size={18} strokeWidth={2.25} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export const StepStyleQ10 = ({ data, updateData }: StepProps) => {
  const selected = data.styleEvalQ10Needs ?? [];

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      updateData({ styleEvalQ10Needs: selected.filter((x) => x !== id) });
    } else {
      updateData({ styleEvalQ10Needs: [...selected, id] });
    }
  };

  return (
    <StepWrapper title="DE-21：空间兴趣" subtitle={q10.subtitle}>
      <div className="space-y-3">
        <SubQuestion className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full" />
          可多选
        </SubQuestion>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q10.options.map((opt) => (
            <CheckboxCard
              key={opt.id}
              label={opt.label}
              description={opt.description}
              selected={selected.includes(opt.id)}
              onClick={() => toggle(opt.id)}
            />
          ))}
        </div>
      </div>
    </StepWrapper>
  );
};
