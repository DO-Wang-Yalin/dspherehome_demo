import { INITIAL_ORDERS } from './data/mockOrders';

/** 成员下的单个空间项，可带描述 */
export interface MemberSpaceItem {
  name: string;
  description?: string;
}

/** 项目需求书「变更与修订记录」单条（与 docs/PROJECT_REQUIREMENTS.md §8 字段一致） */
export interface RequirementDocRevisionEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 更新人 */
  updater: string;
  /** 变更概要 */
  summary: string;
  /** 涉及章节 / 备注 */
  sectionNote?: string;
  /** 本条保存后的需求书快照 JSON（RequirementDocSnapshotStored） */
  docSnapshotJson?: string;
  /** 变更前内容摘要（用于详细变更记录展开展示） */
  changeDetailBefore?: string;
  /** 变更后内容摘要（用于详细变更记录展开展示） */
  changeDetailAfter?: string;
}

/** 需求书成员画像：可添加/编辑成员，每个成员下可添加/编辑空间及描述 */
export interface RequirementsMember {
  id: string;
  /** 角色（男主人、女主人、女儿等），决定年龄段/职业/活动空间可选项 */
  name: string;
  /** 姓名或称呼，仅展示用，可与角色分开填写 */
  displayName?: string;
  age?: string;
  profession?: string;
  spaces: MemberSpaceItem[];
  /** 主要活动及空间以外的其他说明 */
  otherActivityNote?: string;
}

/** 修订存档时的需求书快照（不含媒体 base64，仅文件名与文本字段） */
export interface RequirementDocSnapshotStored {
  smartHomeOptions: string[];
  devices: string[];
  otherNeeds: string;
  comfortSystems: string[];
  fengshui: string;
  storageFocus: string[];
  spaceOtherNote: string;
  livingRoomNote: string;
  diningNote: string;
  kitchenNote: string;
  bathroomNote: string;
  coreSpaces: string;
  customCoreSpaceOptions: string[];
  childGrowth: string;
  guestStay: string;
  futureChanges: string;
  requirementsMembers: RequirementsMember[];
  floorPlanImages: Array<{ name: string }>;
  siteMedia: Array<{ name: string; kind: string }>;
  customSpaceItems: Array<{ name: string; description?: string }>;
}

export interface FormData {
  // Q2-0
  userName: string;
  userTitle: string;
  userAgeRange: string;
  userHeight: string;
  userIndustry: string;
  userCity: string;
  userPhone: string;
  // Q2-1
  projectLocation: string;
  projectName: string;
  // Q2-2
  projectType: string;
  projectArea: string;
  houseType: string;
  houseCondition: string;
  // Q2-3
  budgetStandard: string;
  budgetSubStandard: string;
  // Q2-4
  floorPlanUploaded: boolean;
  houseUsage: string;
  // Q2-5
  lighting: string;
  ceilingHeight: string;
  ventilation: string;
  noise: string;
  // Q2-6
  role: string;
  favoriteSpace: string[];
  /** Q2-6-1：除主核外另两位核心成员（A/B/C）的空间多选 */
  otherCoreMemberSpaces?: Partial<Record<'A' | 'B' | 'C', string[]>>;
  /** Q2-6-1：对应核心成员的补充说明 */
  otherCoreMemberNotes?: Partial<Record<'A' | 'B' | 'C', string>>;
  /** Q2-6-1：可含女儿/儿子/猫/狗 id，以及作为「更多家庭成员」勾选的核心角色 A/B/C */
  additionalMembers: string[];
  daughterSpaces: string[];
  sonSpaces: string[];
  catSpaces: string[];
  dogSpaces: string[];
  /** Q2-6-1：女儿/儿子/猫/狗 各类别的补充说明（键同 additionalMembers id） */
  additionalMemberNotes?: Record<string, string>;
  /** 需求书成员列表：有值时以本列表展示与编辑，支持成员/空间增删改及空间描述 */
  requirementsMembers?: RequirementsMember[];
  // Q2-7
  collaboration: string;
  involvement: string;
  // Q2-8
  timeline: string;
  // Q2-9
  coreSpaces: string;
  /** 用户自定义增加的核心空间类型名称（用于需求书编辑） */
  customCoreSpaceOptions?: string[];
  childGrowth: string;
  guestStay: string;
  futureChanges: string;
  // Q2-10
  cookingHabit: string;
  secondKitchen: string;
  // Q2-11
  diningCount: string;
  festivalDiningCount: string;
  // Q2-12
  partyFrequency: string;
  // Q2-13
  livingRoomActivity: string;
  livingRoomFeature: string[];
  // Q2-14
  storageFocus: string[];
  // Q2-15
  dryWetSeparation: string;
  // Q2-16
  bottomLine: string[];
  // Q2-17
  fengshui: string;
  // Q2-18
  smartHome: string;
  smartHomeOptions: string[];
  // Q2-19
  comfortSystems: string[];
  // Q2-20
  devices: string[];
  // Q2-21
  accessibility: string;
  oldFurniture: string;
  otherNeeds: string;
  otherNeedsOptions: string[];
  /** 空间需求区块内「其他说明」编辑内容 */
  spaceOtherNote?: string;
  /** 各空间需求说明（与分页一一对应） */
  livingRoomNote?: string;
  diningNote?: string;
  kitchenNote?: string;
  bathroomNote?: string;
  /** 需求书内户型图（与需求书打通，url 为 data URL 或可持久化地址） */
  floorPlanImages?: Array<{ name: string; url: string }>;
  /** 需求书内现场视频/照片（与需求书打通） */
  siteMedia?: Array<{ name: string; url: string; kind: 'image' | 'video' }>;
  /** 空间需求区块内自定义/其他空间（添加空间） */
  customSpaceItems?: Array<{ name: string; description?: string }>;
  // 家居风格测评
  styleId: string;
  styleName: string;
  colorGene: string;
  styleSuggestions: string;
  /** 居住定位选项 id（A–F），深度测评衔接题 */
  styleEvalQ8Positioning?: string;
  /** 同住成员/宠物选项 id 列表 */
  styleEvalQ9Selections?: string[];
  /** q9 学龄前/青少年/长辈人数 */
  styleEvalQ9Quantities?: Record<string, number>;
  /** q10 空间兴趣多选 id */
  styleEvalQ10Needs?: string[];
  // Contract
  contractAccepted?: boolean;
  contractSignatureData?: string;
  contractCustomText?: string;
  orders?: any[];
  /** 需求书修订历史，最新在前 */
  requirementDocRevisions?: RequirementDocRevisionEntry[];
  /** 项目中心「预算资金」：EPC/订单拆解指标与确认状态 */
  projectBudget?: ProjectBudgetData;
}

