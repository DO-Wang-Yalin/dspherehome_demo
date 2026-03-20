import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StepRegister } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { HeaderHomeButton } from '../../components/HeaderHomeButton';
import { ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-6 sm:pt-8 pb-4 px-4 sm:px-6 flex items-center justify-center relative z-50 border-b border-stone-200/40 bg-[#FFFDF3]/95 backdrop-blur-[2px]">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center relative min-h-[2.75rem]">
          <button
            onClick={() => navigate('/leads?step=2')}
            className="absolute left-0 w-11 h-11 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-stone-900 px-12 text-center leading-snug">
            注册
          </h1>
          <div className="absolute right-0 top-1/2 z-50 -translate-y-1/2 flex items-center gap-2">
            <NavigationMenu inline anchorClass="" />
            <HeaderHomeButton />
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        <StepRegister 
          data={data} 
          updateData={updateData} 
          nextStep={() => navigate('/deep-eval')} 
          prevStep={() => navigate('/leads?step=2')} 
        />
      </main>
    </div>
  );
}
