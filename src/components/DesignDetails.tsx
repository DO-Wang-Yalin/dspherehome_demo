import { Pencil } from "lucide-react";
import { SettlementSection, SettlementItem } from "./SettlementSection";

interface DesignDetailsProps {
  items: SettlementItem[];
  total: number;
}

export function DesignDetails({ items, total }: DesignDetailsProps) {
  return (
    <SettlementSection
      icon={<Pencil className="w-6 h-6 text-white" />}
      title="高端设计结算明细"
      themeColor="blue"
      items={items}
      total={total}
      footerLabel="设计费用结算合计："
      idColumnHeader="高端设计明细编码"
    />
  );
}
