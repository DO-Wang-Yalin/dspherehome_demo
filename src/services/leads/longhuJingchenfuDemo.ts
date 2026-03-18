/**
 * 演示项目「龙湖璟宸府」：线索字段与需求书/工作台 FormData 全量填充，供项目页与进入工作台使用。
 */
import type { FormData, RequirementsMember } from '../../types'
import { initialFormData } from '../../types'
import type { UserLead } from './savedLeadsStorage' // type-only，避免与 savedLeadsStorage 运行时循环依赖

export const LONGHU_JINGCHENFU_DEMO_LEAD_ID = 'demo-longhu-jingchenfu-v1'

const DEMO_MEMBERS: RequirementsMember[] = [
  {
    id: 'm1',
    name: '张明远（业主）',
    age: '38',
    profession: '科技企业产品总监',
    spaces: [
      { name: '主卧', description: '需要安静、遮光良好，预留阅读角' },
      { name: '书房', description: '双显示器工位、大量藏书与文件收纳' },
    ],
    otherActivityNote: '周末偶有居家办公与线上会议',
  },
  {
    id: 'm2',
    name: '李悦（配偶）',
    age: '36',
    profession: '金融机构风控',
    spaces: [
      { name: '主卧', description: '衣帽间容量要足，护肤化妆区独立照明' },
      { name: '女儿房', description: '孩子成长，预留学习区与玩具收纳' },
    ],
  },
  {
    id: 'm3',
    name: '张沐晨（女儿）',
    age: '8',
    profession: '小学在读',
    spaces: [{ name: '女儿房', description: '喜欢粉色系，需要大书桌与绘本架' }],
  },
]

export function getLonghuJingchenfuDemoLead(): UserLead {
  const t = '2025-03-01T10:00:00.000Z'
  return {
    id: LONGHU_JINGCHENFU_DEMO_LEAD_ID,
    createdAt: t,
    updatedAt: t,
    status: 'project',
    projectId: 'proj-longhu-jingchenfu',
    contractSignatureData:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><text x="4" y="26" font-size="14" fill="#333">已签署</text></svg>'
      ),
    projectType: 'H_平层公寓',
    projectPosition: '上海市闵行区银春路1888弄',
    handoverStatus: '毛坯',
    area: '143',
    budget: '12000',
    name: '张明远',
    salutation: '先生',
    city: '上海市',
    phone: '13801688888',
    ageGroup: '30-40岁',
    industry: '科技行业',
    projectName: '龙湖璟宸府',
  }
}

