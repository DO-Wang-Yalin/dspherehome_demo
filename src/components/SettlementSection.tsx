import React, { ReactNode } from 'react';

export interface SettlementItem {
  id: number;
  epcCode: string;
  orderType: string;
  salesOrder: string;
  unit: string;
  quotationQuantity: number;
  quotationUnitPrice: number;
  quotationAmount: number;
  settlementQuantity: number;
  settlementAmount: number;
  settlementRemark: string;
}

interface SettlementSectionProps {
  icon: ReactNode;
  title: string;
  themeColor: 'blue' | 'green' | 'purple';
  items: SettlementItem[];
  total: number;
  footerLabel: string;
  idColumnHeader: string;
}

export function SettlementSection({
  icon,
  title,
  themeColor,
  items,
  total,
  footerLabel,
  idColumnHeader
}: SettlementSectionProps) {
  const themes = {
    blue: {
      iconBg: 'bg-[#4887FF]',
      border: 'border-[#4887FF]/20',
      headerBg: 'bg-blue-50',
      settlementHeaderBg: 'bg-blue-100/50',
      rowHover: 'hover:bg-blue-50/30',
      settlementCellBg: 'bg-blue-50/50',
      textAccent: 'text-[#4887FF]',
      borderAccent: 'border-[#4887FF]/30'
    },
    green: {
      iconBg: 'bg-[#7BC80E]',
      border: 'border-[#7BC80E]/20',
      headerBg: 'bg-green-50',
      settlementHeaderBg: 'bg-green-100/50',
      rowHover: 'hover:bg-green-50/30',
      settlementCellBg: 'bg-green-50/50',
      textAccent: 'text-[#7BC80E]',
      borderAccent: 'border-[#7BC80E]/30'
    },
    purple: {
      iconBg: 'bg-[#B300FA]',
      border: 'border-[#B300FA]/20',
      headerBg: 'bg-purple-50',
      settlementHeaderBg: 'bg-purple-100/50',
      rowHover: 'hover:bg-purple-50/30',
      settlementCellBg: 'bg-purple-50/50',
      textAccent: 'text-[#B300FA]',
      borderAccent: 'border-[#B300FA]/30'
    }
  };

  const theme = themes[themeColor];

  return (
    <div className="bg-white rounded-[24px] shadow-card hover:shadow-xl transition-all duration-300 p-6 mb-24 border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${theme.iconBg} p-3 rounded-xl shadow-md`}>
            {icon}
          </div>
          <div>
            <h2 className="text-[30px] font-black text-[#0A0A0A]">{title}</h2>
          </div>
        </div>
      </div>

      <div className="animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 ${theme.border} ${theme.headerBg}`}>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">{idColumnHeader}</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">订单类型</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">销售订单</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">单位</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价数量</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单价</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价金额</th>
                <th className={`text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap ${theme.settlementHeaderBg}`}>结算数量</th>
                <th className={`text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap ${theme.settlementHeaderBg}`}>结算金额</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">结算备注</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-[#E5E7EB] ${theme.rowHover} transition-colors`}
                >
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.epcCode}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.orderType}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.salesOrder}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationQuantity}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationUnitPrice.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationAmount.toLocaleString()}</td>
                  <td className={`py-4 px-4 text-[16px] font-bold ${theme.textAccent} text-right ${theme.settlementCellBg}`}>{item.settlementQuantity}</td>
                  <td className={`py-4 px-4 text-[16px] font-bold ${theme.textAccent} text-right ${theme.settlementCellBg}`}>{item.settlementAmount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] text-[#6B7280] italic">{item.settlementRemark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={`${theme.headerBg} border-t-2 ${theme.borderAccent}`}>
                <td colSpan={9} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">{footerLabel}</td>
                <td colSpan={2} className={`py-4 px-4 text-[30px] font-black ${theme.textAccent} text-right rounded-br-xl`}>¥{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
