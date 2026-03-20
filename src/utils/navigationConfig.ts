import { questions as styleEvalQuestions } from '../pages/StyleEval/data/questions';

export type NavStep = {
  id: string;
  title: string;
  path: string;
  search?: string;
  /** 目录中展示的步骤编号（如 ST-01、DE-01、GL-01） */
  qId?: string;
};

/** 风格测评目录短标题（与 `docs/NAVIGATION_STEPS.md` 一致；答题页仍用 `questions.ts` 正文） */
const STYLE_EVAL_NAV_TITLES = [
  '关于"光感"',
  '关于"色温"',
  '关于"质地"',
  '关于"密度"',
  '关于"时代"',
  '关于"秩序"',
  '关于"社交"',
] as const;

function buildStyleEvalNavSteps(): NavStep[] {
  if (styleEvalQuestions.length !== STYLE_EVAL_NAV_TITLES.length) {
    throw new Error(
      `navigationConfig: 风格测评题目数（${styleEvalQuestions.length}）须与 STYLE_EVAL_NAV_TITLES（${STYLE_EVAL_NAV_TITLES.length}）一致`,
    );
  }
  const qSteps: NavStep[] = STYLE_EVAL_NAV_TITLES.map((title, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      id: `style-st-${n}`,
      title,
      path: '/style-eval',
      search: `?sePage=${i}`,
      qId: `ST-${n}`,
    };
  });
  qSteps.push({
    id: 'style-st-result',
    title: '风格测评结果',
    path: '/style-eval',
    search: '?showResult=true',
    qId: 'ST-08',
  });
  return qSteps;
}

export const NAVIGATION_STEPS: NavStep[] = [
  { id: 'welcome', title: '首页', path: '/', qId: 'GL-01' },
  ...buildStyleEvalNavSteps(),
  { id: 'leads-1', title: '项目概况', path: '/leads', search: '?step=1', qId: 'LD-01' },
  { id: 'leads-2', title: '您的信息', path: '/leads', search: '?step=2', qId: 'LD-02' },
  { id: 'budget', title: '项目预算拆解', path: '/budget-breakdown', qId: 'BG-01' },
  { id: 'register', title: '注册', path: '/register', qId: 'RG-01' },
  { id: 'q2-4', title: '房型资料同步', path: '/deep-eval', search: '?step=0', qId: 'DE-01' },
  { id: 'q2-5', title: '房屋现状', path: '/deep-eval', search: '?step=1', qId: 'DE-02' },
  {
    id: 'style-q8',
    title: '居住定位',
    path: '/deep-eval',
    search: '?step=2',
    qId: 'DE-03',
  },
  {
    id: 'style-q9',
    title: '同住成员',
    path: '/deep-eval',
    search: '?step=3',
    qId: 'DE-04',
  },
  { id: 'q2-6', title: '核心成员', path: '/deep-eval', search: '?step=4', qId: 'DE-05' },
  { id: 'q2-6-1', title: '家庭成员', path: '/deep-eval', search: '?step=5', qId: 'DE-06' },
  { id: 'q2-7', title: '协作方式', path: '/deep-eval', search: '?step=6', qId: 'DE-07' },
  { id: 'q2-8', title: '计划节奏', path: '/deep-eval', search: '?step=7', qId: 'DE-08' },
  { id: 'q2-9', title: '空间规划', path: '/deep-eval', search: '?step=8', qId: 'DE-09' },
  { id: 'q2-11', title: '烹饪习惯', path: '/deep-eval', search: '?step=9', qId: 'DE-10' },
  { id: 'q2-11-social', title: '社交习惯', path: '/deep-eval', search: '?step=10', qId: 'DE-11' },
  { id: 'q2-12', title: '聚餐习惯', path: '/deep-eval', search: '?step=11', qId: 'DE-12' },
  { id: 'q2-13', title: '客厅习惯', path: '/deep-eval', search: '?step=12', qId: 'DE-13' },
  { id: 'q2-14', title: '储物重点', path: '/deep-eval', search: '?step=13', qId: 'DE-14' },
  { id: 'q2-15', title: '卫浴偏好', path: '/deep-eval', search: '?step=14', qId: 'DE-15' },
  { id: 'q2-16', title: '底线需求', path: '/deep-eval', search: '?step=15', qId: 'DE-16' },
  { id: 'q2-17', title: '风水禁忌', path: '/deep-eval', search: '?step=16', qId: 'DE-17' },
  { id: 'q2-18', title: '智能家居', path: '/deep-eval', search: '?step=17', qId: 'DE-18' },
  { id: 'q2-19', title: '系统选择', path: '/deep-eval', search: '?step=18', qId: 'DE-19' },
  { id: 'q2-20', title: '设备需求', path: '/deep-eval', search: '?step=19', qId: 'DE-20' },
  {
    id: 'style-q10',
    title: '空间兴趣',
    path: '/deep-eval',
    search: '?step=20',
    qId: 'DE-21',
  },
  { id: 'q2-21', title: '个性需求', path: '/deep-eval', search: '?step=21', qId: 'DE-22' },
  { id: 'contract-1', title: '意向金合同', path: '/contracts', search: '?step=1', qId: 'CT-01' },
  { id: 'contract-2', title: '支付账号', path: '/contracts', search: '?step=2', qId: 'CT-02' },
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
