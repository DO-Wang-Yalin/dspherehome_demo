/**
 * 演示项目「龙湖璟宸府」：线索 + 用户需求书 FormData 全量填充（与 Workbench 需求书字段、选项键一致）
 */
import type { FormData, RequirementsMember } from '../../types'
import { initialFormData } from '../../types'
import { INITIAL_ORDERS } from '../../data/mockOrders'
import type { UserLead } from './savedLeadsStorage' // type-only，避免与 savedLeadsStorage 运行时循环依赖

export const LONGHU_JINGCHENFU_DEMO_LEAD_ID = 'demo-longhu-jingchenfu-v1'

/** 简易户型示意（SVG），需求书「项目图纸」区可展示 */
const FLOOR_PLAN_SVG = (title: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">
      <rect fill="#FAF6F0" width="360" height="260"/>
      <text x="180" y="22" text-anchor="middle" fill="#8B7355" font-size="13" font-weight="600">${title}</text>
      <rect x="16" y="36" width="200" height="100" fill="#EDE4D8" stroke="#C4B8A8" stroke-width="1.5"/>
      <text x="116" y="88" text-anchor="middle" fill="#5C5348" font-size="11">客厅·餐厅</text>
      <rect x="224" y="36" width="120" height="72" fill="#E8DFD2" stroke="#C4B8A8"/>
      <text x="284" y="76" text-anchor="middle" fill="#5C5348" font-size="10">开放厨房</text>
      <rect x="224" y="116" width="56" height="80" fill="#E5DDD0" stroke="#C4B8A8"/>
      <text x="252" y="158" text-anchor="middle" fill="#5C5348" font-size="9">公卫</text>
      <rect x="288" y="116" width="56" height="80" fill="#E5DDD0" stroke="#C4B8A8"/>
      <text x="316" y="152" text-anchor="middle" fill="#5C5348" font-size="9">家政</text>
      <rect x="16" y="144" width="96" height="100" fill="#E8E0D4" stroke="#C4B8A8"/>
      <text x="64" y="196" text-anchor="middle" fill="#5C5348" font-size="10">主卧套间</text>
      <rect x="120" y="144" width="96" height="48" fill="#E5DDD0" stroke="#C4B8A8"/>
      <text x="168" y="172" text-anchor="middle" fill="#5C5348" font-size="9">书房</text>
      <rect x="120" y="196" width="96" height="48" fill="#E5DDD0" stroke="#C4B8A8"/>
      <text x="168" y="224" text-anchor="middle" fill="#5C5348" font-size="9">女儿房</text>
    </svg>`
  )

const SITE_PHOTO_SVG = (label: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4C4B0"/><stop offset="1" stop-color="#A89880"/></linearGradient></defs>
      <rect fill="url(#g)" width="280" height="200"/>
      <text x="140" y="105" text-anchor="middle" fill="white" font-size="14" font-weight="600">${label}</text>
    </svg>`
  )

