export type NavStep = {
  id: string;
  title: string;
  path: string;
  search?: string;
  qId?: string;
};

export const NAVIGATION_STEPS: NavStep[] = [
  { id: 'welcome', title: '欢迎', path: '/style-eval' },
  { id: 'style-eval', title: '家居风格测评', path: '/style-eval' },
  { id: 'leads-1', title: '项目概况', path: '/leads', search: '?step=1', qId: 'DE-1' },
  { id: 'leads-2', title: '您的信息', path: '/leads', search: '?step=2', qId: 'DE-2' },
  { id: 'budget', title: '项目预算拆解', path: '/budget' },
  { id: 'register', title: '注册', path: '/register' },
  { id: 'contract-1', title: '意向金合同', path: '/contracts', search: '?step=1' },
  { id: 'contract-2', title: '支付账号', path: '/contracts', search: '?step=2' },
  { id: 'q2-4', title: '房型资料同步', path: '/deep-eval', search: '?step=0', qId: 'Q2-4' },
  { id: 'q2-5', title: '房屋现状', path: '/deep-eval', search: '?step=1', qId: 'Q2-5' },
  { id: 'q2-6', title: '核心成员', path: '/deep-eval', search: '?step=2', qId: 'Q2-6' },
  { id: 'q2-6-1', title: '家庭成员', path: '/deep-eval', search: '?step=3', qId: 'Q2-6-1' },
  { id: 'q2-7', title: '协作方式', path: '/deep-eval', search: '?step=4', qId: 'Q2-7' },
  { id: 'q2-8', title: '计划节奏', path: '/deep-eval', search: '?step=5', qId: 'Q2-8' },
  { id: 'q2-9', title: '空间规划', path: '/deep-eval', search: '?step=6', qId: 'Q2-9' },
  { id: 'q2-10', title: '成长变化', path: '/deep-eval', search: '?step=7', qId: 'Q2-10' },
  { id: 'q2-11', title: '烹饪习惯', path: '/deep-eval', search: '?step=8', qId: 'Q2-11' },
  { id: 'q2-12', title: '聚餐习惯', path: '/deep-eval', search: '?step=9', qId: 'Q2-12' },
  { id: 'q2-13', title: '客厅习惯', path: '/deep-eval', search: '?step=10', qId: 'Q2-13' },
  { id: 'q2-14', title: '储物重点', path: '/deep-eval', search: '?step=11', qId: 'Q2-14' },
  { id: 'q2-15', title: '卫浴偏好', path: '/deep-eval', search: '?step=12', qId: 'Q2-15' },
  { id: 'q2-16', title: '底线需求', path: '/deep-eval', search: '?step=13', qId: 'Q2-16' },
  { id: 'q2-17', title: '风水禁忌', path: '/deep-eval', search: '?step=14', qId: 'Q2-17' },
  { id: 'q2-18', title: '智能家居', path: '/deep-eval', search: '?step=15', qId: 'Q2-18' },
  { id: 'q2-19', title: '适老/无障碍', path: '/deep-eval', search: '?step=16', qId: 'Q2-19' },
  { id: 'q2-20', title: '旧物处理', path: '/deep-eval', search: '?step=17', qId: 'Q2-20' },
  { id: 'q2-21', title: '其他需求', path: '/deep-eval', search: '?step=18', qId: 'Q2-21' },
];
