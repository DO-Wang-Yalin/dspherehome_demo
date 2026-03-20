import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BudgetConfirmPanel } from '../../components/BudgetConfirmPanel';
import { DreamOneLogo } from '../../components/DreamOneLogo';

export default function BudgetBoardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col">
      <header className="w-full py-4 px-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">返回项目中心</span>
          </button>
          <div className="flex items-center gap-3">
            <DreamOneLogo className="h-8 w-auto sm:h-9" />
            <h1 className="text-lg font-semibold text-gray-900">预算看板</h1>
          </div>
          <div className="w-28" />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <BudgetConfirmPanel />
      </main>
    </div>
  );
}
