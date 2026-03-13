import React from 'react';

interface TableItem {
  id: number;
  code: string;
  type: string;
  orderNumber: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
}

interface SettlementTableProps {
  key?: React.Key;
  title: string;
  icon: React.ReactNode;
  items: TableItem[];
  total: number;
}

export default function SettlementTable({ title, icon, items, total }: SettlementTableProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">序号</th>
              <th className="py-3 px-4">EPC明细编码</th>
              <th className="py-3 px-4">工单类型</th>
              <th className="py-3 px-4">销售订单</th>
              <th className="py-3 px-4">报价单位</th>
              <th className="py-3 px-4">报价数量</th>
              <th className="py-3 px-4">报价单价</th>
              <th className="py-3 px-4">报价金额</th>
              <th className="py-3 px-4">结算数量</th>
              <th className="py-3 px-4">结算金额</th>
              <th className="py-3 px-4">结算说明</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="py-4 px-4">{item.id}</td>
                <td className="py-4 px-4">{item.code}</td>
                <td className="py-4 px-4">{item.type}</td>
                <td className="py-4 px-4">{item.orderNumber}</td>
                <td className="py-4 px-4">{item.unit}</td>
                <td className="py-4 px-4">{item.quantity}</td>
                <td className="py-4 px-4">{item.price.toLocaleString()}</td>
                <td className="py-4 px-4">{item.amount.toLocaleString()}</td>
                <td className="py-4 px-4">{item.quantity}</td>
                <td className="py-4 px-4 font-bold">{item.amount.toLocaleString()}</td>
                <td className="py-4 px-4 text-gray-500">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-right font-bold text-lg text-[#EF6B00]">
        费用结算合计: ¥{total.toLocaleString()}
      </div>
    </div>
  );
}
