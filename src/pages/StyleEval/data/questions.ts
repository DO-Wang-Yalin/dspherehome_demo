export type Option = {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
  group?: string;
};

export type QuestionType = 'single' | 'multiple' | 'mixed';

export type Question = {
  id: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options: Option[];
  textPrompt?: string;
};

export const questions: Question[] = [
  {
    id: 'q1',
    title: '',
    subtitle: '关于空间明暗：哪种比例的‘光影氛围’，最能让你感到身心自在？',
    type: 'single',
    options: [
      { id: 'A', label: '深度包裹感', description: '像躲进一个静谧的树洞。空间被暗影包围，只有极微弱的光勾勒轮廓，让你感到彻底的安全与私密。', imageUrl: 'https://picsum.photos/seed/dark-room/400/300' },
      { id: 'B', label: '剧场故事感', description: '像电影放映厅。大部分空间是暗的，只用一盏灯点亮你停留的地方，这种强烈的对比让你更专注。', imageUrl: 'https://picsum.photos/seed/dim-lounge/400/300' },
      { id: 'C', label: '温和呼吸感', description: '像下午的美术馆。光线不多也不少，均匀且克制，没有刺眼的亮块，让空间显得稳重、体面。', imageUrl: 'https://picsum.photos/seed/soft-gallery/400/300' },
      { id: 'D', label: '阳光活力感', description: '视野被充足的光线充盈。整体色调轻快，能清晰感受到阳光的能量，让人心情愉悦、充满动力。', imageUrl: 'https://picsum.photos/seed/bright-sunroom/400/300' },
      { id: 'E', label: '极致清爽感', description: '追求“无死角”的透亮。像极致简约的实验室，没有任何视觉阴影，追求绝对的干净、透明与高效率。', imageUrl: 'https://picsum.photos/seed/white-lab/400/300' },
    ],
  },
  {
    id: 'q2',
    title: '',
    subtitle: '夜幕降临，哪种‘灯光的色泽’最能让你进入理想的居家状态？',
    type: 'single',
    options: [
      { id: 'A', label: '极冷白光', description: '像手术室或精密实验室，这种冷峻感让我感到最清醒、最专业。', imageUrl: 'https://picsum.photos/seed/cold-snow/400/300' },
      { id: 'B', label: '中性月光', description: '偏爱自然的日光色，没有任何偏色。清爽、干净、不带私人情绪的理智空间。', imageUrl: 'https://picsum.photos/seed/neutral-daylight/400/300' },
      { id: 'C', label: '晨曦微光', description: '淡淡的乳白色。带有一丝丝极其微弱的暖意，清爽且舒缓。', imageUrl: 'https://picsum.photos/seed/morning-light/400/300' },
      { id: 'D', label: '黄昏暖阳', description: '柔和的香槟色或奶咖色。像夕阳洒进屋子，有一种被家温柔包裹的归属感。', imageUrl: 'https://picsum.photos/seed/warm-sunset/400/300' },
      { id: 'E', label: '壁炉篝火', description: '浓郁的琥珀色、暖橙色。极其温馨、热烈，甚至带有一点慵懒的怀旧感。', imageUrl: 'https://picsum.photos/seed/amber-fireplace/400/300' },
    ],
  },
  {
    id: 'q3',
    title: '',
    subtitle: '哪种‘表面的触感’，让你觉得放在家里很棒？',
    type: 'single',
    options: [
      { id: 'A', label: '极冷硬感', description: '像拉丝金属。触感清凉、锐利且绝对平整，展现出一种理性的力量感。', imageUrl: 'https://picsum.photos/seed/brushed-metal/400/300' },
      { id: 'B', label: '细腻理智', description: '像抛光石材。触感极其平滑，代表了完美的工业精度，精致且昂贵。', imageUrl: 'https://picsum.photos/seed/polished-stone/400/300' },
      { id: 'C', label: '稳重平衡', description: '像哑光岩板。触感温和且扎实，不反光，在冷峻与柔和之间达到了完美的平衡。', imageUrl: 'https://picsum.photos/seed/matte-stone/400/300' },
      { id: 'D', label: '温暖呼吸', description: '像实木开口纹。能感觉到自然的沟壑与温润，给人一种与自然连接的生命力。', imageUrl: 'https://picsum.photos/seed/wood-grain/400/300' },
      { id: 'E', label: '原始野性', description: '像粗粝的软木或石材。表面高度不规则，带有原始的颗粒感，充满野性美感。', imageUrl: 'https://picsum.photos/seed/raw-texture/400/300' },
    ],
  },
  {
    id: 'q4',
    title: '',
    subtitle: '假设你有一个完全自有的空间，你希望它的“视觉丰满度”是？',
    type: 'single',
    options: [
      { id: 'A', label: '极度放空的冥想室', description: '几乎没有家具和杂物。只有光和影，我需要彻底的空白来让大脑运转。' },
      { id: 'B', label: '井然有序的陈列馆', description: '只摆放极少数代表性的器物。每一件物品之间都有呼吸的距离，克制且精准。' },
      { id: 'C', label: '实用至上的平衡区', description: '必要的工具和几件装饰品。既不显得空旷，也不会因为杂乱而分散注意力。' },
      { id: 'D', label: '充满灵感的艺术坊', description: '挂画、书籍和随手可得的素材丰富地交织在一起。这种“生活气息”让我感到安全和充实。' },
      { id: 'E', label: '琳琅满目的宝藏屋', description: '每一个角落都塞满了我的收藏。被心爱之物紧紧环绕，能激发出我无限的创造力。' },
    ],
  },
  {
    id: 'q5',
    title: '',
    subtitle: '如果选购一个摆件，哪种“时间留痕”最让你心动？',
    type: 'single',
    options: [
      { id: 'A', label: '岁月的残缺', description: '表面有斑驳的裂纹、粗粝的质感，甚至有些缺口。这种经过漫长时光打磨出的“不完美”，让你觉得更有生命力。', imageUrl: 'https://picsum.photos/seed/wabi-sabi/400/300' },
      { id: 'B', label: '复古的韵味', description: '颜色深沉，带有手工拉胚的温度感。它看起来不像是现代工业品，更像是从祖母的旧柜子里翻出来的珍藏。', imageUrl: 'https://picsum.photos/seed/vintage-antique/400/300' },
      { id: 'C', label: '经典的平衡', description: '造型大方、做工细致。无论是放在老房子还是新公寓都非常得体，不会过时，也不显得激进。', imageUrl: 'https://picsum.photos/seed/classic-timeless/400/300' },
      { id: 'D', label: '现代的利落', description: '线条极其流畅，表面光滑如镜。你喜欢这种没有任何划痕、极其精致且符合当代审美的完美状态。', imageUrl: 'https://picsum.photos/seed/modern-sleek/400/300' },
      { id: 'E', label: '未来的实验', description: '使用了不寻常的材质（如液态金属、3D打印结构）。它看起来非常先锋、冷峻，像是来自未来的实验室或外星文明。', imageUrl: 'https://picsum.photos/seed/futuristic-metal/400/300' },
    ],
  },
  {
    id: 'q6',
    title: '',
    subtitle: '当你观察书架上的摆放时，哪种状态让你最舒服？',
    type: 'single',
    options: [
      { id: 'A', label: '随性叠加', description: '不同品类混搭，有一种“凌乱的美感”。' },
      { id: 'B', label: '柔性组织', description: '东西不必对齐，散落在生活动线上，有一种真实且松弛的居住状态。' },
      { id: 'C', label: '粗略分类', description: '大体有序，允许一点生活碎片的随机。' },
      { id: 'D', label: '严格分类', description: '严格按照大小、厚度分类，对齐边缘。' },
      { id: 'E', label: '极致对称', description: '极致的轴线对称，像艺术展览馆一样经过精确测量。' },
    ],
  },
  {
    id: 'q7',
    title: '',
    subtitle: '你对“家”的定义是私人茧房，还是个人名片？',
    type: 'single',
    options: [
      { id: 'A', label: '极致私密', description: '家是我彻底卸下防备的树洞，无需对外人展示。' },
      { id: 'B', label: '知己信标', description: '只有通过我深度筛选、审美共鸣的极少数朋友，才有资格被邀请。比起空间，我更在意“共鸣”，家是我们的精神据点。' },
      { id: 'C', label: '标准模范', description: '它可以作为接待亲友、同事的体面场所。它表现得大方、稳重、不逾矩。我希望访客觉得我是一个生活规律、值得信任的成年人。' },
      { id: 'D', label: '审美品位', description: '我乐于向外界展示我的生活美学,甚至愿意在公域(如小红书、专业杂志)分享。' },
      { id: 'E', label: '社交坐标', description: '家是展示我个人品味与成就的最佳场所，欢迎被世界看到。' },
    ],
  },
  {
    id: 'q8',
    title: '',
    subtitle: '本项目的核心居住定位是？',
    type: 'single',
    options: [
      { id: 'A', label: '新婚筑巢（婚房）', description: '侧重长远规划。需预留未来 5-10 年的人口变化（如育儿空间），平衡浪漫氛围与极强的储物成长性。' },
      { id: 'B', label: '改善进阶（常住房）', description: '追求生活品质的全方位升级。关注材料的高级感、家庭社交中心的构建以及全屋舒适系统的深度集成。' },
      { id: 'C', label: '适老颐养（养老房）', description: '安全与便捷至上。侧重于防滑、无障碍设计、感应灯光系统以及易于维护的环保材料。' },
      { id: 'D', label: '悠闲度假（第二居所）', description: '极致的放松与审美。功能性让位于氛围感，侧重于社交、影音或开阔视野的打造，材质选型更具个性。' },
      { id: 'E', label: '资产保值（投资房）', description: '追求高周转与视觉溢价。在可控预算内实现最强的感官冲击力，材料选型以标准化、易翻新、抗造为主。' },
      { id: 'F', label: '独立首选（单身公寓/个人工作室）', description: '极致的个人化表达。打破传统分区，追求空间的高效利用与特定兴趣（如电竞、手工、收藏）的深度结合。' },
    ],
  },
  {
    id: 'q9',
    title: '谁会陪你一起生活？',
    subtitle: '定制贴心的动线与材质',
    type: 'mixed',
    options: [
      { id: 'single', label: '单身人士', group: 'family' },
      { id: 'couple', label: '夫妻/伴侣', group: 'family' },
      { id: 'child_preschool', label: '学龄前儿童', group: 'family' },
      { id: 'child_teen', label: '青少年', group: 'family' },
      { id: 'elder', label: '长辈同住', group: 'family' },
      { id: 'pet_cat', label: '猫', group: 'pet' },
      { id: 'pet_dog', label: '狗', group: 'pet' },
      { id: 'pet_other', label: '其他宠物', group: 'pet' },
      { id: 'pet_none', label: '暂无宠物', group: 'pet' },
    ],
  },
  {
    id: 'q10',
    title: '',
    subtitle: '您在生活中有哪些特别的空间需求？（可多选）',
    type: 'multiple',
    options: [
      { id: 'B', label: '影音娱乐', description: '家庭影院、HIFI音响' },
      { id: 'C', label: '电竞游戏', description: '专属电竞房、主机区' },
      { id: 'D', label: '运动健身', description: '瑜伽区、力量训练' },
      { id: 'E', label: '茶酒会友', description: '茶室、吧台、酒柜' },
    ],
  },
];

