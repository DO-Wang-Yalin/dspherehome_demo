import { Package } from 'lucide-react';

interface ProductItem {
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

interface ProductDetailsProps {
  items: ProductItem[];
  total: number;
}

export function ProductDetails({ items, total }: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-card hover:shadow-xl transition-all duration-300 p-6 mb-24 border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#7BC80E] p-3 rounded-xl shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[30px] font-black text-[#0A0A0A]">严选精品结算明细</h2>
          </div>
        </div>
      </div>

      <div className="animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#7BC80E]/20 bg-green-50">
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">严选臻品明细编码</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">订单类型</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">销售订单</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">单位</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价数量</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单价</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价金额</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap bg-green-100/50">结算数量</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap bg-green-100/50">结算金额</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">结算备注</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="border-b border-[#E5E7EB] hover:bg-green-50/30 transition-colors"
                >
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.epcCode}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.orderType}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.salesOrder}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationQuantity}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationUnitPrice.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationAmount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] font-bold text-[#7BC80E] text-right bg-green-50/50">{item.settlementQuantity}</td>
                  <td className="py-4 px-4 text-[16px] font-bold text-[#7BC80E] text-right bg-green-50/50">{item.settlementAmount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] text-[#6B7280] italic">{item.settlementRemark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50 border-t-2 border-[#7BC80E]/30">
                <td colSpan={10} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">货品费用结算合计：</td>
                <td colSpan={2} className="py-4 px-4 text-[30px] font-black text-[#7BC80E] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}