import { INITIAL_ORDERS } from './data/mockOrders';

/** 成员下的单个空间项，可带描述 */
export interface MemberSpaceItem {
  name: string;
  description?: string;
}

/** 需求书成员画像：可添加/编辑成员，每个成员下可添加/编辑空间及描述 */
export interface RequirementsMember {
  id: string;
  name: string;
  age?: string;
  profession?: string;
  spaces: MemberSpaceItem[];
  /** 主要活动及空间以外的其他说明 */
  otherActivityNote?: string;
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
  additionalMembers: string[];
  daughterSpaces: string[];
  sonSpaces: string[];
  catSpaces: string[];
  dogSpaces: string[];
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
  // Contract
  contractAccepted?: boolean;
  contractSignatureData?: string;
  contractCustomText?: string;
  orders?: any[];
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
  additionalMembers: [],
  daughterSpaces: [],
  sonSpaces: [],
  catSpaces: [],
  dogSpaces: [],
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
  contractAccepted: false,
  contractSignatureData: '',
  contractCustomText: '',
  orders: INITIAL_ORDERS,
};