const DEMO_MEMBERS: RequirementsMember[] = [
  {
    id: 'role',
    name: '张明远（业主）',
    age: '38岁',
    profession: '科技企业产品总监',
    spaces: [
      { name: '主卧', description: '安静遮光、阅读角、双床头柜插座预留' },
      { name: '书房', description: '双显示器工位、大量藏书与文件收纳' },
    ],
    otherActivityNote: '周末偶有居家办公与线上会议',
  },
  {
    id: 'm2',
    name: '李悦（配偶）',
    age: '36岁',
    profession: '金融机构风控',
    spaces: [
      { name: '主卧', description: '衣帽间容量充足，护肤化妆区独立照明' },
      { name: '女儿房', description: '参与孩子成长空间规划与收纳' },
    ],
  },
  {
    id: 'm3',
    name: '张沐晨（女儿）',
    age: '8岁',
    profession: '小学在读',
    spaces: [{ name: '女儿房', description: '柔和粉色系、大书桌与绘本架、充足储物' }],
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
    projectPosition: '上海市闵行区银春路1888弄龙湖璟宸府',
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

export function getLonghuJingchenfuFullFormData(): FormData {
  const lead = getLonghuJingchenfuDemoLead()
  return {
    ...initialFormData,
    userName: lead.name,
    userTitle: lead.salutation,
    userAgeRange: lead.ageGroup,
    userHeight: '178',
    userIndustry: lead.industry,
    userCity: lead.city,
    userPhone: lead.phone,
    projectLocation: '上海市闵行区',
    projectName: '龙湖璟宸府',
    projectType: '平层公寓',
    projectArea: '143',
    houseType: '四室两厅两卫',
    houseCondition: '毛坯',
    budgetStandard: '12000',
    budgetSubStandard: '约 171.6 万（按建面×单价的演示口径）；设计约 18%，严选约 42%，施工约 40%',
    floorPlanUploaded: true,
    floorPlanImages: [
      { name: '璟宸府·标准层户型图.pdf', url: FLOOR_PLAN_SVG('龙湖璟宸府 143㎡') },
      { name: '璟宸府·家具平面示意.pdf', url: FLOOR_PLAN_SVG('家具布置示意') },
    ],
    siteMedia: [
      { name: '客厅毛坯现场.jpg', url: SITE_PHOTO_SVG('客厅·毛坯'), kind: 'image' },
      { name: '主卧窗景.jpg', url: SITE_PHOTO_SVG('主卧·南向采光'), kind: 'image' },
      { name: '厨房原貌.jpg', url: SITE_PHOTO_SVG('厨房·待改造'), kind: 'image' },
    ],
    houseUsage: '三口之家常住，父母节假日短住',
    lighting:
      '客厅与主卧南向，白天自然光充足；北向书房与走廊需补充 4000K 主灯与局部射灯。',
    ceilingHeight: '合同层高约 2.95m，吊顶后主通道净高不低于 2.70m。',
    ventilation: '户型南北通透；厨房设大功率烟机与补风，公卫加强排风。',
    noise: '临社区内部路，卧室采用三层中空玻璃；书房靠电梯井侧做隔音加强。',
    role: 'A',
    favoriteSpace: ['客厅影音中心', '社交餐厨', '智能书房'],
    additionalMembers: ['配偶', '女儿'],
    daughterSpaces: ['独立卧室', '学习区', '绘本与玩具收纳'],
    sonSpaces: [],
    catSpaces: [],
    dogSpaces: [],
    requirementsMembers: DEMO_MEMBERS,
    collaboration: '每周五晚固定进度例会；重大事项微信群 @ 双方确认。',
    involvement: '隐蔽验收、木作安装、橱柜台面、洁具安装等节点尽量到场。',
    timeline: '2025年Q2 开工 → Q4 硬装完工 → 2026春节前完成软装入伙',
    coreSpaces: '客厅、餐厅、中西双厨、主卧套间、女儿房、书房、双卫、玄关、阳台',
    customCoreSpaceOptions: [],
    childGrowth: '女儿小学阶段，书桌与书柜随身高可调；预留墙面展示与涂鸦白板。',
    guestStay: '书房沙发床可展开为 1.5m 临时客卧；父母短住无压力。',
    futureChanges: '五年内无二胎计划；北向书房可改二宝房或住家阿姨房。',
    cookingHabit: 'heavy',
    secondKitchen: 'yes_split',
    diningCount: '3-4人',
    festivalDiningCount: '7-10人',
    partyFrequency: '月均 1～2 次家庭小聚',
    livingRoomActivity: '亲子阅读、大屏影音、周末轻健身',
    livingRoomFeature: ['media', 'social', 'kids'],
    storageFocus: [
      '衣帽间/衣柜系统',
      '厨房餐储收纳',
      '展示性收纳（书籍、收藏品）',
      '清洁工具/家政柜',
    ],
    dryWetSeparation: 'strict',
    bottomLine: [
      '绝对要环保（哪怕多花钱，也要进场就能住，没味儿、没甲醛）',
      '收纳够强大（空间利用率要高，东西放得下、找得到，拒绝杂乱）',
    ],
    fengshui: '避开大众忌讳就行',
    smartHome: '已选型：网络、灯光场景、窗帘与空调联动。',
    smartHomeOptions: [
      '全屋网络覆盖',
      '一键场景控制',
      '氛围灯光调控',
      '遮阳自动系统',
      '家电自动联动',
      '24h 居家安防',
    ],
    comfortSystems: ['新风系统', '全屋地暖', '中央空调', '全屋净水软水'],
    devices: ['智能门锁', '洗碗机', '蒸烤箱', '干衣机', '扫拖机器人', '厨房垃圾处理器'],
    accessibility: '暂无老人常住；主卫预留扶手安装位。',
    oldFurniture: '保留部分实木餐桌、书柜与钢琴，需融入现代暖灰基调。',
    otherNeeds: '玄关：消毒鞋柜、次净衣挂墙；阳台：洗晒+绿植+扫地机基站。',
    otherNeedsOptions: [
      '儿童成长性需求',
      '亲友留宿需求',
      '未来1–2年是否可能出现居住变化（添娃/父母同住/远程办公）',
    ],
    spaceOtherNote: '家政间合并洗烘与清洁工具收纳，动线最短进入公区。',
    livingRoomNote:
      '沙发围合+单椅，电视墙整面收纳；预留 100 寸激光电视与音响埋线。',
    diningNote: '1.6m 餐桌可拉伸至 2.2m；餐边柜集成迷你水吧与咖啡角。',
    kitchenNote: 'U 型中厨（烟机灶具洗碗机）+ 岛台西厨；冰箱外置餐厅动线。',
    bathroomNote: '主卫双台盆+淋浴+马桶三分离；公卫台盆外置、一字淋浴房。',
    customSpaceItems: [
      { name: '书房', description: '双面书柜+升降桌+静音门，兼顾视频会议背景简洁。' },
      { name: '阳台', description: '一侧洗烘叠放+水池，一侧花架与休闲椅。' },
      { name: '家政间', description: '洗烘、吸尘器、梯子、换季被褥集中收纳。' },
    ],
    styleId: 'DS-modern-warm',
    styleName: '现代暖灰',
    colorGene: '米白墙面、橡木木饰面、深灰石材点缀',
    styleSuggestions:
      '大面留白与木饰面平衡冷暖；客厅重点照明+餐厅吊灯形成视觉锚点；软装以棉麻与少量皮革提升触感。',
    contractAccepted: true,
    contractSignatureData: lead.contractSignatureData,
    contractCustomText: '',
    orders: [...INITIAL_ORDERS],
    requirementDocRevisions: [
      {
        id: 'rev-1',
        date: '2025-02-20',
        updater: '顾问李婷',
        summary: '现场勘测与需求访谈，形成初版需求书',
        sectionNote: '§1～§3 项目概况与成员',
      },
      {
        id: 'rev-2',
        date: '2025-03-01',
        updater: '业主张明远',
        summary: '补充中西厨、智能家居与家政动线',
        sectionNote: '§4 空间需求 §5 设备',
      },
      {
        id: 'rev-3',
        date: '2025-03-08',
        updater: '设计主创王工',
        summary: '户型图与现场照片已归档，进入方案阶段',
        sectionNote: '§6 图纸与影像',
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
