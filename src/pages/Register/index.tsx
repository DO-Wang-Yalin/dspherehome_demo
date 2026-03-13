import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StepRegister } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-8 pb-4 px-6 flex items-center justify-center relative z-50">
        <div className="w-full max-w-[800px] flex items-center justify-center relative">
          <button
            onClick={() => navigate('/leads?step=2')}
            className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium text-gray-900">注册</h1>
          <NavigationMenu />
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        <StepRegister 
          data={data} 
          updateData={updateData} 
          nextStep={() => navigate('/contracts')} 
          prevStep={() => navigate('/leads?step=2')} 
        />
      </main>
    </div>
  );
}
