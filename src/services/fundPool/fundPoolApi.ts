/**
 * 客户资金池 API
 *
 * 后端可提供：
 * GET {BASE}/fund-pool
 * 返回: { totalAmount, projectAllocations, pendingAllocation }
 *
 * 当前使用 mock 数据
 */

export interface ProjectAllocation {
  projectId: string;
  projectName?: string;
  /** 项目总预算（元），进度条总额 */
  totalBudget: number;
  /** 已从资金池划分到该项目的资金（元），进度条已填充部分 */
  amount: number;
}

export interface FundPool {
  /** 资金池总额（元） */
  totalAmount: number;
  /** 按项目分配的资金明细 */
  projectAllocations: ProjectAllocation[];
  /** 待分配资金（尚未分配到项目的金额，元） */
  pendingAllocation: number;
}

const STORAGE_KEY = 'ai-studio:fund-pool:v2';

const DEFAULT_FUND_POOL: FundPool = {
  totalAmount: 580000,
  projectAllocations: [
    { projectId: '1', projectName: '静安·云境公寓（示例项目）', totalBudget: 450000, amount: 185000 },
    { projectId: '2', projectName: '滨江翠苑 120 ㎡', totalBudget: 180000, amount: 95000 },
    { projectId: '3', projectName: '万科翡翠公园复式', totalBudget: 120000, amount: 40000 },
  ],
  pendingAllocation: 260000,
};

function loadFromStorage(): FundPool {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FUND_POOL };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.totalAmount !== 'number') return { ...DEFAULT_FUND_POOL };
    const allocations = Array.isArray(parsed.projectAllocations)
      ? parsed.projectAllocations
          .filter(
            (a: unknown) =>
              a && typeof a === 'object' && 'projectId' in a && 'amount' in a && typeof (a as { amount: unknown }).amount === 'number'
          )
          .map((a: { projectId: string; projectName?: string; totalBudget?: number; amount: number }) => ({
            projectId: a.projectId,
            projectName: a.projectName,
            totalBudget: typeof a.totalBudget === 'number' ? a.totalBudget : a.amount,
            amount: a.amount,
          }))
      : DEFAULT_FUND_POOL.projectAllocations;
    return {
      totalAmount: parsed.totalAmount ?? DEFAULT_FUND_POOL.totalAmount,
      projectAllocations: allocations,
      pendingAllocation: parsed.pendingAllocation ?? DEFAULT_FUND_POOL.pendingAllocation,
    };
  } catch {
    return { ...DEFAULT_FUND_POOL };
  }
}

/** 获取当前客户的资金池信息 */
export function getFundPool(): Promise<FundPool> {
  return Promise.resolve(loadFromStorage());
}
