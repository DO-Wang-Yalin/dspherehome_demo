import React from 'react';
import { FileText, User, MapPin, CheckCircle2, AlertCircle, Hammer, Palette } from 'lucide-react';
import SettlementTable from '../../components/SettlementTable';

export default function SettlementDetailsPage() {
  const settlementData = {
    orderNumber: 'EPC-2026-0115-001',
    customerName: '张先生',
    projectAddress: '上海市浦东新区世纪大道1000号',
    totalAmount: 280000,
    categories: [
      {
        title: '高端设计结算明细',
        icon: <Palette className="w-6 h-6 text-[#EF6B00]" />,
        total: 36000,
        items: [
          { id: 1, code: 'E-1001', type: 'PSO-E 高端设计', orderNumber: 'SO2026031301', unit: '套', quantity: 1, price: 8000, amount: 8000, note: '按原方案执行' },
          { id: 2, code: 'E-1002', type: 'PSO-E 高端设计', orderNumber: 'SO2026031301', unit: '张', quantity: 4, price: 3000, amount: 12000, note: '加急渲染图' },
        ]
      },
      {
        title: '严选精品结算明细',
        icon: <FileText className="w-6 h-6 text-[#EF6B00]" />,
        total: 156000,
        items: [
          { id: 1, code: 'P-2001', type: 'PSO-P 严选精品', orderNumber: 'SO2026031302', unit: '㎡', quantity: 40, price: 280, amount: 11200, note: '型号 M123' },
        ]
      },
      {
        title: '匠心施工结算明细',
        icon: <Hammer className="w-6 h-6 text-[#EF6B00]" />,
        total: 88000,
        items: [
          { id: 1, code: 'C-3001', type: 'PSO-C 匠心施工', orderNumber: 'SO2026031303', unit: '㎡', quantity: 25, price: 180, amount: 4500, note: '已完工验收' },
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">EPC结算单</h1>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> 客户姓名: {settlementData.customerName}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 项目地址: {settlementData.projectAddress}</div>
              </div>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-600">
              销售订单: {settlementData.orderNumber}
            </div>
          </div>

          {/* 总览 */}
          <div className="bg-[#EF6B00] text-white rounded-2xl p-8">
            <div className="text-lg opacity-90 mb-2">结算总价</div>
            <div className="text-5xl font-black mb-8">¥{settlementData.totalAmount.toLocaleString()}</div>
            <div className="grid grid-cols-3 gap-4">
              {settlementData.categories.map((c, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-80 mb-1">{c.title.replace('结算明细', '结算')}</div>
                  <div className="text-2xl font-bold">¥{c.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 明细表格区域 */}
        {settlementData.categories.map((category, i) => (
          <SettlementTable 
            key={i} 
            title={category.title} 
            icon={category.icon} 
            items={category.items} 
            total={category.total} 
          />
        ))}
        
        {/* 底部按钮 */}
        <div className="flex gap-4 mt-8">
          <button className="flex-1 bg-[#EF6B00] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> 确认结算
          </button>
          <button className="flex-1 bg-white border border-gray-300 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" /> 结算异议
          </button>
        </div>
      </div>
    </div>
  );
}