/** 进入该项目工作台时写入的全量表单（深度测评草稿可在此基础上覆盖） */
export function getLonghuJingchenfuFullFormData(): FormData {
  return {
    ...initialFormData,
    userName: '张明远',
    userTitle: '先生',
    userAgeRange: '30-40岁',
    userHeight: '178',
    userIndustry: '科技行业',
    userCity: '上海市',
    userPhone: '13801688888',
    projectLocation: '上海市闵行区',
    projectName: '龙湖璟宸府',
    projectType: 'H_平层公寓',
    projectArea: '143',
    houseType: '四室两厅两卫',
    houseCondition: '毛坯',
    budgetStandard: '12000',
    budgetSubStandard: '设计约 18%，严选约 42%，施工约 40%',
    floorPlanUploaded: true,
    houseUsage: '三口之家常住，父母节假日短住',
    lighting: '南向客厅与主卧采光充足；北向次卧略弱，希望补充人工照明层次。',
    ceilingHeight: '层高约 2.95m，局部吊顶后主空间净高不低于 2.7m。',
    ventilation: '南北通透，厨房与公卫需加强排风。',
    noise: '临近社区道路，卧室需考虑隔声窗与软装吸声。',
    role: '夫妻二人共同决策，重大选型需现场确认。',
    favoriteSpace: ['客厅', '主卧', '开放式厨房'],
    additionalMembers: ['配偶', '女儿'],
    daughterSpaces: ['独立卧室', '学习区', '绘本与玩具收纳'],
    sonSpaces: [],
    catSpaces: [],
    dogSpaces: [],
    requirementsMembers: DEMO_MEMBERS,
    collaboration: '希望每周一次进度同步，重大事项微信群即时沟通。',
    involvement: '施工关键节点（隐蔽工程、木作安装）尽量到场验收。',
    timeline: '计划 2025 年第二季度开工，年底前完成硬装，春节前进软装。',
    coreSpaces: '客厅、餐厅、中西双厨、主卧套间、女儿房、书房、双卫',
    customCoreSpaceOptions: [],
    childGrowth: '女儿小学阶段，学习区与活动区需可随成长调整。',
    guestStay: '父母偶住，预留可折叠沙发床或临时客房功能。',
    futureChanges: '五年内无二胎计划；书房可兼顾客卧。',
    cookingHabit: '日常简餐为主，周末家庭聚餐与烘焙较多。',
    secondKitchen: '需要西厨岛台与水吧，与中厨油烟分离。',
    diningCount: '日常 3 人，周末 5～6 人',
    festivalDiningCount: '春节等节日约 10 人，餐厅需可扩展。',
    partyFrequency: '月均 1～2 次小型家庭聚会',
    livingRoomActivity: '亲子阅读、影音、偶尔居家健身',
    livingRoomFeature: ['大屏影音', '充足收纳', '儿童活动角'],
    storageFocus: ['玄关鞋柜', '餐边柜', '主卧衣帽间', '家政柜'],
    dryWetSeparation: '主卫干湿分离；公卫洗手台外置。',
    bottomLine: ['环保达国标 Enf', '动线合理无锐角', '智能家居可扩展'],
    fengshui: '床位不靠窗对门，灶台不对卫生间门。',
    smartHome: '全屋网络覆盖、灯光场景、窗帘与空调可语音/APP 控制。',
    smartHomeOptions: ['智能灯光', '电动窗帘', '可视门禁', '新风联动'],
    comfortSystems: ['地暖', '中央空调', '新风', '全屋净水'],
    devices: ['冰箱双开门', '洗碗机', '蒸烤箱', '洗烘套装', '扫地机器人基站'],
    accessibility: '暂无老人常住，预留卫生间扶手安装位。',
    oldFurniture: '保留部分实木家具与藏书，需融入新风格。',
    otherNeeds: '玄关需消毒鞋柜与次净衣区；阳台兼顾洗晒与绿植。',
    otherNeedsOptions: ['家政间', '扫地机上下水预留'],
    spaceOtherNote: '北向小房间优先作书房，必要时可改临时客房。',
    livingRoomNote: '沙发围合式布局，预留投影幕布槽。',
    diningNote: '1.6m 餐桌可拉伸至 2.2m，配餐边柜与小型酒柜。',
    kitchenNote: 'U 型中厨 + 岛台西厨，洗碗机 13 套以上。',
    bathroomNote: '主卫双台盆；公卫一字淋浴房。',
    styleId: 'modern-warm',
    styleName: '现代暖灰',
    colorGene: '米白、橡木、深灰点缀',
    styleSuggestions: '大面留白+木饰面，局部石材与金属提升质感。',
    contractAccepted: true,
    contractSignatureData: getLonghuJingchenfuDemoLead().contractSignatureData,
    contractCustomText: '',
    requirementDocRevisions: [
      {
        id: 'rev-1',
        date: '2025-02-20',
        updater: '顾问李婷',
        summary: '完成现场勘测与需求访谈，形成初版需求书',
        sectionNote: '§1～§3',
      },
      {
        id: 'rev-2',
        date: '2025-03-05',
        updater: '业主张明远',
        summary: '补充西厨与智能家居诉求',
        sectionNote: '§4 空间需求',
      },
    ],
    projectBudget: {
      status: 'confirmed',
      confirmedAt: '2025-03-08T14:30:00.000Z',
      lastConfirmNote: '已与顾问确认 EPC 区间及入金安排',
      epcRangeMin: 165,
      epcRangeMax: 185,
      epcDeposit: 45,
      epcWon: 52,
      orderTotalBudget: 178,
      orderDeliveryTotal: 68,
      orderAcceptanceTotal: 45,
      orderSettledTotal: 38,
      adjustmentHistory: [],
    },
  }
}
