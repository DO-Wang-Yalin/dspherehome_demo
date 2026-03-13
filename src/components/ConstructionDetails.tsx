import { Hammer } from "lucide-react";
import { SettlementSection, SettlementItem } from "./SettlementSection";

interface ConstructionDetailsProps {
  items: SettlementItem[];
  total: number;
}

export function ConstructionDetails({ items, total }: ConstructionDetailsProps) {
  return (
    <SettlementSection
      icon={<Hammer className="w-6 h-6 text-white" />}
      title="精工交付结算明细"
      themeColor="purple"
      items={items}
      total={total}
      footerLabel="施工费用结算合计："
      idColumnHeader="精工交付明细编码"
    />
  );
}
