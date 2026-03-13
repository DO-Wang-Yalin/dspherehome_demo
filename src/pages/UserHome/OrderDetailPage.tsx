import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Bot, BarChart3, ChevronRight, LayoutGrid, Hourglass, Layout, Activity, Check, FileText } from 'lucide-react';
import { getOrderStatusColor, STATUS_BADGE_COLORS } from '../../utils/orderStatus';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the order data from the mock data, or use a default if not found
  const orderData = {
    id: id || 'PSO-OD_SZYWZD-00007',
    title: '铝合金智能化幕墙采购与施工订单',
    status: 'S06-01 交付设计中',
    statusColor: 'blue',
    totalAmount: '250,000',
    quotations: [
      { ver: 'V2', title: '订购报价单', status: '已查看未签字', statusColor: 'bg-orange-50 text-orange-600', actionTag: '待反馈', actionTagColor: 'bg-red-50 text-red-600 border border-red-100', time: '2023-11-24 15:00' },
      { ver: 'V1', title: '订购报价单', status: '已查看未签字', statusColor: 'bg-orange-50 text-orange-600', actionTag: '已反馈', actionTagColor: 'bg-blue-50 text-blue-600 border border-blue-100', time: '2023-11-10 10:00' },
      { ver: 'V0', title: '意向报价单', status: '已查看已签字', statusColor: 'bg-emerald-50 text-emerald-600', time: '2023-10-20 09:00' },
    ]
  }

  // We need to fetch the real order data based on the ID to match the list
  // For now, we'll try to extract info from the ID if it matches our mock data format
  if (id === 'PSO-OD_LHJCF-00471') {
    orderData.title = '瓷砖铺贴-公卫、次卫、厨房墙地铺贴'
    orderData.status = 'S11-订单已交付'
    orderData.statusColor = 'emerald'
    orderData.totalAmount = '57,500'
  } else if (id === 'PSO-OD_LHJCF-00567') {
    orderData.title = '全屋-石材安装'
    orderData.status = 'S00-意向报价中'
    orderData.statusColor = 'gray'
    orderData.totalAmount = '待定'
  } else if (id === 'PSO-OD_LHJCF-00612') {
    orderData.title = '橱柜柜体定制'
    orderData.status = 'S05-客户决策中'
    orderData.statusColor = 'gray'
    orderData.totalAmount = '32,800'
  } else if (id === 'PSO-OD_LHJCF-00623') {
    orderData.title = '一层、负一层-天花吊顶'
    orderData.status = 'S06-04 交付施工中'
    orderData.statusColor = 'blue'
    orderData.totalAmount = '12,000'
  }

  const currentStatusPrefix = orderData.status.substring(0, 3);
  
  const ORDER_STEPS = [
    { id: 'S00', label: '意向报价' },
    { id: 'S01', label: '意向沟通' },
    { id: 'S02', label: '订单深化' },
    { id: 'S03', label: '订购确认' },
    { id: 'S05', label: '客户决策' },
    { id: 'S06', label: '订单交付' },
    { id: 'S07', label: '订单验收' },
    { id: 'S09', label: '订单整改' },
    { id: 'S10', label: '订单维保' },
    { id: 'S11', label: '订单已交付' },
    { id: 'S12', label: '订单已结束' },
  ];

  let activeIndex = ORDER_STEPS.findIndex(s => s.id === currentStatusPrefix);
  let isExceptionState = false;

  if (activeIndex === -1) {
    isExceptionState = true;
    if (currentStatusPrefix === 'S04') activeIndex = 3; // 婉拒 (after 订购确认)
    else if (currentStatusPrefix === 'S08') activeIndex = 6; // 终止 (after 订单验收)
    else if (currentStatusPrefix === 'S13') activeIndex = 0; // 休眠
    else activeIndex = 0;
  }

  const progressPercentage = ORDER_STEPS.length > 1 ? (activeIndex / (ORDER_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FFFDF3] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(-1)}
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
              {orderData.totalAmount !== '待定' && <span className="text-xs font-bold text-gray-900">¥</span>}
              <span className="text-4xl font-bold text-gray-900 tabular-nums">{orderData.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* 订单颗粒度进程 Section */}
        <section className="bg-white/45 backdrop-blur-[25px] rounded-[32px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#17a1cf]/20 rounded-full blur-3xl pointer-events-none transition-colors"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} />
              订单颗粒度进程
            </h3>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border ${
              isExceptionState 
                ? 'text-red-600 bg-red-50/50 border-red-200' 
                : 'text-[#17a1cf] bg-[#17a1cf]/10 border-[#17a1cf]/20'
            }`}>
              当前状态: {orderData.status}
            </span>
          </div>

          <div className="relative z-10 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
            <div className="min-w-[800px] relative mt-2">
              <div className="absolute top-5 left-0 w-full h-1 bg-slate-200/50 -z-10 rounded-full"></div>
              <div 
                className={`absolute top-5 left-0 h-1 -z-10 rounded-full transition-all duration-1000 ${
                  isExceptionState ? 'bg-gradient-to-r from-red-300 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-r from-emerald-300 to-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              <div className="flex justify-between w-full">
                {ORDER_STEPS.map((step, index) => {
                  const isCompleted = index < activeIndex;
                  const isCurrent = index === activeIndex;
                  const isPending = index > activeIndex;

                  return (
                    <div key={step.id} className={`flex flex-col items-center gap-3 ${isPending ? 'opacity-50' : ''} ${isCurrent ? 'relative z-10 transform -translate-y-1' : ''}`}>
                      {isCurrent ? (
                        <div className="relative">
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isExceptionState ? 'bg-red-500' : 'bg-[#17a1cf]'}`}></div>
                          <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg ring-4 ring-white/40 backdrop-blur-md ${
                            isExceptionState ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-[#17a1cf] to-blue-500'
                          }`}>
                            <span className="text-sm font-bold tracking-tight">{step.id}</span>
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <div className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-[4px] border border-white/50 flex items-center justify-center shadow-sm ring-2 ring-white/60 ${
                          isExceptionState ? 'text-red-500' : 'text-emerald-600'
                        }`}>
                          <Check size={18} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-[4px] border border-white/50 text-slate-400 flex items-center justify-center ring-1 ring-white/40">
                          <span className="text-[10px] font-bold">{step.id}</span>
                        </div>
                      )}

                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${
                          isCurrent ? (isExceptionState ? 'text-red-600' : 'text-[#17a1cf]') :
                          isCompleted ? (isExceptionState ? 'text-red-500' : 'text-emerald-600') :
                          'text-slate-500'
                        }`}>
                          {isCurrent ? (isExceptionState ? '异常中断' : step.label) : step.label}
                        </span>
                        {isCurrent && (
                          <span className={`text-[9px] text-white font-bold mt-1 px-2 py-0.5 rounded-full shadow-sm ${
                            isExceptionState ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-[#17a1cf] to-blue-400'
                          }`}>
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
            {currentStatusPrefix !== 'S00' && (
              <button 
                onClick={() => navigate('/feedback')}
                className="inline-flex items-center gap-2 bg-[#FF9C3E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#F58B2B] transition-all active:scale-95"
              >
                查看并反馈
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {currentStatusPrefix === 'S00' ? (
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

          {currentStatusPrefix === 'S00' ? (
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
                      orderTitle: orderData.title 
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
                      {q.actionTag && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${q.actionTagColor}`}>
                          {q.actionTag}
                        </span>
                      )}
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
                  orderTitle: orderData.title
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                    待确认
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
