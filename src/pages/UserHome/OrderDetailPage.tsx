import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Layout, FileText, CreditCard, Package } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF3] p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-[#FF9C3E]" />
              <span className="text-xs font-semibold text-[#FF9C3E] uppercase tracking-wider">订单详情</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">订单编号: {id}</h1>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 设计方案板块 */}
          <button
            onClick={() => navigate('/feedback')}
            className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layout size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">设计方案</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              查看您的专属空间设计方案，包含效果图与施工图纸，并可在线提交反馈意见。
            </p>
            <div className="mt-6 text-[#FF9C3E] font-semibold text-sm flex items-center gap-1">
              立即进入 <ChevronLeft size={16} className="rotate-180" />
            </div>
          </button>

          {/* 报价单板块 */}
          <button
            className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">报价单</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              详细的项目物料清单、单价及人工费用明细，确保每一分支出都清晰透明。
            </p>
            <div className="mt-6 text-blue-500 font-semibold text-sm flex items-center gap-1">
              查看详情 <ChevronLeft size={16} className="rotate-180" />
            </div>
          </button>

          {/* 结算单板块 */}
          <button
            className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">结算单</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              项目各阶段的实际结算记录、支付状态及发票信息，方便您随时对账。
            </p>
            <div className="mt-6 text-emerald-500 font-semibold text-sm flex items-center gap-1">
              查看记录 <ChevronLeft size={16} className="rotate-180" />
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            如有任何疑问，请联系您的专属设计师或拨打客服热线：400-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  );
}
