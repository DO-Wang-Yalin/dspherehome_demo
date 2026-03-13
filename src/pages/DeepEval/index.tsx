import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';
import { AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavigationMenu } from '../../components/NavigationMenu';
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

const steps = [
  { id: 'q2-4', component: Step4 },
  { id: 'q2-5', component: Step5 },
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
  { id: 'q2-21', component: Step21 },
];

export default function DeepEvalPage() {
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 0;
  const [currentIndex, setCurrentIndex] = useState(initialStep);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  React.useEffect(() => {
    const s = Number(searchParams.get('step')) || 0;
    if (s >= 0 && s < steps.length) {
      setCurrentIndex(s);
    }
  }, [searchParams]);

  const nextStep = () => {
    if (currentIndex < steps.length - 1) {
      navigate(`/deep-eval?step=${currentIndex + 1}`);
      window.scrollTo(0, 0);
    } else {
      navigate('/projects');
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      navigate(`/deep-eval?step=${currentIndex - 1}`);
      window.scrollTo(0, 0);
    } else {
      navigate('/home');
    }
  };

  const CurrentComponent = steps[currentIndex].component;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col pb-24">
       {/* Simple Header for Deep Eval */}
       <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
          <div className="w-full max-w-[800px] flex items-center justify-center relative">
            <button
              onClick={prevStep}
              className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">深度测评 ({currentIndex + 1}/{steps.length})</h1>
            <NavigationMenu />
          </div>
       </header>

       <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <CurrentComponent
            key={steps[currentIndex].id}
            data={data}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            goToWorkbench={() => navigate('/home')}
            goToLogin={() => navigate('/register')}
          />
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Hide on last step because Step21 has its own submit button */}
      {!isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
          <div className="max-w-[800px] mx-auto">
            <button
              onClick={nextStep}
              className="w-full bg-[#FF9C3E] text-white py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
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
