import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StepContract, StepPayment } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { ChevronLeft } from 'lucide-react';

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();
  const fromHome = searchParams.get('from') === 'home';

  React.useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    setStep(s);
  }, [searchParams]);

  // 已签署的合同不再要求重新签署，直接进入付款信息步骤
  const hasSigned = !!(data.contractAccepted && data.contractSignatureData);
  React.useEffect(() => {
    if (step === 1 && hasSigned) {
      navigate(fromHome ? '/contracts?step=2&from=home' : '/contracts?step=2', { replace: true });
    }
  }, [step, hasSigned, fromHome, navigate]);

  const nextStep = () => {
    if (step === 1) {
      navigate(fromHome ? '/contracts?step=2&from=home' : '/contracts?step=2');
    } else {
      navigate(fromHome ? '/home' : '/deep-eval');
    }
  };

  const prevStep = () => {
    if (step === 2) {
      // 从项目中心进入且已签署时，返回直接回项目中心（无需再进步骤1）
      if (fromHome && hasSigned) {
        navigate('/home');
      } else {
        navigate(fromHome ? '/contracts?step=1&from=home' : '/contracts?step=1');
      }
    } else {
      navigate(fromHome ? '/home' : '/register');
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
          <h1 className="text-2xl font-medium text-gray-900">意向金合同</h1>
          <NavigationMenu />
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        {step === 1 && <StepContract data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />}
        {step === 2 && <StepPayment data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} onBackToHome={() => navigate(fromHome ? '/home' : '/')} primaryActionLabel={fromHome ? '进入我的项目' : '完成支付进入深度测评'} />}
      </main>
    </div>
  );
}
