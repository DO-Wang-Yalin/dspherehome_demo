import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';
import { AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavigationMenu } from '../../components/NavigationMenu';
import { HeaderHomeButton } from '../../components/HeaderHomeButton';
import {
  Step4,
  Step5,
  Step6,
  Step6_1,
  Step7,
  Step8,
  Step9,
  Step10,
  Step11,
  Step12,
  Step13,
  Step14,
  Step15,
  Step16,
  Step17,
  Step18,
  Step19,
  Step20,
  Step21,
} from '../../components/steps';
import { StepStyleQ8, StepStyleQ9, StepStyleQ10 } from '../../components/StyleEvalDeepSteps';
import { initialFormData, type FormData } from '../../types';
import {
  DEEP_EVAL_FORM_KEYS,
  getDeepEvalDraft,
  saveDeepEvalDraftMerge,
} from '../../services/leads/deepEvalByLeadStorage';

const steps = [
  { id: 'q2-4', component: Step4 },
  { id: 'q2-5', component: Step5 },
  { id: 'style-q8', component: StepStyleQ8 },
  { id: 'style-q9', component: StepStyleQ9 },
  { id: 'q2-6', component: Step6 },
  { id: 'q2-6-1', component: Step6_1 },
  { id: 'q2-7', component: Step7 },
  { id: 'q2-8', component: Step8 },
  { id: 'q2-9', component: Step9 },
  { id: 'q2-10', component: Step10 },
  { id: 'q2-11', component: Step11 },
  { id: 'q2-12', component: Step12 },
  { id: 'q2-13', component: Step13 },
  { id: 'q2-14', component: Step14 },
  { id: 'q2-15', component: Step15 },
  { id: 'q2-16', component: Step16 },
  { id: 'q2-17', component: Step17 },
  { id: 'q2-18', component: Step18 },
  { id: 'q2-19', component: Step19 },
  { id: 'q2-20', component: Step20 },
  { id: 'style-q10', component: StepStyleQ10 },
  { id: 'q2-21', component: Step21 },
];

function buildDeepEvalPath(step: number, leadId: string | null, fromRequirements: boolean) {
  const p = new URLSearchParams({ step: String(step) });
  if (leadId) p.set('leadId', leadId);
  if (fromRequirements) p.set('from', 'requirements');
  return `/deep-eval?${p.toString()}`;
}

export default function DeepEvalPage() {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const fromRequirements = searchParams.get('from') === 'requirements';
  const initialStep = Number(searchParams.get('step')) || 0;
  const [currentIndex, setCurrentIndex] = useState(initialStep);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  /** 切换线索时：重置深度测评字段再载入该线索草稿 */
  useEffect(() => {
    if (!leadId) return;
    const reset: Partial<FormData> = {};
    const init = initialFormData as unknown as Record<string, unknown>;
    for (const k of DEEP_EVAL_FORM_KEYS) {
      (reset as unknown as Record<string, unknown>)[k] = init[k as string];
    }
    const draft = getDeepEvalDraft(leadId);
    updateData({ ...reset, ...draft });
  }, [leadId]);

  const updateDataScoped = useCallback(
    (fields: Partial<FormData>) => {
      updateData(fields);
      if (leadId) saveDeepEvalDraftMerge(leadId, fields);
    },
    [leadId, updateData]
  );

  React.useEffect(() => {
    const s = Number(searchParams.get('step')) || 0;
    if (s >= 0 && s < steps.length) {
      setCurrentIndex(s);
    }
  }, [searchParams]);

  const finishDeepEval = () => {
    if (fromRequirements) {
      navigate('/home', { state: { activeTab: 'requirements' } });
    } else if (leadId) {
      navigate(`/projects?highlight=${encodeURIComponent(leadId)}`);
    } else {
      navigate('/contracts?step=1');
    }
  };

  const nextStep = () => {
    if (currentIndex < steps.length - 1) {
      navigate(buildDeepEvalPath(currentIndex + 1, leadId, fromRequirements));
      window.scrollTo(0, 0);
    } else {
      finishDeepEval();
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      navigate(buildDeepEvalPath(currentIndex - 1, leadId, fromRequirements));
      window.scrollTo(0, 0);
    } else if (fromRequirements) {
      navigate('/style-eval?from=requirements&showResult=true');
    } else if (leadId) {
      navigate(`/contracts?step=2&leadId=${encodeURIComponent(leadId)}`);
    } else {
      navigate('/register');
    }
  };

  const CurrentComponent = steps[currentIndex].component;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col pb-24">
      <header className="w-full pt-6 sm:pt-8 pb-4 px-4 sm:px-6 flex items-center justify-center relative z-50 border-b border-stone-200/40 bg-[#FFFDF3]/95 backdrop-blur-[2px]">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center relative min-h-[2.75rem]">
          <button
            onClick={prevStep}
            className="absolute left-0 w-11 h-11 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-center px-12">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-stone-900 leading-snug">
              深度测评
            </h1>
            {leadId && (
              <p className="text-xs text-amber-700 mt-1">本测评进度已与此条线索绑定保存</p>
            )}
          </div>
          <div className="absolute right-0 top-1/2 z-50 -translate-y-1/2 flex items-center gap-2">
            <NavigationMenu inline anchorClass="" />
            <HeaderHomeButton />
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <CurrentComponent
            key={steps[currentIndex].id}
            data={data}
            updateData={leadId ? updateDataScoped : updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            goToWorkbench={() =>
              navigate(
                '/home',
                fromRequirements ? { state: { activeTab: 'requirements' } } : undefined
              )
            }
            goToLogin={finishDeepEval}
            goToWelcome={() => navigate('/')}
          />
        </AnimatePresence>
      </main>

      {!isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200/40 p-4 z-50">
          <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={nextStep}
              className="w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] bg-[#FF9C3E] text-white hover:bg-[#EF6B00]"
            >
              下一步
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
