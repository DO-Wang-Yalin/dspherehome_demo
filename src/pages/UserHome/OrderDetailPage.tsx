import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeftRight, Bot, BarChart3, ChevronRight, ChevronLeft, LayoutGrid, Hourglass, Layout, Activity, Check, FileText, AlertTriangle, Wrench } from 'lucide-react';
import { getOrderStatusColor, STATUS_BADGE_COLORS } from '../../utils/orderStatus';
import { useGlobal } from '../../context/GlobalContext';
import { INITIAL_ORDERS } from '../../data/mockOrders';
import { getDesignVersionInfo, getDesignFirstPagePreview } from '../../pages/DesignFeedback/DesignFeedbackApp';
import { handleOrderAction } from '../../utils/orderStateMachine';
import { toast } from 'sonner';
import { addResolvedPendingKey } from '../../utils/pendingDecisionResolvedStorage';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, updateData, activeProjectLeadId } = useGlobal();

  /** 仅 S05 客户决策：从待定「去处理」进订单详情，停留约 2 秒后记已处理（报价/结算待办走对应页面） */
  useEffect(() => {
    const key = (location.state as { acknowledgePendingKey?: string })?.acknowledgePendingKey;
    if (!key || !activeProjectLeadId || !key.endsWith('-scheme-decision')) return;
    const t = window.setTimeout(() => {
      addResolvedPendingKey(activeProjectLeadId, key);
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: {},
      });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [id, location.pathname, location.search, location.state, activeProjectLeadId, navigate]);

  // Find the order data from the global state
  const orders = data.orders && data.orders.length > 0 ? data.orders : INITIAL_ORDERS;
  const foundOrder = orders.find((o: any) => o.id === id);

  const currentStatusCode = foundOrder?.status.match(/^S\d{2}(-\d{2})?/)?.[0] || 'S06-01';

  /**
   * 订单状态进程 - 仅展示主路径状态（成交订单会经历的阶段）。
   * 不展示 S04 客户已婉拒、S05 客户决策中、S08 订单终止中、S13 订单休眠中，避免误导。
   * 当订单处于上述异常状态时，仅通过「当前状态」标签和进度高亮位置体现。
   */
  const ORDER_STEPS = [
    { id: 'S00', label: '方案筹备中', phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    { id: 'S01', label: '意向沟通中', phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    { id: 'S02', label: '订单深化中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S02-01', label: '提案设计中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S02-02', label: '订购报价中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S03', label: '订购确认中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S06', label: '订单交付中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-01', label: '交付设计中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-02', label: '方案汇报中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-03', label: '交付备货中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-04', label: '交付施工中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-05', label: '交付内审中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S07', label: '订单验收中', phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    { id: 'S09', label: '订单整改中', phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    { id: 'S11', label: '订单已交付', phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    { id: 'S10', label: '订单维保中', phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    { id: 'S12', label: '订单已结束', phase: '结束', blockBg: 'bg-gray-100/50', blockText: 'text-gray-500' },
  ];

  /** 所有状态码对应的阶段与样式（含异常状态），用于当前阶段、报价单可见性等逻辑 */
  const STATUS_PHASE_MAP: Record<string, { phase: string; blockBg: string; blockText: string }> = {
    S00: { phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    S01: { phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    S05: { phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    S04: { phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    S02: { phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    'S02-01': { phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    'S02-02': { phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    S03: { phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    S06: { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    'S06-01': { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    'S06-02': { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    'S06-03': { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    'S06-04': { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    'S06-05': { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    S13: { phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    S07: { phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    S09: { phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    S08: { phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    S11: { phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    S10: { phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    S12: { phase: '结束', blockBg: 'bg-gray-100/50', blockText: 'text-gray-500' },
  };

  const phaseInfo = STATUS_PHASE_MAP[currentStatusCode] || STATUS_PHASE_MAP['S06-01'];
  const currentPhase = phaseInfo.phase;
  const currentStep = ORDER_STEPS.find(s => s.id === currentStatusCode) ?? { ...ORDER_STEPS[0], blockBg: phaseInfo.blockBg, blockText: phaseInfo.blockText };

  const dynamicQuotations = useMemo(() => {
    const list = [];
    
    const isViewed = foundOrder?.viewed || false;
    const isFeedback = foundOrder?.feedbackSubmitted || false;

    const getUnifiedStatus = (viewed: boolean, signed: boolean, feedback: boolean) => {
      if (signed) return { text: '已查看已签字', color: 'bg-green-50 text-green-600' };
      if (feedback) return { text: '已查看已反馈', color: 'bg-blue-50 text-blue-600' };
      if (viewed) return { text: '已查看未签字', color: 'bg-orange-50 text-orange-600' };
      return { text: '未查看未签字', color: 'bg-red-50 text-red-600' };
    };

    // 1. 交付报价单: 交付期及以后可见
    if (['交付期', '验收期', '维保期', '结束'].includes(currentPhase)) {
      const statusInfo = getUnifiedStatus(isViewed, true, false);
      list.push({ ver: 'V3', title: '交付报价单', status: statusInfo.text, statusColor: statusInfo.color, time: '2023-11-28 14:00' });
    }

    // 2. 订购报价单: 订购期及以后可见
    if (!['意向期'].includes(currentPhase)) {
      const isSigned = ['交付期', '验收期', '维保期', '结束'].includes(currentPhase);
      
      const statusInfoV2 = getUnifiedStatus(isViewed, isSigned, isFeedback);
      list.push({ 
        ver: 'V2', 
        title: '订购报价单', 
        status: statusInfoV2.text, 
        statusColor: statusInfoV2.color, 
        time: '2023-11-24 15:00' 
      });
      
      const statusInfoV1 = getUnifiedStatus(true, true, true);
      list.push({ ver: 'V1', title: '订购报价单', status: statusInfoV1.text, statusColor: statusInfoV1.color, time: '2023-11-10 10:00' });
    }

    /** 意向阶段不提供「意向报价单」；报价单从订购报价单 V1 起（见 PAGES_GUIDE §2.15） */

    return list;
  }, [currentPhase, currentStatusCode, foundOrder]);

  const orderData = {
    id: foundOrder?.id || id || 'PSO-OD_LHJCF-00584',
    title: foundOrder?.title || '铝合金智能化幕墙采购与施工订单',
    status: foundOrder?.status || 'S06-01 交付设计中',
    statusColor: getOrderStatusColor(foundOrder?.status || 'S06-01 交付设计中'),
    totalAmount: foundOrder?.amount || (currentPhase === '意向期' ? '¥20,000 ~ ¥40,000' : '¥250,000'),
    quotations: dynamicQuotations
  }

  const displayAmount = orderData.totalAmount.startsWith('¥') ? orderData.totalAmount.slice(1) : orderData.totalAmount;
  const hasCurrencySymbol = orderData.totalAmount.includes('¥');

  const isViewed = foundOrder?.viewed || false;
  const isSigned = ['维保期', '结束'].includes(currentPhase);
  const isFeedback = foundOrder?.feedbackSubmitted || false;

  const getUnifiedStatus = (viewed: boolean, signed: boolean, feedback: boolean) => {
    if (signed) return { text: '已查看已签字', color: 'bg-green-50 text-green-600' };
    if (feedback) return { text: '已查看已反馈', color: 'bg-blue-50 text-blue-600' };
    if (viewed) return { text: '已查看未签字', color: 'bg-orange-50 text-orange-600' };
    return { text: '未查看未签字', color: 'bg-red-50 text-red-600' };
  };

  const settlementStatusInfo = getUnifiedStatus(isViewed, isSigned, isFeedback);
  const settlementStatus = settlementStatusInfo.text;
  const settlementStatusColor = settlementStatusInfo.color;

  const exceptionCodes = ['S04', 'S05', 'S08', 'S13'];
  const isExceptionState = exceptionCodes.includes(currentStatusCode);

  /** 主路径中无异常状态节点，异常状态映射到最近阶段用于高亮 */
  const EXCEPTION_ACTIVE_INDEX: Record<string, number> = {
    S04: 1,   // 婉拒 -> 意向期
    S05: 1,   // 客户决策中 -> 意向期
    S08: 12,  // 终止 -> 验收期 (S07)
    S13: 8,   // 休眠 -> 交付期 (S06-01)
  };

  let activeIndex = ORDER_STEPS.findIndex(s => s.id === currentStatusCode);
  if (activeIndex === -1) {
    activeIndex = EXCEPTION_ACTIVE_INDEX[currentStatusCode] ?? 0;
  }

  const progressPercentage = ORDER_STEPS.length > 1 ? (activeIndex / (ORDER_STEPS.length - 1)) * 100 : 0;

  /** 滑动窗口：一次仅展示 6 个步骤，初始化时当前状态尽量居中，无法居中则正常显示 */
  const WINDOW_SIZE = 6;
  const getCenteredStart = (active: number) => {
    const start = Math.max(0, active - Math.floor(WINDOW_SIZE / 2));
    return start + WINDOW_SIZE > ORDER_STEPS.length
      ? Math.max(0, ORDER_STEPS.length - WINDOW_SIZE)
      : start;
  };
  const [windowStartIndex, setWindowStartIndex] = useState(() => getCenteredStart(activeIndex));

  useLayoutEffect(() => {
    setWindowStartIndex(getCenteredStart(activeIndex));
  }, [activeIndex]);

  const handlePrev = () => {
    setWindowStartIndex(prev => Math.max(0, prev - 3));
  };

  const handleNext = () => {
    setWindowStartIndex(prev => Math.min(ORDER_STEPS.length - WINDOW_SIZE, prev + 3));
  };

  /**
   * 阶段聚合：将相同 phase 的连续步骤合并为阶段块，用于绘制时间轴上方「阶段大括号」（仅中文阶段名）。
   */
  const allPhases = useMemo(() => {
    const result: Array<{ name: string; startIndex: number; endIndex: number; color: string; bgColor: string }> = [];
    let currentP: (typeof result)[0] | null = null;

    ORDER_STEPS.forEach((step, index) => {
      if (!currentP || currentP.name !== step.phase) {
        if (currentP) {
          currentP.endIndex = index - 1;
        }
        currentP = {
          name: step.phase,
          startIndex: index,
          endIndex: index,
          color: step.blockText,
          bgColor: step.blockBg
        };
        result.push(currentP);
      } else {
        currentP.endIndex = index;
      }
    });
    if (currentP) currentP.endIndex = ORDER_STEPS.length - 1;
    return result;
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF3] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/home', { state: { activeTab: 'orders' } })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
            >
              <ArrowLeftRight size={14} className="rotate-180" />
              返回列表
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{orderData.id}</h1>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${STATUS_BADGE_COLORS[getOrderStatusColor(orderData.status)]}`}>
                  {orderData.status}
                </span>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-500">{orderData.title}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">订单概算总额</div>
            <div className="flex items-baseline justify-end gap-1">
              {hasCurrencySymbol && <span className="text-xs font-bold text-gray-900">¥</span>}
              <span className="text-4xl font-bold text-gray-900 tabular-nums">{displayAmount}</span>
            </div>
            
            {/* Action Buttons */}
            {foundOrder?.isInteractive && (
              <div className="mt-4 flex justify-end gap-2">
                {currentStatusCode.startsWith('S06') && (
                  <button
                    onClick={() => {
                      if (id) {
                        handleOrderAction(id, 'E82_TERMINATE', data.orders || [], updateData);
                        toast.success('订单已终止');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <AlertTriangle size={14} />
                    终止订单
                  </button>
                )}
                {currentStatusCode === 'S11' && (
                  <button
                    onClick={() => {
                      if (id) {
                        handleOrderAction(id, 'E84_REQUEST_MAINTENANCE', data.orders || [], updateData);
                        toast.success('已申请维保');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <Wrench size={14} />
                    申请维保
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 订单状态进程 Section */}
        <section className="bg-white/45 backdrop-blur-[25px] rounded-[32px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-4 sm:p-6 relative overflow-hidden group">
          <div className={`absolute -top-10 -right-10 w-48 h-48 ${currentStep?.blockBg.replace('/10', '/20') || 'bg-phase-delivery/20'} rounded-full blur-3xl pointer-events-none transition-colors`}></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} />
              订单状态进程
            </h3>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border ${
                isExceptionState 
                  ? 'text-red-600 bg-red-50/50 border-red-200' 
                  : `${currentStep?.blockText || 'text-phase-delivery'} ${currentStep?.blockBg || 'bg-phase-delivery/10'} border-current/20`
              }`}>
                当前状态: {orderData.status}
              </span>
            </div>
          </div>

          <div className="relative z-10 pb-2">
            <div className="relative mt-8 mb-2">
              <button 
                onClick={handlePrev}
                disabled={windowStartIndex === 0}
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm z-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                disabled={windowStartIndex + WINDOW_SIZE >= ORDER_STEPS.length}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm z-30"
              >
                <ChevronRight size={16} />
              </button>

              {/* 预留顶部空间给阶段标签；下方增加与状态节点的间距 */}
              <div className="overflow-hidden px-3 pt-10">
                <motion.div 
                  className="relative flex"
                  animate={{ x: `-${(windowStartIndex / ORDER_STEPS.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  style={{ width: `${(ORDER_STEPS.length * 100) / WINDOW_SIZE}%` }}
                >
                  {/* 阶段标签：边界取相邻节点中点，使各阶段首尾相连、无断点 */}
                  {allPhases.map((p, i) => {
                    const N = ORDER_STEPS.length;
                    const isFirst = i === 0;
                    const isLast = i === allPhases.length - 1;
                    const leftPct = isFirst ? (0.5 / N) * 100 : (p.startIndex / N) * 100;
                    const rightPct = isLast ? ((p.endIndex + 0.5) / N) * 100 : ((p.endIndex + 1) / N) * 100;
                    const width = rightPct - leftPct;

                    return (
                      <div 
                        key={`${p.name}-${p.startIndex}`}
                        className={`absolute top-0 flex items-center pointer-events-none ${p.color}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${width}%`,
                          transform: 'translateY(-100%)'
                        }}
                      >
                        <div className="absolute left-0 top-1/2 h-[2px] bg-current -translate-y-1/2 opacity-30 w-full" />
                        <div className="absolute left-0 top-1/2 w-[2px] h-4 bg-current -translate-y-1/2 opacity-50" />
                        {isLast && (
                          <div className="absolute right-0 top-1/2 w-[2px] h-4 bg-current -translate-y-1/2 opacity-50" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="relative z-10 px-2.5 py-1 text-[9px] font-black tracking-wider bg-white rounded-full whitespace-nowrap shadow-sm border border-current/20 text-current">
                            {p.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Progress Line - 与阶段标签留出间距后对齐节点中心 */}
                  <div 
                    className="absolute top-[44px] h-1 bg-slate-200/30 -z-10 rounded-full"
                    style={{ 
                      left: `${(0.5 / ORDER_STEPS.length) * 100}%`, 
                      width: `${((ORDER_STEPS.length - 1) / ORDER_STEPS.length) * 100}%` 
                    }}
                  ></div>
                  
                  {/* 节点状态：已完成 / 进行中 / 未开始，对应勾选、呼吸灯、灰点；异常状态(S04/S05/S08/S13)高亮为红 */}
                  {ORDER_STEPS.map((step, globalIdx) => {
                    const isCompleted = globalIdx < activeIndex;
                    const isCurrent = globalIdx === activeIndex;
                    const isPending = globalIdx > activeIndex;

                    return (
                      <div 
                        key={step.id} 
                        className={`flex flex-col items-center relative shrink-0 ${isPending ? 'opacity-40' : ''}`} 
                        style={{ width: `${100 / ORDER_STEPS.length}%` }}
                      >
                        {/* Node Circle - mt-7 与阶段区域拉开间距，圆心对齐进度条 */}
                        <div className="mt-7">
                          {isCurrent ? (
                            <div className="relative">
                              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isExceptionState ? 'bg-red-500' : (currentStep?.blockBg.replace('/10', '') || 'bg-phase-delivery')}`}></div>
                              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md ring-2 ring-white/60 backdrop-blur-md ${
                                isExceptionState ? 'bg-gradient-to-br from-red-500 to-red-600' : (currentStep?.blockBg.replace('/10', '') || 'bg-phase-delivery')
                              }`}>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              </div>
                            </div>
                          ) : isCompleted ? (
                            <div className={`w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-sm ${
                              isExceptionState ? 'border-red-200 text-red-500' : `${step.blockText.replace('text-', 'border-')}/30 ${step.blockText}`
                            }`}>
                              <Check size={12} strokeWidth={4} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 text-slate-300 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Label：英文状态码在上、中文在下，居中 */}
                        <div className="mt-3 flex flex-col items-center text-center">
                          <span className={`text-[8px] font-mono font-bold tracking-tighter mb-0.5 ${
                            isCurrent ? (isExceptionState ? 'text-red-600' : step.blockText) :
                            isCompleted ? (isExceptionState ? 'text-red-500' : step.blockText) :
                            'text-slate-400'
                          }`}>
                            {step.id}
                          </span>
                          <span className={`text-[10px] font-bold leading-tight transition-all ${
                            isCurrent ? (isExceptionState ? 'text-red-600 scale-110' : `${step.blockText} scale-110`) :
                            isCompleted ? (isExceptionState ? 'text-red-500' : step.blockText) :
                            'text-slate-400'
                          }`}>
                            {isCurrent ? (isExceptionState ? '异常中断中' : step.label) : step.label}
                          </span>
                          {isCurrent && (
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isExceptionState ? 'bg-red-500' : (currentStep?.blockBg.replace('/10', '') || 'bg-phase-delivery')} animate-bounce`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: Math.ceil((ORDER_STEPS.length - WINDOW_SIZE) / 3) + 1 }).map((_, i) => {
              const isActive = Math.round(windowStartIndex / 3) === i;
              return (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${isActive ? `w-4 ${currentStep?.blockBg.replace('/10', '') || 'bg-phase-delivery'}` : 'w-1 bg-gray-200'}`}
                />
              );
            })}
          </div>
        </section>

        {/* 设计方案 Section */}
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <Layout size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">设计方案与图纸</h2>
            </div>
            {currentStatusCode !== 'S00' && (
              <button
                type="button"
                onClick={() =>
                  navigate('/feedback', {
                    state: { orderNumber: orderData.id, openViewerDirectly: true },
                  })
                }
                className="inline-flex items-center gap-2 bg-[#FF9C3E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#F58B2B] transition-all active:scale-95"
              >
                查看并反馈
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {currentStatusCode === 'S00' ? (
            <div className="p-10 bg-gray-50/50 rounded-[24px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mb-4">
                <Layout size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">暂无设计方案</h3>
              <p className="text-xs text-gray-500 max-w-[240px]">设计师正在为您进行前期规划与意向沟通，请耐心等待。</p>
            </div>
          ) : (() => {
            const designInfo = getDesignVersionInfo(orderData.id);
            const firstPage = getDesignFirstPagePreview(orderData.id);
            const versionName = designInfo?.versionName ?? '当前设计方案';
            const description = designInfo?.description ?? '包含平面布置图、效果图及施工节点大样图，等待您的最终确认。';
            const updatedAt = designInfo?.updatedAt ?? '2023-11-25';
            const statusLabel = designInfo?.statusLabel;
            const openFeedback = () =>
              navigate('/feedback', {
                state: { orderNumber: orderData.id, openViewerDirectly: true },
              });
            return (
              <button
                type="button"
                onClick={openFeedback}
                className="w-full text-left p-0 rounded-[24px] border border-gray-100 bg-gray-50 hover:border-orange-200/80 hover:bg-orange-50/20 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                  {firstPage && (
                    <div className="shrink-0 w-full sm:w-[200px] aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200/80 bg-white shadow-sm">
                      <img
                        src={firstPage.imageUrl}
                        alt={firstPage.pageTitle}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        当前版本：{versionName}
                        {statusLabel && (
                          <span className="ml-2 text-xs font-medium text-slate-500">{statusLabel}</span>
                        )}
                      </h3>
                      {firstPage && (
                        <p className="text-xs font-semibold text-gray-800 mb-1">{firstPage.pageTitle}</p>
                      )}
                      <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-medium text-gray-400">更新于 {updatedAt}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF9C3E] group-hover:text-[#F58B2B]">
                        进入设计反馈
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })()}
        </section>

        {/* 订单报价单 Section */}
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <BarChart3 size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">订单报价单</h2>
            </div>
          </div>

          {currentStatusCode === 'S00' ? (
            <div className="p-10 bg-gray-50/50 rounded-[24px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mb-4">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">暂无报价单</h3>
              <p className="text-xs text-gray-500 max-w-[240px]">正在根据您的意向进行初步核算，请稍后查看。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderData.quotations.map((q, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(`/quotation/${encodeURIComponent(orderData.id)}/${q.ver}`, { 
                    state: { 
                      orderTitle: orderData.title,
                      quotationTitle: q.title
                    } 
                  })}
                  className="group relative flex items-center gap-6 p-5 rounded-[24px] border border-gray-50 hover:border-gray-200 hover:bg-gray-50/30 transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                    q.ver === 'V2' ? 'bg-[#1A1C1E] text-white' : 
                    q.ver === 'V1' ? 'bg-[#8B5CF6] text-white' : 
                    'bg-[#10B981] text-white'
                  }`}>
                    <span className="text-[8px] font-bold opacity-60 uppercase">VER</span>
                    <span className="text-lg font-bold">{q.ver}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-gray-900">{q.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${q.statusColor}`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium tracking-tight">
                      最后更新：{q.time}
                    </p>
                  </div>
                  <div className={`flex items-center justify-center transition-all duration-300 ${
                    q.actionTag === '待反馈' 
                      ? 'w-8 h-8 rounded-full bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white shadow-sm ring-1 ring-red-100/50' 
                      : 'text-gray-300 group-hover:text-gray-900'
                  }`}>
                    <ChevronRight size={q.actionTag === '待反馈' ? 18 : 20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 订单结算单 Section */}
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <LayoutGrid size={18} />
            </div>
            <h2 className="text-base font-bold text-gray-900">订单结算单</h2>
          </div>

          {activeIndex >= 6 ? (
            <div 
              onClick={() => navigate(`/settlement/${id}`, {
                state: {
                  orderNumber: orderData.id,
                  orderTitle: orderData.title,
                  settlementTitle: 'EPC 项目最终结算单',
                  ver: 'V1'
                }
              })}
              className="group relative flex items-center gap-6 p-5 rounded-[24px] border border-orange-50 bg-orange-50/10 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EF6B00] text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-gray-900">EPC 项目最终结算单</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${settlementStatusColor}`}>
                    {settlementStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium tracking-tight">
                  包含设计、货品及施工的所有最终核算数据
                </p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-[#EF6B00] group-hover:bg-[#EF6B00] group-hover:text-white transition-all duration-300">
                <ChevronRight size={18} />
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                <div className="animate-pulse">
                  <Hourglass size={32} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">结算流程尚未开启</h3>
                <p className="text-xs text-gray-400 font-medium">
                  结算单将在进入验收阶段（S07）后基于实际完成量生成。
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              云端连接正常
            </div>
            <div>同步节点: 东亚-01</div>
          </div>
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            V4.5.0 PREMIUM
          </div>
        </div>
      </div>
    </div>
  )
}
