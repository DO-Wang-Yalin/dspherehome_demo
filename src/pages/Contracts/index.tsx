import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StepContract, StepPayment } from '../../components/steps';
import { useGlobal } from '../../context/GlobalContext';
import { NavigationMenu } from '../../components/NavigationMenu';
import { HeaderHomeButton } from '../../components/HeaderHomeButton';
import { ChevronLeft } from 'lucide-react';
import { getLeadById } from '../../services/leads/savedLeadsStorage';
import { enterProjectWorkbenchFromLead } from '../../services/leads/enterProjectFromLead';

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  const navigate = useNavigate();
  const { data, updateData, setActiveProjectLeadId } = useGlobal();
  const fromHome = searchParams.get('from') === 'home';
  const contractLeadId = searchParams.get('leadId');

  const lead = contractLeadId ? getLeadById(contractLeadId) : undefined;

  useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    setStep(s);
  }, [searchParams]);

  /** 已废弃 step=3：合并进步骤 2 付款页，旧链接统一回到步骤 2 */
  useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    if (s !== 3) return;
    const p = new URLSearchParams({ step: '2' });
    if (contractLeadId) p.set('leadId', contractLeadId);
    if (fromHome) p.set('from', 'home');
    navigate(`/contracts?${p}`, { replace: true });
  }, [searchParams, contractLeadId, fromHome, navigate]);

  /** 将线索信息带入合同页展示 */
  useEffect(() => {
    if (!contractLeadId || !lead || lead.status !== 'pending_contract') return;
    updateData({
      userName: lead.name,
      userTitle: lead.salutation,
      userPhone: lead.phone,
      userCity: lead.city,
      userAgeRange: lead.ageGroup,
      userIndustry: lead.industry,
      projectName: lead.projectName,
      projectLocation: lead.projectPosition,
      projectArea: lead.area,
      projectType: lead.projectType,
      houseCondition: lead.handoverStatus,
      budgetStandard: lead.budget,
    });
  }, [contractLeadId, lead?.id, lead?.status]);

  const hasSignedGlobal = !!(data.contractAccepted && data.contractSignatureData);

  useEffect(() => {
    if (step !== 1) return;
    if (contractLeadId) {
      if (!lead) {
        navigate('/projects', { replace: true });
        return;
      }
      if (lead.status === 'project') {
        const p = new URLSearchParams({ step: '2', leadId: contractLeadId });
        if (fromHome) p.set('from', 'home');
        navigate(`/contracts?${p}`, { replace: true });
      }
      return;
    }
    if (hasSignedGlobal) {
      navigate(fromHome ? '/contracts?step=2&from=home' : '/contracts?step=2', { replace: true });
    }
  }, [
    step,
    contractLeadId,
    lead?.id,
    lead?.status,
    hasSignedGlobal,
    fromHome,
    navigate,
  ]);

  const contractsQuery = (s: number) => {
    const p = new URLSearchParams({ step: String(s) });
    if (contractLeadId) p.set('leadId', contractLeadId);
    if (fromHome) p.set('from', 'home');
    return `/contracts?${p.toString()}`;
  };

  const nextStep = () => {
    if (step === 1) {
      navigate(contractsQuery(2));
    } else if (step === 2) {
      if (fromHome) navigate('/home');
      else if (contractLeadId) {
        setActiveProjectLeadId(contractLeadId);
        navigate(`/deep-eval?leadId=${encodeURIComponent(contractLeadId)}`);
      } else navigate('/projects');
    }
  };

  const prevStep = () => {
    if (step === 2) {
      if (fromHome && hasSignedGlobal && !contractLeadId) {
        navigate('/home');
      } else {
        navigate(contractsQuery(1));
      }
    } else {
      if (fromHome) navigate('/home');
      else if (contractLeadId) navigate('/projects');
      else navigate('/deep-eval?step=21');
    }
  };

  const handleEnterProject = () => {
    if (!contractLeadId) return;
    enterProjectWorkbenchFromLead(contractLeadId, updateData, setActiveProjectLeadId);
    navigate('/home', { state: { activeTab: 'requirements' } });
  };

  const handleContinueDeepEval = () => {
    if (!contractLeadId) return;
    setActiveProjectLeadId(contractLeadId);
    navigate(`/deep-eval?leadId=${encodeURIComponent(contractLeadId)}`);
  };

  /** 带线索进合同：付款页复制后出现「进项目 / 深度测评」双选项 */
  const showLeadChoiceOnPayment = !!contractLeadId && !!lead;

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col relative">
      <header className="w-full pt-6 sm:pt-8 pb-4 px-4 sm:px-6 flex items-center justify-center relative z-50 border-b border-stone-200/40 bg-[#FFFDF3]/95 backdrop-blur-[2px]">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center relative min-h-[2.75rem]">
          <button
            onClick={prevStep}
            className="absolute left-0 w-11 h-11 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-stone-900 px-12 text-center leading-snug">
            意向金合同
          </h1>
          <div className="absolute right-0 top-1/2 z-50 -translate-y-1/2 flex items-center gap-2">
            <NavigationMenu inline anchorClass="" />
            <HeaderHomeButton />
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-x-hidden">
        {step === 1 && (
          <StepContract
            data={data}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            contractLeadId={contractLeadId}
          />
        )}
        {step === 2 && (
          <StepPayment
            data={data}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            onBackToHome={() => navigate(fromHome ? '/home' : contractLeadId ? '/projects' : '/')}
            primaryActionLabel={fromHome ? '进入我的项目' : '完成支付，进入项目列表'}
            leadChoiceActions={
              showLeadChoiceOnPayment
                ? {
                    projectName: lead?.projectName || lead?.projectPosition || '项目',
                    onEnterWorkbench: handleEnterProject,
                    onContinueDeepEval: handleContinueDeepEval,
                  }
                : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