/** 预算资金确认状态与拆解数值（万元） */
export interface ProjectBudgetData {
  status: 'unconfirmed' | 'confirmed';
  /** 最近一次确认时间 ISO */
  confirmedAt?: string;
  /** 确认时备注 */
  lastConfirmNote?: string;
  /** EPC：预算区间下限、上限 */
  epcRangeMin: number;
  epcRangeMax: number;
  /** 项目入金金额（万元） */
  epcDeposit: number;
  /** 入金分笔记录（日期 YYYY-MM-DD、万元）；无则按一笔展示，日期取 confirmedAt */
  epcDepositEntries?: Array<{ date: string; amount: number }>;
  /** 已成交金额（万元） */
  epcWon: number;
  /** 订单维度 */
  orderTotalBudget: number;
  orderDeliveryTotal: number;
  orderAcceptanceTotal: number;
  orderSettledTotal: number;
  /** 用户「修改预算分配」提交说明 */
  adjustmentHistory?: Array<{ at: string; text: string }>;
}

export const initialFormData: FormData = {
  userName: '',
  userTitle: '',
  userAgeRange: '',
  userHeight: '',
  userIndustry: '',
  userCity: '',
  userPhone: '',
  projectLocation: '',
  projectName: '',
  projectType: '',
  projectArea: '',
  houseType: '',
  houseCondition: '',
  budgetStandard: '',
  budgetSubStandard: '',
  floorPlanUploaded: false,
  houseUsage: '',
  lighting: '',
  ceilingHeight: '',
  ventilation: '',
  noise: '',
  role: '',
  favoriteSpace: [],
  otherCoreMemberSpaces: {},
  otherCoreMemberNotes: {},
  additionalMembers: [],
  daughterSpaces: [],
  sonSpaces: [],
  catSpaces: [],
  dogSpaces: [],
  additionalMemberNotes: {},
  collaboration: '',
  involvement: '',
  timeline: '',
  coreSpaces: '1客厅1餐厅1主卧室1主卫浴室1公卫浴室',
  childGrowth: '',
  guestStay: '',
  futureChanges: '',
  cookingHabit: '',
  secondKitchen: '',
  diningCount: '',
  festivalDiningCount: '',
  partyFrequency: '',
  livingRoomActivity: '',
  livingRoomFeature: [],
  storageFocus: [],
  dryWetSeparation: '',
  bottomLine: [],
  fengshui: '',
  smartHome: '',
  smartHomeOptions: [],
  comfortSystems: [],
  devices: [],
  accessibility: '',
  oldFurniture: '',
  otherNeeds: '',
  otherNeedsOptions: [],
  spaceOtherNote: '',
  styleId: '',
  styleName: '',
  colorGene: '',
  styleSuggestions: '',
  styleEvalQ8Positioning: '',
  styleEvalQ9Selections: [],
  styleEvalQ9Quantities: {},
  styleEvalQ10Needs: [],
  contractAccepted: false,
  contractSignatureData: '',
  contractCustomText: '',
  orders: INITIAL_ORDERS,
  requirementDocRevisions: [],
  projectBudget: {
    status: 'unconfirmed',
    epcRangeMin: 45,
    epcRangeMax: 50,
    epcDeposit: 26,
    epcDepositEntries: [
      { date: '2025-09-08', amount: 8 },
      { date: '2025-10-22', amount: 10 },
      { date: '2025-11-25', amount: 8 },
    ],
    epcWon: 15.5,
    orderTotalBudget: 50,
    orderDeliveryTotal: 12,
    orderAcceptanceTotal: 8,
    orderSettledTotal: 15.5,
    adjustmentHistory: [],
  },
};
