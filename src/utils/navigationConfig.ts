export type NavStep = {
  id: string;
  title: string;
  path: string;
  search?: string;
  qId?: string;
  /** 原属家居风格测评，已并入深度测评 — 目录中展示标记 */
  fromStyleEval?: boolean;
};

export const NAVIGATION_STEPS: NavStep[] = [
  { id: 'welcome', title: '首页', path: '/' },
  { id: 'style-eval', title: '家居风格测评', path: '/style-eval' },
  { id: 'leads-1', title: '项目概况', path: '/leads', search: '?step=1', qId: 'DE-1' },
  { id: 'leads-2', title: '您的信息', path: '/leads', search: '?step=2', qId: 'DE-2' },
  { id: 'budget', title: '项目预算拆解', path: '/budget-breakdown' },
  { id: 'register', title: '注册', path: '/register' },
  { id: 'q2-4', title: '房型资料同步', path: '/deep-eval', search: '?step=0', qId: 'Q1' },
  { id: 'q2-5', title: '房屋现状', path: '/deep-eval', search: '?step=1', qId: 'Q2' },
  {
    id: 'style-q8',
    title: '居住定位',
    path: '/deep-eval',
    search: '?step=2',
    qId: 'Q3',
    fromStyleEval: true,
  },
  {
    id: 'style-q9',
    title: '同住成员',
    path: '/deep-eval',
    search: '?step=3',
    qId: 'Q4',
    fromStyleEval: true,
  },
  { id: 'q2-6', title: '核心成员', path: '/deep-eval', search: '?step=4', qId: 'Q5' },
  { id: 'q2-6-1', title: '家庭成员', path: '/deep-eval', search: '?step=5', qId: 'Q6' },
  { id: 'q2-7', title: '协作方式', path: '/deep-eval', search: '?step=6', qId: 'Q7' },
  { id: 'q2-8', title: '计划节奏', path: '/deep-eval', search: '?step=7', qId: 'Q8' },
  { id: 'q2-9', title: '空间规划', path: '/deep-eval', search: '?step=8', qId: 'Q9' },
  { id: 'q2-11', title: '烹饪习惯', path: '/deep-eval', search: '?step=9', qId: 'Q10' },
  { id: 'q2-11-social', title: '社交习惯', path: '/deep-eval', search: '?step=10', qId: 'Q11' },
  { id: 'q2-12', title: '聚餐习惯', path: '/deep-eval', search: '?step=11', qId: 'Q12' },
  { id: 'q2-13', title: '客厅习惯', path: '/deep-eval', search: '?step=12', qId: 'Q13' },
  { id: 'q2-14', title: '储物重点', path: '/deep-eval', search: '?step=13', qId: 'Q14' },
  { id: 'q2-15', title: '卫浴偏好', path: '/deep-eval', search: '?step=14', qId: 'Q15' },
  { id: 'q2-16', title: '底线需求', path: '/deep-eval', search: '?step=15', qId: 'Q16' },
  { id: 'q2-17', title: '风水禁忌', path: '/deep-eval', search: '?step=16', qId: 'Q17' },
  { id: 'q2-18', title: '智能家居', path: '/deep-eval', search: '?step=17', qId: 'Q18' },
  { id: 'q2-19', title: '系统选择', path: '/deep-eval', search: '?step=18', qId: 'Q19' },
  { id: 'q2-20', title: '设备需求', path: '/deep-eval', search: '?step=19', qId: 'Q20' },
  {
    id: 'style-q10',
    title: '空间兴趣',
    path: '/deep-eval',
    search: '?step=20',
    qId: 'Q21',
    fromStyleEval: true,
  },
  { id: 'q2-21', title: '个性需求', path: '/deep-eval', search: '?step=21', qId: 'Q22' },
  { id: 'contract-1', title: '意向金合同', path: '/contracts', search: '?step=1' },
  { id: 'contract-2', title: '支付账号', path: '/contracts', search: '?step=2' },
];

/** 从项目需求书进入的用户已具备线索，流程仅保留：风格测评 → 深度测评 */
const REQUIREMENTS_FLOW_EXCLUDED_STEP_IDS = new Set([
  'welcome',
  'leads-1',
  'leads-2',
  'budget',
  'register',
  'contract-1',
  'contract-2',
]);

export function isRequirementsSupplementFlow(search: string): boolean {
  return new URLSearchParams(search).get('from') === 'requirements';
}

export function getNavigationStepsForFlow(fromRequirementsFlow: boolean): NavStep[] {
  if (!fromRequirementsFlow) return NAVIGATION_STEPS;
  return NAVIGATION_STEPS.filter((s) => !REQUIREMENTS_FLOW_EXCLUDED_STEP_IDS.has(s.id));
}
