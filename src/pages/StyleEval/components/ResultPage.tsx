import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { domToPng } from 'modern-screenshot';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Download from 'lucide-react/dist/esm/icons/download';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Hammer from 'lucide-react/dist/esm/icons/hammer';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import X from 'lucide-react/dist/esm/icons/x';

import dreamOneLogo from '../../../assets/img/logo.png';
import { getVisitorId } from '../../../utils/visitorId';
import { saveVoyageCard } from '../../../services/designVoyage/VoyageCardService';

interface ResultPageProps {
  answers: Record<string, string[]>;
  textAnswers: Record<string, string>;
  onRestart: () => void;
  onGoDeepEval?: () => void;
}

type StyleProfile = {
  name: string;
  id: string;
  desc: string;
  scores: number[];
  quote: string;
  coreLabel: string;
  colorGene: string;
  suggestions: string;
};

/** 与 dsphr ResultCard 一致的色彩定义 */
const COLORS: { id: string; hex: string; name: string; background?: string }[] = [
  { id: 'MP01', hex: '#F9F9F9', name: '浅色系' },
  { id: 'MP02', hex: '#EBCF9A', name: '原木色' },
  { id: 'MP03', hex: '#E6DCCF', name: '奶咖色系' },
  { id: 'MP04', hex: '#8D6E63', name: '大地色系' },
  { id: 'MP05', hex: '#3E2723', name: '深色系' },
  { id: 'MP06', hex: '#9E9E9E', name: '黑白灰', background: 'conic-gradient(#1a1a1a 0deg 120deg, #9ca3af 120deg 240deg, #ffffff 240deg 360deg)' },
  { id: 'MP07', hex: '#BF360C', name: '艺术色系', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 20%, #a18cd1 40%, #fbc2eb 60%, #8fd3f4 80%, #84fab0 100%)' },
];

/** 测评结果页 colorGene 文案 -> dsphr COLORS.name */
const COLOR_GENE_TO_DSHR: Record<string, string> = {
  '中性色系': '浅色系',
  '奶油色系': '奶咖色系',
  '原木色系': '原木色',
  '浅色系': '浅色系',
  '大地色系': '大地色系',
  '深色系': '深色系',
  '艺术色系': '艺术色系',
  '黑白灰': '黑白灰',
};

const STYLE_PROFILES: StyleProfile[] = [
  { name: '纯粹极简派', id: 'DS01', desc: '现代简约风，追求极致的清爽与功能主义，浅色系。', scores: [5, 2, 1, 1, 4, 5, 1], quote: '您偏爱克制与留白，更相信"少即是多"。以功能与秩序为先，用极简的表达，容纳日常的高效与安宁。', coreLabel: '极简主义', colorGene: '中性色系', suggestions: '硬装：大面积留白，弱化复杂造型\n软装：低饱和织物、极简灯具\n收纳：隐藏式系统，保持界面干净' },
  { name: '奶油治愈家', id: 'DS02', desc: '治愈奶油风，低饱和度，圆润线条，奶咖色系。', scores: [4, 4, 4, 2, 4, 3, 4], quote: '您追求温柔且可持续的舒适感。更喜欢圆润的边界与柔和的光，让家像一块可以慢慢融化的奶油。', coreLabel: '治愈系', colorGene: '奶油色系', suggestions: '硬装：柔和弧线、浅米色墙面\n软装：绒感织物、奶咖/驼色单品\n灯光：低位氛围灯，避免强对比' },
  { name: '原木自然派', id: 'DS03', desc: '自然原木风，强调材料的原始温度，奶咖色系。', scores: [4, 4, 4, 3, 3, 3, 3], quote: '您更信赖自然材料带来的真实温度。喜欢木纹、肌理与阳光在空间里发生的微小变化，让家保持呼吸感。', coreLabel: '自然主义', colorGene: '原木色系', suggestions: '硬装：木饰面与自然肌理混搭\n软装：棉麻织物、藤编元素\n点缀：绿植与陶器，增强自然气息' },
  { name: '都市精英范', id: 'DS04', desc: '现代轻奢风，精致高级感，浅色系。', scores: [4, 2, 2, 2, 4, 4, 5], quote: '您欣赏现代都市的精致秩序。空间需要体面、利落、有质感的细节，让生活像一套被精心剪裁的西装。', coreLabel: '轻奢主义', colorGene: '浅色系', suggestions: '硬装：石材/金属点缀，比例克制\n软装：皮革、玻璃、线性灯具\n陈列：少而精，强调质感与层次' },
  { name: '意式格调家', id: 'DS05', desc: '意式极简风，克制而高级，大地色系。', scores: [3, 2, 2, 2, 5, 5, 5], quote: '您在克制里追求高级感。更偏好大地色与材质本身的力量，用低调的比例和细节，做出"懂行"的质感。', coreLabel: '意式极简', colorGene: '大地色系', suggestions: '硬装：大板材质、统一纹理\n软装：皮革与织物对比，线条简洁\n灯光：重点照明+洗墙，凸显材质' },
  { name: '浪漫生活家', id: 'DS06', desc: '浪漫轻法式，优雅与松弛并存，原木色。', scores: [4, 4, 3, 4, 2, 3, 4], quote: '您向往优雅但不紧绷的生活状态。喜欢温柔的线条、轻盈的装饰与有故事感的物件，让日常更像一段小电影。', coreLabel: '轻法式', colorGene: '原木色系', suggestions: '硬装：细线条石膏、法式门套\n软装：柔和花纹、轻量装饰\n点缀：黄铜小件，提升精致度' },
  { name: '摩登收藏家', id: 'DS07', desc: '摩登中古风，复古与现代的碰撞，大地色系。', scores: [3, 3, 4, 4, 2, 3, 2], quote: '您喜欢"旧物新生"的魅力。复古的温度与现代的效率在您家里相互平衡，收藏不是堆砌，而是精心挑选。', coreLabel: '中古主义', colorGene: '大地色系', suggestions: '硬装：木色/胡桃木，复古比例\n软装：皮革单椅、复古灯具\n陈列：留白+重点摆放，避免杂乱' },
  { name: '新中式雅客', id: 'DS08', desc: '雅致新中式，传统与现代的融合，浅色系。', scores: [4, 3, 4, 2, 3, 5, 3], quote: '您重视内敛的气韵与秩序。传统的比例、留白与材质，在现代语境里被重新组织，呈现出不张扬的高级。', coreLabel: '新中式', colorGene: '浅色系', suggestions: '硬装：木格栅、留白与对称\n软装：亚麻、陶器与水墨元素\n灯光：柔和漫反射，营造静气' },
  { name: '硬核个性派', id: 'DS09', desc: '硬朗工业风，冷冽与原始，深色系。', scores: [1, 1, 1, 3, 4, 2, 3], quote: '您更偏好硬朗直接的表达。裸露的结构、金属与混凝土的质感，让空间像一座可被使用的城市装置。', coreLabel: '工业风', colorGene: '深色系', suggestions: '硬装：裸顶/微水泥，金属线条\n软装：皮革、黑灰织物\n灯光：轨道灯与点光源，强调结构' },
  { name: '侘寂修行者', id: 'DS10', desc: '静谧侘寂风，残缺之美，深色系。', scores: [2, 2, 5, 1, 1, 2, 1], quote: '您珍惜时间留下的痕迹。家不必完美，粗粝的肌理与低饱和的色彩，反而让您更能安住当下。', coreLabel: '侘寂风', colorGene: '深色系', suggestions: '硬装：肌理墙面、微水泥地面\n软装：亚麻/粗陶，留出呼吸\n陈列：少而有分量，强调质朴' },
  { name: '南洋松弛派', id: 'DS11', desc: '南洋复古风，热带风情与复古，原木色。', scores: [3, 4, 5, 4, 2, 2, 4], quote: '您向往热带的松弛与明快。藤编、绿植与复古色块，让家像一间永远开着窗的度假屋。', coreLabel: '南洋复古', colorGene: '原木色系', suggestions: '硬装：白墙+木色，通透采光\n软装：藤编、绿植、复古花纹\n点缀：彩色器物，营造度假感' },
  { name: '经典传承派', id: 'DS12', desc: '优雅老钱风，经典与底蕴，大地色系。', scores: [2, 3, 4, 5, 1, 5, 5], quote: '您偏爱经得起时间检验的经典。克制的色彩、讲究的材质与比例，构成一种不喧哗的底蕴。', coreLabel: '经典主义', colorGene: '大地色系', suggestions: '硬装：护墙板、经典线脚\n软装：皮革与羊毛织物\n陈列：书籍与艺术品，强调传承感' },
  { name: '视觉冒险家', id: 'DS13', desc: '极繁主义风，大胆与个性，深色系。', scores: [3, 4, 3, 5, 3, 1, 4], quote: '您拒绝平庸与留白，"Less is Bore"。大胆的撞色、琳琅满目的收藏品，您用丰富的视觉元素，把家填满对生活的热爱。', coreLabel: '极繁主义', colorGene: '艺术色系', suggestions: '硬装：彩色墙漆、繁复壁纸、拱门\n软装：异形地毯、各色装饰画、天鹅绒家具' },
  { name: '理性构建者', id: 'DS14', desc: '包豪斯风格，理性与功能，浅色系。', scores: [5, 1, 1, 2, 5, 5, 2], quote: '您更相信结构与功能的逻辑。清晰的几何秩序与克制的颜色，让空间像一套严谨的系统，稳定而高效。', coreLabel: '包豪斯', colorGene: '浅色系', suggestions: '硬装：几何分割与比例控制\n软装：原色点缀，强调功能\n灯光：线性照明，避免花哨装饰' },
];

const DEFAULT_PERSONA = { name: '生活艺术家', desc: '你拥有独特的审美视角。' };
const isWeChat = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

function parseHardSoft(suggestions: string): { hardDecor: string; softDecor: string } {
  let hardDecor = '';
  let softDecor = '';
  suggestions.split('\n').forEach((line) => {
    const t = line.trim();
    if (t.startsWith('硬装')) hardDecor = t.replace(/^硬装[：:]\s*/, '').trim();
    if (t.startsWith('软装')) softDecor = t.replace(/^软装[：:]\s*/, '').trim();
  });
  return { hardDecor, softDecor };
}

export function ResultPage({ answers, textAnswers, onRestart, onGoDeepEval }: ResultPageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const voyageCardSavedRef = useRef(false);

  const mapScore = (optionId: string) => {
    const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
    return map[optionId] || 3;
  };
  const calculateDistance = (s1: number[], s2: number[]) =>
    Math.sqrt(s1.reduce((sum, val, i) => sum + (val - s2[i]) ** 2, 0));
  const results = useMemo(() => {
    const userScores: number[] = [];
    for (let i = 1; i <= 7; i++) {
      const ans = answers[`q${i}`]?.[0];
      userScores.push(ans ? mapScore(ans) : 3);
    }
    return STYLE_PROFILES.map((p) => ({ ...p, distance: calculateDistance(userScores, p.scores) })).sort(
      (a, b) => a.distance - b.distance
    );
  }, [answers]);
  const bestMatch = results[0];
  const cardId = useMemo(() => Math.floor(10000 + Math.random() * 90000), []);
  const persona = useMemo(
    () => ({ name: bestMatch?.name ?? DEFAULT_PERSONA.name, desc: bestMatch?.quote ?? DEFAULT_PERSONA.desc }),
    [bestMatch]
  );
  const { hardDecor, softDecor } = useMemo(() => parseHardSoft(bestMatch?.suggestions ?? ''), [bestMatch]);
  const likedColorsName = bestMatch ? COLOR_GENE_TO_DSHR[bestMatch.colorGene] || bestMatch.colorGene : '';
  const likedColorDef = useMemo(() => COLORS.find((c) => c.name === likedColorsName), [likedColorsName]);
  const heroImage = bestMatch ? `https://picsum.photos/seed/${bestMatch.id}/900/1200` : '';

  useEffect(() => {
    if (!bestMatch || voyageCardSavedRef.current) return;
    voyageCardSavedRef.current = true;
    const payload = {
      visitor_id: getVisitorId(),
      style_id: bestMatch.id,
      style_name: bestMatch.name ?? null,
      focus_space: null as string | null,
      card_number: String(cardId),
    };
    saveVoyageCard(payload).catch((err) => {
      voyageCardSavedRef.current = false;
      console.warn('Voyage card save failed:', err);
    });
  }, [bestMatch, cardId]);

  const handleSaveCard = useCallback(async () => {
    if (!cardRef.current) return;
    setSaveError(null);
    try {
      const dataUrl = await domToPng(cardRef.current, { scale: 2, quality: 1 });
      if (isWeChat) {
        setPreviewImageUrl(dataUrl);
      } else {
        const link = document.createElement('a');
        link.download = `居住人格_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('保存图片失败:', err);
      setSaveError('保存失败，请重试');
    }
  }, []);

  const closePreview = useCallback(() => setPreviewImageUrl(null), []);

  if (!bestMatch) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full min-h-full relative font-sans text-dark bg-[#fffdf3]"
    >
      <div className="min-h-full flex flex-col items-center justify-start pt-6 md:pt-10 p-4 md:p-10 pb-10">
        <div
          ref={cardRef}
          className="w-full max-w-md bg-[#FDFBF7] rounded-[32px] overflow-hidden shadow-2xl relative border border-[#F1ECE4]/80 flex flex-col"
        >
          <div className="relative h-64 md:h-80 w-full shrink-0">
            <img
              src={heroImage}
              alt="Cover"
              width={800}
              height={600}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-5 left-6 right-6 text-white">
              <h1 className="text-3xl md:text-4xl font-sans font-medium tracking-wide text-[#FDFBF7] drop-shadow-md">
                {persona.name}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-5">
            <div className="relative pl-4 border-l-2 border-brand/40">
              <p className="text-sm font-sans italic text-sub leading-relaxed">&quot;{persona.desc}&quot;</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-[#F7F5F0] px-4 py-3 rounded-xl border border-[#EAE5DE]/50">
                <div className="flex items-center gap-2 text-sub">
                  <Layers size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">风格核心</span>
                </div>
                <span className="text-sm font-bold text-dark">{bestMatch.name}</span>
              </div>
              <div className="flex items-center justify-between bg-[#F7F5F0] px-4 py-3 rounded-xl border border-[#EAE5DE]/50">
                <div className="flex items-center gap-2 text-sub">
                  <Palette size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">色彩基因</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                    style={{ background: likedColorDef?.background ?? likedColorDef?.hex ?? '#e5e5e5' }}
                  />
                  <span className="text-sm font-bold text-dark">{likedColorsName || bestMatch.colorGene || '—'}</span>
                </div>
              </div>
              <div className="bg-[#F7F5F0] px-4 py-4 rounded-xl border border-[#EAE5DE]/50 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sub">
                  <Hammer size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">搭配建议</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-sub/70 shrink-0">硬装 |</span>
                    <span className="text-dark/90 font-medium">{hardDecor || '—'}</span>
                  </div>
                  <div className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-sub/70 shrink-0">软装 |</span>
                    <span className="text-dark/90 font-medium">{softDecor || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-between items-end border-t border-black/5">
              <div className="flex flex-col gap-0.5">
                <img src={dreamOneLogo} alt="DREAM.ONE" className="h-5 w-auto object-contain object-left" />
              </div>
              <span className="text-[9px] font-mono text-sub/40">NO.{cardId}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mt-6 flex flex-col gap-3">
          {saveError && <p className="text-red-500 text-xs text-center">{saveError}</p>}
          <button
            type="button"
            onClick={handleSaveCard}
            className="w-full bg-[#2C2825] text-[#F4F1EA] py-3.5 px-5 rounded-xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-between group"
          >
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-sm tracking-widest uppercase">保存我的风格</span>
              <span className="text-[9px] text-white/50 font-light mt-0.5">可分享给家人或设计师</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Download size={14} />
            </div>
          </button>
          <button
            type="button"
            onClick={onGoDeepEval}
            disabled={!onGoDeepEval}
            className="w-full bg-[#EF6B00] text-white py-4 px-5 rounded-xl shadow-lg shadow-[#EF6B00]/20 hover:bg-[#CC5B00] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} fill="currentColor" className="opacity-80" />
            <span className="font-bold text-sm tracking-widest uppercase">填写线索信息获取项目预算分配图</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 text-sub/60 hover:text-dark text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} /> 重新测试
          </button>
        </div>
      </div>

      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label="保存图片"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-md flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="关闭"
            >
              <X size={20} />
            </button>
            <img
              src={previewImageUrl}
              alt="居住人格卡片"
              className="w-full max-w-md rounded-2xl shadow-2xl select-none"
              style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
              draggable={false}
            />
            <p className="text-white/90 text-sm text-center px-4">长按图片保存到相册</p>
          </div>
          <button
            type="button"
            className="mt-4 px-6 py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
            onClick={closePreview}
          >
            关闭
          </button>
        </div>
      )}
    </motion.div>
  );
}
