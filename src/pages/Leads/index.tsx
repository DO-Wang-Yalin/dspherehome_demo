import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StepDeepEval1, StepDeepEval2 } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { ChevronLeft, CheckCircle2, FolderOpen } from 'lucide-react';

export default function LeadsPage() {
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  /** 从项目页进入：提交成功后的结果页 */
  const [showResultFromProjects, setShowResultFromProjects] = useState(false);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  const fromProjects = searchParams.get('from') === 'projects';

  const leadsUrl = useCallback(
    (s: number) => {
      const p = new URLSearchParams({ step: String(s) });
      if (fromProjects) p.set('from', 'projects');
      return `/leads?${p.toString()}`;
    },
    [fromProjects]
  );

  React.useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    setStep(s);
  }, [searchParams]);

  const nextStep = () => {
    if (step === 1) {
      navigate(leadsUrl(2));
    } else {
      navigate('/budget-breakdown');
    }
  };

  const prevStep = () => {
    if (step === 2) {
      navigate(leadsUrl(1));
    } else if (fromProjects) {
      navigate('/projects');
    } else {
      navigate('/style-eval?showResult=true');
    }
  };

  const handleSubmittedFromProjects = () => {
    setShowResultFromProjects(true);
  };

  if (fromProjects && showResultFromProjects) {
    return (
      <div className="min-h-screen bg-[#FFFDF3] flex flex-col">
        <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
          <h1 className="text-xl font-medium text-gray-900">提交结果</h1>
          <div className="absolute right-6 top-8">
            <NavigationMenu />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#EF6B00] via-[#FF9C3E] to-[#FFCE42]" />
            <div className="p-8 sm:p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <CheckCircle2 size={36} strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">线索已提交</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-4">
                您是从项目页进入的，账号已注册，<strong className="text-gray-800">无需再进行注册</strong>
                。本条线索已保存，您可以在「线索与项目」中查看并签署合同。
              </p>
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF6B00] text-white font-semibold py-3.5 px-6 hover:bg-[#d65f00] transition-colors active:scale-[0.99]"
              >
                <FolderOpen size={20} />
                返回线索与项目
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        {step === 1 && (
          <StepDeepEval1 data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
        )}
        {step === 2 && (
          <StepDeepEval2
            data={data}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            returnToProjects={fromProjects}
            onSubmittedToProjects={handleSubmittedFromProjects}
          />
        )}
      </main>
    </div>
  );
}
