import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeStyleEval } from './HomeStyleEval';
import { StepWelcome } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { ChevronLeft } from 'lucide-react';

export default function StyleEvalPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
        <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
          <div className="w-full max-w-[800px] flex items-center justify-center relative">
            <h1 className="text-2xl font-medium text-gray-900">欢迎</h1>
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
            onClick={() => setShowWelcome(true)}
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
          onGoDeepEval={() => navigate('/leads')}
          onGoHome={() => setShowWelcome(true)}
          controlledPageIndex={undefined}
          onPageChange={() => {}}
        />
      </main>
    </div>
  );
}
