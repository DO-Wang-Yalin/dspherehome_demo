import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeStyleEval } from './HomeStyleEval';
import { StepWelcome } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { isRequirementsSupplementFlow } from '../../utils/navigationConfig';
import { ChevronLeft } from 'lucide-react';

export default function StyleEvalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(location.pathname === '/admin');
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
    setShowWelcome(location.pathname === '/admin');
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showResult') === 'true') {
      setShowResult(true);
      setShowWelcome(false);
    }
  }, [location.pathname, location.search]);

  const handleBack = () => {
    if (showWelcome) {
      navigate('/');
      return;
    }

    if (showResult) {
      setShowResult(false);
      setCurrentIndex(9); // Last question
      return;
    }

    // 第一页返回欢迎页，后面每一页返回上一题（与 PAGES_GUIDE 一致）
    if (currentIndex === 0) {
      // 从 /admin 进入时先回到后台管理；从需求书补齐流程返回项目中心需求书 tab
      if (location.pathname === '/admin') {
        setShowWelcome(true);
      } else if (fromRequirements) {
        navigate('/home', { state: { activeTab: 'requirements' } });
      } else {
        navigate('/');
      }
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
        <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
          <div className="w-full max-w-[800px] flex items-center justify-center relative">
            <button
              onClick={handleBack}
              className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              title="返回欢迎页"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">后台管理</h1>
            <NavigationMenu />
          </div>
        </header>
        <main className="flex-1 relative overflow-x-hidden">
          <StepWelcome
            data={data}
            updateData={updateData}
            nextStep={() => setShowWelcome(false)}
            goToStep={(stepId) => {
              if (stepId === 'home-style-eval') setShowWelcome(false);
              else if (stepId === 'deep-eval-1') navigate('/leads');
              else if (stepId === 'register') navigate('/register');
              else if (stepId === 'q2-4') navigate('/deep-eval');
            }}
            goToWorkbench={() => navigate('/home')}
            goToLogin={() => navigate('/login')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
        <div className="w-full max-w-[800px] flex items-center justify-center relative">
          <button
            onClick={handleBack}
            className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium text-gray-900">家居风格测评</h1>
          <NavigationMenu />
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
          onGoHome={() => setShowWelcome(true)}
          onStyleResult={(r) => updateData({ styleId: r.styleId, styleName: r.styleName, colorGene: r.colorGene, styleSuggestions: r.styleSuggestions })}
          controlledPageIndex={showResult ? 10 : currentIndex}
          onPageChange={(idx) => {
            if (idx === 10) setShowResult(true);
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
