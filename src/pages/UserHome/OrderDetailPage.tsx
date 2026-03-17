import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeftRight, Bot, BarChart3, ChevronRight, ChevronLeft, LayoutGrid, Hourglass, Layout, Activity, Check, FileText, AlertTriangle, Wrench } from 'lucide-react';
import { getOrderStatusColor, STATUS_BADGE_COLORS } from '../../utils/orderStatus';
import { useGlobal } from '../../context/GlobalContext';
import { INITIAL_ORDERS } from '../../data/mockOrders';
import { handleOrderAction } from '../../utils/orderStateMachine';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, updateData } = useGlobal();

  // Find the order data from the global state
  const orders = data.orders && data.orders.length > 0 ? data.orders : INITIAL_ORDERS;
  const foundOrder = orders.find((o: any) => o.id === id);

  const currentStatusCode = foundOrder?.status.match(/^S\d{2}(-\d{2})?/)?.[0] || 'S06-01';
  
  const ORDER_STEPS = [
    // 意向期
    { id: 'S00', label: '意向报价中', phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    { id: 'S01', label: '意向沟通中', phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    { id: 'S05', label: '客户决策中', phase: '意向期', blockBg: 'bg-phase-intention/10', blockText: 'text-phase-intention' },
    // 订购期
    { id: 'S02-01', label: '提案设计中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S02-02', label: '订购报价中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    { id: 'S03', label: '订购确认中', phase: '订购期', blockBg: 'bg-phase-ordering/10', blockText: 'text-phase-ordering' },
    // 交付期
    { id: 'S06-01', label: '交付设计中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-02', label: '方案汇报中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-03', label: '交付备货中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-04', label: '交付施工中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S06-05', label: '交付内审中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    { id: 'S13', label: '订单休眠中', phase: '交付期', blockBg: 'bg-phase-delivery/10', blockText: 'text-phase-delivery' },
    // 验收期
    { id: 'S07', label: '订单验收中', phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    { id: 'S09', label: '订单整改中', phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    { id: 'S08', label: '订单终止中', phase: '验收期', blockBg: 'bg-phase-acceptance/10', blockText: 'text-phase-acceptance' },
    // 维保期
    { id: 'S11', label: '订单已交付', phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    { id: 'S10', label: '订单维保中', phase: '维保期', blockBg: 'bg-phase-maintenance/10', blockText: 'text-phase-maintenance' },
    // 结束
    { id: 'S12', label: '订单已结束', phase: '结束', blockBg: 'bg-gray-100/50', blockText: 'text-gray-500' },
  ];

  const currentStep = ORDER_STEPS.find(s => s.id === currentStatusCode);
  const currentPhase = currentStep?.phase || '';

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

    // 3. 意向报价单: S00 之后可见
    if (currentStatusCode !== 'S00') {
      const isSigned = currentStatusCode !== 'S01' && currentStatusCode !== 'S05';
      const statusInfo = getUnifiedStatus(isViewed, isSigned, false);
      list.push({ 
        ver: 'V0', 
        title: '意向报价单', 
        status: statusInfo.text, 
        statusColor: statusInfo.color, 
        time: '2023-10-20 09:00' 
      });
    }

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

  let activeIndex = ORDER_STEPS.findIndex(s => s.id === currentStatusCode);
  const exceptionCodes = ['S04', 'S05', 'S08', 'S13'];
  let isExceptionState = exceptionCodes.includes(currentStatusCode);

  if (activeIndex === -1) {
    if (currentStatusCode === 'S04') activeIndex = 1; // 婉拒映射到意向沟通
    else activeIndex = 0;
  }

  const progressPercentage = ORDER_STEPS.length > 1 ? (activeIndex / (ORDER_STEPS.length - 1)) * 100 : 0;

  // Sliding window state
  const WINDOW_SIZE = 6;
  const [windowStartIndex, setWindowStartIndex] = useState(0);

  useEffect(() => {
    // Center the window around activeIndex
    let start = Math.max(0, activeIndex - Math.floor(WINDOW_SIZE / 2));
    // Ensure we don't go out of bounds at the end
    if (start + WINDOW_SIZE > ORDER_STEPS.length) {
      start = Math.max(0, ORDER_STEPS.length - WINDOW_SIZE);
    }
    setWindowStartIndex(start);
  }, [activeIndex]);

  const handlePrev = () => {
    setWindowStartIndex(prev => Math.max(0, prev - 3));
  };

  const handleNext = () => {
    setWindowStartIndex(prev => Math.min(ORDER_STEPS.length - WINDOW_SIZE, prev + 3));
  };

  // Phase English labels mapping
  const PHASE_EN_MAP: Record<string, string> = {
    '意向期': 'INT',
    '订购期': 'ORD',
    '交付期': 'DEL',
    '验收期': 'ACC',
    '维保期': 'MNT',
    '结束': 'FIN'
  };

  // Calculate all phases for the entire timeline
  const allPhases = useMemo(() => {
    const result = [];
    let currentP = null;

    ORDER_STEPS.forEach((step, index) => {
      if (!currentP || currentP.name !== step.phase) {
        if (currentP) {
          currentP.endIndex = index - 1;
        }
        currentP = {
          name: step.phase,
          en: PHASE_EN_MAP[step.phase] || '',
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
        <section className="bg-white/45 backdrop-blur-[25px] rounded-[32px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-6 sm:p-8 relative overflow-hidden group">
          <div className={`absolute -top-10 -right-10 w-64 h-64 ${currentStep?.blockBg.replace('/10', '/20') || 'bg-phase-delivery/20'} rounded-full blur-3xl pointer-events-none transition-colors`}></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
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

          <div className="relative z-10 pb-4">
            <div className="relative mt-16 mb-4">
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

              <div className="overflow-hidden px-4">
                <motion.div 
                  className="relative flex"
                  animate={{ x: `-${(windowStartIndex / ORDER_STEPS.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  style={{ width: `${(ORDER_STEPS.length * 100) / WINDOW_SIZE}%` }}
                >
                  {/* Phase Brackets */}
                  {allPhases.map((p, i) => {
                    const isLast = i === allPhases.length - 1;
                    
                    const left = (p.startIndex / ORDER_STEPS.length) * 100;
                    const width = ((p.endIndex - p.startIndex + 1) / ORDER_STEPS.length) * 100;

                    return (
                      <div 
                        key={`${p.name}-${p.startIndex}`}
                        className={`absolute -top-10 flex items-center ${p.color}`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`
                        }}
                      >
                        <div className="absolute left-0 top-1/2 h-[2px] bg-current -translate-y-1/2 opacity-20 w-full"></div>
                        <div className="absolute left-0 top-1/2 w-[2px] h-4 bg-current -translate-y-1/2 opacity-40"></div>
                        {isLast && (
                          <div className="absolute right-0 top-1/2 w-[2px] h-4 bg-current -translate-y-1/2 opacity-40"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="relative z-10 px-2 py-0.5 text-[9px] font-black tracking-[0.1em] bg-white rounded-full uppercase whitespace-nowrap shadow-sm border border-current/10 flex items-center gap-1">
                            <span className="opacity-50 font-mono">{p.en}</span>
                            <span>{p.name}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Progress Line - Aligned to node centers */}
                  <div 
                    className="absolute top-[34px] h-1 bg-slate-200/30 -z-10 rounded-full"
                    style={{ 
                      left: `${(0.5 / ORDER_STEPS.length) * 100}%`, 
                      width: `${((ORDER_STEPS.length - 1) / ORDER_STEPS.length) * 100}%` 
                    }}
                  ></div>
                  
                  {/* Steps */}
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
                        {/* English Code */}
                        <span className={`absolute -top-6 text-[8px] font-mono font-bold tracking-tighter ${
                          isCurrent ? step.blockText : 'text-slate-400'
                        }`}>
                          {step.id}
                        </span>

                        {/* Node Circle */}
                        <div className="mt-4">
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

                        {/* Label */}
                        <div className="mt-3 flex flex-col items-center">
                          <span className={`text-[10px] font-bold text-center leading-tight transition-all ${
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
          <div className="mt-6 flex justify-center gap-1.5">
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
                onClick={() => navigate('/feedback', { state: { orderNumber: orderData.id } })}
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
          ) : (
            <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">当前版本：V3 终稿设计方案</h3>
                <p className="text-xs text-gray-500">包含平面布置图、效果图及施工节点大样图，等待您的最终确认。</p>
              </div>
              <div className="text-xs font-medium text-gray-400 shrink-0">更新于 2023-11-25</div>
            </div>
          )}
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
                  onClick={() => navigate('/quotation', { 
                    state: { 
                      orderNumber: orderData.id, 
                      orderTitle: orderData.title,
                      ver: q.ver,
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
