import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeStyleEval } from './HomeStyleEval';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { isRequirementsSupplementFlow } from '../../utils/navigationConfig';
import { ChevronLeft, Home } from 'lucide-react';

export default function StyleEvalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { data, updateData, activeProjectLeadId } = useGlobal();
  const fromRequirements = isRequirementsSupplementFlow(location.search);

  const buildDeepEvalEntry = () => {
    const p = new URLSearchParams({ step: '0' });
    p.set('from', 'requirements');
    if (activeProjectLeadId) p.set('leadId', activeProjectLeadId);
    return `/deep-eval?${p.toString()}`;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showResult') === 'true') {
      setShowResult(true);
    }
  }, [location.search]);

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      setCurrentIndex(6); // Last question (q1–q7)
      return;
    }

    if (currentIndex === 0) {
      if (fromRequirements) {
        navigate('/home', { state: { activeTab: 'requirements' } });
      } else {
        navigate('/');
      }
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-6 sm:pt-8 pb-4 px-4 sm:px-6 flex items-center justify-center relative z-50 border-b border-stone-200/40 bg-[#FFFDF3]/95 backdrop-blur-[2px]">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center relative min-h-[2.75rem]">
          <button
            onClick={handleBack}
            className="absolute left-0 w-11 h-11 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-stone-900 px-12 text-center leading-snug">
            家居风格测评
          </h1>
          <div className="absolute right-0 top-1/2 z-50 -translate-y-1/2 flex items-center gap-2">
            <NavigationMenu inline anchorClass="" />
            <button
              type="button"
              onClick={() => {
                if (fromRequirements) {
                  navigate('/home', { state: { activeTab: 'requirements' } });
                } else {
                  navigate('/');
                }
              }}
              aria-label="返回欢迎页"
              className="w-[34px] h-[34px] shrink-0 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Home size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 relative overflow-x-hidden">
        <HomeStyleEval
          onGoDeepEval={() =>
            fromRequirements ? navigate(buildDeepEvalEntry()) : navigate('/leads')
          }
          deepEvalButtonLabel={
            fromRequirements ? '开始深度需求测评' : undefined
          }
          onStyleResult={(r) => updateData({ styleId: r.styleId, styleName: r.styleName, colorGene: r.colorGene, styleSuggestions: r.styleSuggestions })}
          controlledPageIndex={showResult ? 7 : currentIndex}
          onPageChange={(idx) => {
            if (idx === 7) setShowResult(true);
            else {
              setShowResult(false);
              setCurrentIndex(idx);
            }
          }}
        />
      </main>
    </div>
  );
}
