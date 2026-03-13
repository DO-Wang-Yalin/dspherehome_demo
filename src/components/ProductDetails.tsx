import { Package } from "lucide-react";
import { SettlementSection, SettlementItem } from "./SettlementSection";

interface ProductDetailsProps {
  items: SettlementItem[];
  total: number;
}

export function ProductDetails({ items, total }: ProductDetailsProps) {
  return (
    <SettlementSection
      icon={<Package className="w-6 h-6 text-white" />}
      title="严选臻品结算明细"
      themeColor="green"
      items={items}
      total={total}
      footerLabel="货品费用结算合计："
      idColumnHeader="严选臻品明细编码"
    />
  );
}
