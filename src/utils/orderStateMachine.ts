export const ORDER_TRANSITIONS: Record<string, Record<string, string>> = {
  'E80_SIGN_QUOTATION': {
    'S01-意向沟通中': 'S02-01 提案设计中',
    'S03-订购确认中': 'S06-01 交付设计中',
  },
  'E86_FEEDBACK': {
    'S03-订购确认中': 'S02-01 提案设计中',
    'S06-02 方案汇报中': 'S06-01 交付设计中',
    'S06-05 交付内审中': 'S06-04 交付施工中',
  },
  'E82_TERMINATE': {
    'S06-04 交付施工中': 'S08-订单终止中',
    'S06-01 交付设计中': 'S08-订单终止中',
    'S06-02 方案汇报中': 'S08-订单终止中',
    'S06-03 交付备货中': 'S08-订单终止中',
    'S06-05 交付内审中': 'S08-订单终止中',
  },
  'E83_REQUIRE_REWORK': {
    'S07-订单验收中': 'S09-订单整改中',
  },
  'E85_SIGN_SETTLEMENT': {
    'S07-订单验收中': 'S11-订单已交付',
  },
  'E84_REQUEST_MAINTENANCE': {
    'S11-订单已交付': 'S10-订单维保中',
  }
};

export function handleOrderAction(
  orderId: string, 
  actionCode: string, 
  orders: any[], 
  updateData: (data: any) => void
) {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return false;

  const order = orders[orderIndex];
  const nextState = ORDER_TRANSITIONS[actionCode]?.[order.status];

  if (nextState) {
    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = { 
      ...order, 
      status: nextState,
      feedbackSubmitted: actionCode === 'E86_FEEDBACK' ? true : order.feedbackSubmitted
    };
    updateData({ orders: updatedOrders });
    return nextState;
  }
  return false;
}
