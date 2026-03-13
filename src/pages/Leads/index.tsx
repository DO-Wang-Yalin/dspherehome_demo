import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StepDeepEval1, StepDeepEval2 } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { ChevronLeft } from 'lucide-react';

export default function LeadsPage() {
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  // Sync state if URL changes (optional, but good for back button)
  React.useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    setStep(s);
  }, [searchParams]);

  const nextStep = () => {
    if (step === 1) {
      navigate('/leads?step=2');
    } else {
      navigate('/register');
    }
  };

  const prevStep = () => {
    if (step === 2) {
      navigate('/leads?step=1');
    } else {
      navigate('/style-eval');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
        <div className="w-full max-w-[800px] flex items-center justify-center relative">
          <button
            onClick={prevStep}
            className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium text-gray-900">项目线索收集</h1>
          <NavigationMenu />
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        {step === 1 && <StepDeepEval1 data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />}
        {step === 2 && <StepDeepEval2 data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />}
      </main>
    </div>
  );
}
