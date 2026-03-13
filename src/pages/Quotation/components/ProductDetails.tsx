import { Package } from 'lucide-react';

interface ProductItem {
  id: number;
  item: string;
  brand: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
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
            <h2 className="text-[30px] font-black text-[#0A0A0A]">严选精品报价明细</h2>
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
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单类型</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] min-w-[200px]">产品标签</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">品牌</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品规格</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品尺寸</th>
                <th className="text-center py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品附图</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品单位</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品数量</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品含税单价 CNY</th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">产品含税总价 CNY</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="border-b border-[#E5E7EB] hover:bg-green-50/30 transition-colors"
                >
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">P-{2001 + index}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">QT- O订购</td>
                  <td className="py-4 px-4 text-[16px] font-normal text-[#0A0A0A]">{item.item}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    <span className="inline-block px-2 py-1 bg-green-100 text-[#0A0A0A] rounded-xl text-[12px] font-medium">
                      {item.brand}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">-</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">-</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-center">-</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quantity}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50 border-t-2 border-[#7BC80E]/30">
                <td colSpan={11} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">货品费用合计：</td>
                <td className="py-4 px-4 text-[30px] font-black text-[#7BC80E] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}