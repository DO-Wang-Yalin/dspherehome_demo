import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquarePlus,
  X,
  AlertCircle,
  TextQuote,
  Lock,
  ZoomIn,
  LayoutGrid,
  ChevronRight,
  History,
} from 'lucide-react';

// 简单版 cn：支持字符串和对象写法，避免额外依赖
function cn(...classes: Array<string | Record<string, boolean> | undefined | null | false>): string {
  const result: string[] = [];
  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else {
      Object.entries(item).forEach(([key, value]) => {
        if (value) result.push(key);
      });
    }
  }
  return result.join(' ');
}

// --- Types ---
export type Point = { x: number; y: number }; // Percentage based (0-100)
export type TargetType = 'image_point' | 'text_description';
export type VersionStatus = 'draft' | 'published' | 'completed' | 'archived';
export type LockAction = 'next' | 'satisfied';

export interface Annotation {
  id: string;
  targetType: TargetType;
  point?: Point; // Only used if targetType is 'image_point'
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  targetType: TargetType;
  point?: Point; // Only used if targetType is 'image_point'
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PageLock {
  isLocked: boolean;
  lockedAt?: string;
  action?: LockAction;
}

export interface PageSnapshot {
  snapshotId: string;
  versionId: string;
  pageId: string; // Logical ID, stable across versions
  order: number;
  title: string;
  text: string;
  imageUrl: string;
  annotations: Annotation[];
  comments: Comment[];
  lock: PageLock;
}

export interface OrderVersion {
  id: string;
  versionNumber: string;
  name: string;
  status: VersionStatus;
  createdAt: string;
  publishedAt?: string;
  basedOnVersionId?: string;
  pages: PageSnapshot[];
}

export interface DesignOrder {
  id: string;
  orderNumber: string;
  orderName: string;
  clientName: string;
  currentVersionId?: string;
  versions: OrderVersion[];
}

// --- Mock Data（完整还原原项目） ---
export const DESIGN_FEEDBACK_ORDER: DesignOrder = {
  id: 'order-101',
  orderNumber: 'PSO-OD_LHJCF-00471',
  orderName: '瓷砖铺贴-公卫、次卫、厨房墙地铺贴',
  clientName: '张先生',
  currentVersionId: 'v3',
  versions: [
    {
      id: 'v1',
      versionNumber: 'V1',
      name: 'V1.0 初始方案',
      status: 'archived',
      createdAt: '2024-03-01T10:00:00Z',
      publishedAt: '2024-03-01T12:00:00Z',
      pages: [
        {
          snapshotId: 's1-p1',
          versionId: 'v1',
          pageId: 'p1',
          order: 1,
          title: '客厅布局方案',
          text: '采用现代简约风格，强调空间流动性。本方案重点在于打通阳台，增加室内采光。',
          imageUrl: 'https://picsum.photos/seed/living/1200/800',
          annotations: [
            {
              id: 'a1',
              targetType: 'image_point',
              point: { x: 30, y: 40 },
              content: '此处建议放置 L 型沙发',
              createdAt: '2024-03-01T10:00:00Z',
            },
            {
              id: 'a1-2',
              targetType: 'text_description',
              content: '阳台打通后需注意承重梁处理',
              createdAt: '2024-03-01T10:05:00Z',
            },
          ],
          comments: [
            {
              id: 'c1',
              targetType: 'image_point',
              point: { x: 30, y: 40 },
              content: '沙发颜色想要浅灰色',
              createdAt: '2024-03-02T09:00:00Z',
            },
            {
              id: 'c1-2',
              targetType: 'text_description',
              content: '整体采光确实好多了',
              createdAt: '2024-03-02T09:15:00Z',
            },
          ],
          lock: { isLocked: true, lockedAt: '2024-03-02T10:00:00Z', action: 'next' },
        },
        {
          snapshotId: 's1-p2',
          versionId: 'v1',
          pageId: 'p2',
          order: 2,
          title: '主卧软装方案',
          text: '温馨色调，增加储物空间。采用无主灯设计，营造舒适睡眠环境。',
          imageUrl: 'https://picsum.photos/seed/bedroom/1200/800',
          annotations: [],
          comments: [],
          lock: { isLocked: true, lockedAt: '2024-03-02T11:00:00Z', action: 'satisfied' },
        },
      ],
    },
    {
      id: 'v2',
      versionNumber: 'V2',
      name: 'V2.0 深化设计',
      status: 'archived',
      basedOnVersionId: 'v1',
      createdAt: '2024-03-05T14:00:00Z',
      publishedAt: '2024-03-05T15:00:00Z',
      pages: [
        {
          snapshotId: 's2-p1',
          versionId: 'v2',
          pageId: 'p1',
          order: 1,
          title: '客厅布局方案 (已更新)',
          text: '根据反馈调整了家具尺寸，优化了动线。沙发已确认采用浅灰色布艺材质。',
          imageUrl: 'https://picsum.photos/seed/living-v2/1200/800',
          annotations: [
            {
              id: 'a2',
              targetType: 'text_description',
              content: '已将沙发改为浅灰色，并调整了地毯尺寸',
              createdAt: '2024-03-05T14:00:00Z',
            },
          ],
          comments: [],
          lock: { isLocked: true, lockedAt: '2024-03-06T10:00:00Z', action: 'next' },
        },
        {
          snapshotId: 's2-p2',
          versionId: 'v2',
          pageId: 'p2',
          order: 2,
          title: '主卧软装方案 (深化)',
          text: '细化了床头背景墙细节，增加了隐藏式灯带。',
          imageUrl: 'https://picsum.photos/seed/bedroom-v2/1200/800',
          annotations: [
            {
              id: 'a2-2',
              targetType: 'image_point',
              point: { x: 50, y: 30 },
              content: '此处增加隐藏式灯带，色温 3000K',
              createdAt: '2024-03-05T14:10:00Z',
            },
          ],
          comments: [
            {
              id: 'c2',
              targetType: 'image_point',
              point: { x: 50, y: 50 },
              content: '床头柜高度需要确认，是否会挡住插座？',
              createdAt: '2024-03-06T11:00:00Z',
            },
          ],
          lock: { isLocked: true, lockedAt: '2024-03-06T11:00:00Z', action: 'satisfied' },
        },
      ],
    },
    {
      id: 'v3',
      versionNumber: 'V3',
      name: 'V3.0 最终确认方案',
      status: 'completed',
      basedOnVersionId: 'v2',
      createdAt: '2024-03-10T09:00:00Z',
      publishedAt: '2024-03-10T10:00:00Z',
      pages: [
        {
          snapshotId: 's3-p1',
          versionId: 'v3',
          pageId: 'p1',
          order: 1,
          title: '客厅布局方案 (最终确认)',
          text: '所有家具尺寸已核对，动线优化完成。',
          imageUrl: 'https://picsum.photos/seed/living-v3/1200/800',
          annotations: [],
          comments: [],
          lock: { isLocked: true, lockedAt: '2024-03-11T09:00:00Z', action: 'satisfied' },
        },
        {
          snapshotId: 's3-p2',
          versionId: 'v3',
          pageId: 'p2',
          order: 2,
          title: '主卧软装方案 (最终确认)',
          text: '材质与灯光方案已确认。',
          imageUrl: 'https://picsum.photos/seed/bedroom-v3/1200/800',
          annotations: [],
          comments: [],
          lock: { isLocked: true, lockedAt: '2024-03-11T10:00:00Z', action: 'satisfied' },
        },
      ],
    },
  ],
};

const ORDER_VERSIONS = DESIGN_FEEDBACK_ORDER.versions;

// --- History Snapshot Viewer Component (simplified from original) ---
function HistorySnapshotViewer({ snapshot }: { snapshot: PageSnapshot }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const epcCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const commentCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  useEffect(() => {
    const handleResize = () => setRedrawTrigger((prev) => prev + 1);
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => setRedrawTrigger((prev) => prev + 1), 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [snapshot]);

  const getEpcImageIndex = (id: string) => {
    const imageAnnos = snapshot.annotations.filter((a) => a.targetType === 'image_point');
    return imageAnnos.findIndex((a) => a.id === id) + 1;
  };

  const getCommentImageIndex = (id: string) => {
    const imageComments = snapshot.comments.filter((c) => c.targetType === 'image_point');
    return imageComments.findIndex((c) => c.id === id) + 1;
  };

  const drawLines = useCallback(() => {
    if (!containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines: React.ReactNode[] = [];

    const getRelativeCoords = (element: HTMLElement, position: 'left' | 'right' | 'center') => {
      const rect = element.getBoundingClientRect();
      let x = rect.left - containerRect.left;
      if (position === 'right') x += rect.width;
      if (position === 'center') x += rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      return { x, y };
    };

    const getImagePointCoords = (point: Point) => {
      if (!imageContainerRef.current) return null;
      const rect = imageContainerRef.current.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + (rect.width * point.x) / 100,
        y: rect.top - containerRect.top + (rect.height * point.y) / 100,
      };
    };

    const getTextTargetCoords = (side: 'left' | 'right') => {
      if (!textContainerRef.current) return null;
      const rect = textContainerRef.current.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + (side === 'right' ? rect.width : 0),
        y: rect.top - containerRect.top + rect.height / 2,
      };
    };

    snapshot.annotations.forEach((anno) => {
      const cardEl = epcCardRefs.current[anno.id];
      if (!cardEl) return;
      const start = getRelativeCoords(cardEl, 'right');
      let end;
      if (anno.targetType === 'image_point' && anno.point) end = getImagePointCoords(anno.point);
      else end = getTextTargetCoords('left');

      if (start && end) {
        const isHovered = hoveredId === anno.id;
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        lines.push(
          <path
            key={`line-base-${anno.id}`}
            d={path}
            fill="none"
            stroke="#334155"
            strokeWidth={isHovered ? '2' : '1'}
            opacity={isHovered ? 0.8 : 0.2}
            style={{ transition: 'opacity 0.2s ease' }}
          />,
        );
      }
    });

    snapshot.comments.forEach((comment) => {
      const cardEl = commentCardRefs.current[comment.id];
      if (!cardEl) return;
      const start = getRelativeCoords(cardEl, 'left');
      let end;
      if (comment.targetType === 'image_point' && comment.point) end = getImagePointCoords(comment.point);
      else end = getTextTargetCoords('right');

      if (start && end) {
        const isHovered = hoveredId === comment.id;
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        lines.push(
          <path
            key={`line-${comment.id}`}
            d={path}
            fill="none"
            stroke="#4887FF"
            strokeWidth={isHovered ? '2' : '1'}
            opacity={isHovered ? 0.8 : 0.2}
            style={{ transition: 'opacity 0.2s ease' }}
          />,
        );
      }
    });

    return lines;
  }, [snapshot, redrawTrigger, hoveredId]);

  const sortedAnnotations = [...snapshot.annotations].sort((a, b) => {
    if (a.targetType === 'text_description' && b.targetType === 'image_point') return -1;
    if (a.targetType === 'image_point' && b.targetType === 'text_description') return 1;
    return 0;
  });

  const sortedComments = [...snapshot.comments].sort((a, b) => {
    if (a.targetType === 'text_description' && b.targetType === 'image_point') return -1;
    if (a.targetType === 'image_point' && b.targetType === 'text_description') return 1;
    return 0;
  });

  return (
    <div
      className="flex-1 flex flex-row overflow-hidden p-6 gap-6 relative bg-slate-100/50"
      ref={containerRef}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">{drawLines()}</svg>

      {/* Left Column: Annotations */}
      <div className="w-1/5 flex flex-col gap-4 z-20 relative">
        <div className="flex-none bg-[#4887FF] text-white rounded-xl p-3 text-center shadow-sm z-40 relative">
          <h2 className="text-xs font-bold tracking-wide">设计注释 (历史)</h2>
        </div>
        <div
          className="flex-1 overflow-y-auto space-y-3 custom-scrollbar p-4 -mx-4"
          onScroll={() => setRedrawTrigger((prev) => prev + 1)}
        >
          {sortedAnnotations.map((anno) => (
            <div
              key={anno.id}
              ref={(el) => (epcCardRefs.current[anno.id] = el)}
              onMouseEnter={() => setHoveredId(anno.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'bg-white border shadow-sm rounded-xl p-3 relative transition-all mx-1',
                hoveredId === anno.id ? 'border-slate-400 ring-1 ring-slate-500/10' : 'border-white',
              )}
            >
              <div className="absolute -left-2 -top-2 w-5 h-5 bg-[#4887FF] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border border-white z-50">
                {anno.targetType === 'text_description' ? (
                  <TextQuote className="w-2.5 h-2.5" />
                ) : (
                  getEpcImageIndex(anno.id)
                )}
              </div>
              <div className="text-[10px] font-medium text-slate-400 mb-1 uppercase tracking-wider">
                {anno.targetType === 'image_point' ? '图纸位置' : '文字描述'}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{anno.content}</p>
            </div>
          ))}
          {snapshot.annotations.length === 0 && (
            <div className="text-center text-slate-400 text-xs py-8">无设计注释</div>
          )}
        </div>
      </div>

      {/* Middle Column: Main Content */}
      <div className="w-3/5 flex flex-col gap-4 z-20">
        <div className="flex-none bg-white rounded-2xl p-4 text-center border border-slate-200 shadow-sm z-20 relative">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{snapshot.title}</h1>
        </div>

        <div
          ref={textContainerRef}
          className="flex-none bg-white rounded-2xl p-4 text-center border border-slate-200 shadow-sm z-20 relative"
        >
          <p className="text-slate-600 text-sm leading-relaxed">{snapshot.text}</p>
        </div>

        <div
          ref={imageContainerRef}
          className="flex-1 min-h-0 relative flex items-center justify中心 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2 z-20"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={snapshot.imageUrl}
              alt="Snapshot"
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
            />

            {snapshot.annotations
              .filter((a) => a.targetType === 'image_point')
              .map((anno) => (
                <div
                  key={`dot-${anno.id}`}
                  onMouseEnter={() => setHoveredId(anno.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    'absolute w-4 h-4 rounded-full border border-white shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform cursor-pointer z-50',
                    hoveredId === anno.id ? 'bg-[#4887FF] scale-125' : 'bg-[#4887FF]/80',
                  )}
                  style={{ left: `${anno.point?.x}%`, top: `${anno.point?.y}%` }}
                >
                  <span className="text-[8px] text-white font-bold">{getEpcImageIndex(anno.id)}</span>
                </div>
              ))}

            {snapshot.comments
              .filter((c) => c.targetType === 'image_point')
              .map((comment) => (
                <div
                  key={`dot-${comment.id}`}
                  onMouseEnter={() => setHoveredId(comment.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    'absolute w-4 h-4 rounded-full border border-white shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform cursor-pointer z-50',
                    hoveredId === comment.id ? 'bg-[#EF6B00] scale-125' : 'bg-[#FF9C3E]',
                  )}
                  style={{ left: `${comment.point?.x}%`, top: `${comment.point?.y}%` }}
                >
                  <span className="text-[8px] text-white font-bold">{getCommentImageIndex(comment.id)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Right Column: Customer Comments */}
      <div className="w-1/5 flex flex-col gap-4 z-20 relative">
        <div className="flex-none bg-[#FF9C3E] text-white rounded-xl p-3 text-center shadow-sm flex items-center justify-between px-4 z-40 relative">
          <span className="text-xs font-bold tracking-wide">客户反馈</span>
          {snapshot.comments.length === 0 && <span className="text-[10px] opacity-80">无反馈</span>}
        </div>
        <div
          className="flex-1 overflow-y-auto space-y-3 custom-scrollbar p-4 -mx-4"
          onScroll={() => setRedrawTrigger((prev) => prev + 1)}
        >
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              ref={(el) => (commentCardRefs.current[comment.id] = el)}
              onMouseEnter={() => setHoveredId(comment.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'bg-white border shadow-sm rounded-xl p-3 relative transition-all mx-1',
                hoveredId === comment.id ? 'border-[#FF9C3E]/60 ring-1 ring-[#FF9C3E]/15' : 'border-white',
              )}
            >
              <div className="absolute -right-2 -top-2 w-5 h-5 bg-[#FF9C3E] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border border白 z-50">
                {comment.targetType === 'text_description' ? (
                  <TextQuote className="w-2.5 h-2.5" />
                ) : (
                  getCommentImageIndex(comment.id)
                )}
              </div>
              <div className="text-[10px] font-medium text-slate-400 mb-1 uppercase tracking-wider text-right">
                针对: {comment.targetType === 'image_point' ? '图纸位置' : '文字描述'}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {snapshot.comments.length === 0 && (
            <div className="text-center text-slate-400 text-xs py-8">该版本暂无客户反馈记录</div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Page Viewer Component（完整交互版，带图纸打点）
function PageViewer({
  order,
  version,
  initialPageIndex,
  onBack,
  readOnly,
  globalComments,
  onUpdateComments,
  onUpdateProgress,
  initialMaxReachedIndex,
}: {
  order: DesignOrder;
  version: OrderVersion;
  initialPageIndex: number;
  onBack: () => void;
  readOnly: boolean;
  globalComments: Record<string, Comment[]>;
  onUpdateComments: (pageId: string, comments: Comment[]) => void;
  onUpdateProgress: (index: number) => void;
  initialMaxReachedIndex: number;
}) {
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  const [maxReachedPageIndex, setMaxReachedPageIndex] = useState(
    readOnly ? version.pages.length : initialMaxReachedIndex,
  );

  const isThankYouPage = currentPageIndex === version.pages.length;
  const pageSnapshot = version.pages[Math.min(currentPageIndex, version.pages.length - 1)];

  // 当前页评论：优先使用会话里的编辑结果
  const comments = globalComments[pageSnapshot.pageId] || pageSnapshot.comments || [];
  const isPageLocked = readOnly || currentPageIndex < maxReachedPageIndex;

  const [isAddingCommentToImage, setIsAddingCommentToImage] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPreviewVersionId, setHistoryPreviewVersionId] = useState<string | null>(null);
  const [editingCommentIds, setEditingCommentIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const epcCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const commentCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [redrawTrigger, setRedrawTrigger] = useState(0);

  useEffect(() => {
    const handleResize = () => setRedrawTrigger((prev) => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setRedrawTrigger((prev) => prev + 1), 50);
    return () => clearTimeout(timer);
  }, [comments, currentPageIndex, pageSnapshot]);

  useEffect(() => {
    if (!readOnly) {
      onUpdateProgress(maxReachedPageIndex);
    }
  }, [maxReachedPageIndex, readOnly, onUpdateProgress]);

  const updateCurrentPageComments = (newComments: Comment[]) => {
    onUpdateComments(pageSnapshot.pageId, newComments);
  };

  const sortedAnnotations = [...pageSnapshot.annotations].sort((a, b) => {
    if (a.targetType === 'text_description' && b.targetType === 'image_point') return -1;
    if (a.targetType === 'image_point' && b.targetType === 'text_description') return 1;
    return 0;
  });

  const sortedComments = [...comments].sort((a, b) => {
    if (a.targetType === 'text_description' && b.targetType === 'image_point') return -1;
    if (a.targetType === 'image_point' && b.targetType === 'text_description') return 1;
    return 0;
  });

  const getEpcImageIndex = (id: string) => {
    const imageAnnos = pageSnapshot.annotations.filter((a) => a.targetType === 'image_point');
    return imageAnnos.findIndex((a) => a.id === id) + 1;
  };

  const getCommentImageIndex = (id: string) => {
    const imageComments = comments.filter((c) => c.targetType === 'image_point');
    return imageComments.findIndex((c) => c.id === id) + 1;
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.marker-dot')) return;

    if (!isAddingCommentToImage) {
      setIsLightboxOpen(true);
      return;
    }

    if (isPageLocked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newCommentId = `comment-${Date.now()}`;
    const newComment: Comment = {
      id: newCommentId,
      targetType: 'image_point',
      point: { x, y },
      content: '',
      createdAt: new Date().toISOString(),
    };

    updateCurrentPageComments([...comments, newComment]);
    setEditingCommentIds((prev) => new Set(prev).add(newCommentId));
    setIsAddingCommentToImage(false);
  };

  const handleAddTextComment = () => {
    if (isPageLocked) return;
    const newCommentId = `comment-${Date.now()}`;
    const newComment: Comment = {
      id: newCommentId,
      targetType: 'text_description',
      content: '',
      createdAt: new Date().toISOString(),
    };
    updateCurrentPageComments([...comments, newComment]);
    setEditingCommentIds((prev) => new Set(prev).add(newCommentId));
  };

  const updateComment = (id: string, content: string) => {
    if (isPageLocked) return;
    updateCurrentPageComments(comments.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const deleteComment = (id: string) => {
    if (isPageLocked) return;
    updateCurrentPageComments(comments.filter((c) => c.id !== id));
    setEditingCommentIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const saveComment = (id: string) => {
    if (isPageLocked) return;
    const comment = comments.find((c) => c.id === id);
    if (comment && !comment.content.trim()) {
      deleteComment(id);
    } else {
      setEditingCommentIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const lockAndCleanCurrentPage = () => {
    const cleanedComments = comments.filter((c) => c.content.trim() !== '');
    updateCurrentPageComments(cleanedComments);
    setEditingCommentIds(new Set());
  };

  const goToNextPage = () => {
    lockAndCleanCurrentPage();
    if (currentPageIndex < version.pages.length) {
      const nextIndex = currentPageIndex + 1;
      setMaxReachedPageIndex(Math.max(maxReachedPageIndex, nextIndex));
      setCurrentPageIndex(nextIndex);
      setShowConfirmDialog(false);
      setIsAddingCommentToImage(false);
    }
  };

  const handleNextPageClick = () => {
    if (isThankYouPage) return;
    const hasValidComments = comments.some((c) => c.content.trim() !== '');
    if (hasValidComments || isPageLocked) {
      goToNextPage();
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handlePrevPageClick = () => {
    lockAndCleanCurrentPage();
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setShowConfirmDialog(false);
      setIsAddingCommentToImage(false);
    }
  };

  const drawLines = useCallback(() => {
    if (!containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines: React.ReactNode[] = [];

    const getRelativeCoords = (element: HTMLElement, position: 'left' | 'right' | 'center') => {
      const rect = element.getBoundingClientRect();
      let x = rect.left - containerRect.left;
      if (position === 'right') x += rect.width;
      if (position === 'center') x += rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      return { x, y };
    };

    const getImagePointCoords = (point: Point) => {
      if (!imageContainerRef.current) return null;
      const rect = imageContainerRef.current.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + (rect.width * point.x) / 100,
        y: rect.top - containerRect.top + (rect.height * point.y) / 100,
      };
    };

    const getTextTargetCoords = (side: 'left' | 'right') => {
      if (!textContainerRef.current) return null;
      const rect = textContainerRef.current.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + (side === 'right' ? rect.width : 0),
        y: rect.top - containerRect.top + rect.height / 2,
      };
    };

    pageSnapshot.annotations.forEach((anno) => {
      const cardEl = epcCardRefs.current[anno.id];
      if (!cardEl) return;
      const start = getRelativeCoords(cardEl, 'right');
      let end;
      if (anno.targetType === 'image_point' && anno.point) end = getImagePointCoords(anno.point);
      else end = getTextTargetCoords('left');

      if (start && end) {
        const isHoveredAnno = hoveredId === anno.id;
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        if (isHoveredAnno) {
          lines.push(
            <path
              key={`line-glow-${anno.id}`}
              d={path}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              opacity={0.8}
              style={{ transition: 'opacity 0.2s ease' }}
            />,
          );
        }
        lines.push(
          <path
            key={`line-base-${anno.id}`}
            d={path}
            fill="none"
            stroke="#334155"
            strokeWidth={isHoveredAnno ? '3' : '1.5'}
            opacity={isHoveredAnno ? 1 : 0.15}
            style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
          />,
        );
      }
    });

    comments.forEach((comment) => {
      const cardEl = commentCardRefs.current[comment.id];
      if (!cardEl) return;
      const start = getRelativeCoords(cardEl, 'left');
      let end;
      if (comment.targetType === 'image_point' && comment.point) end = getImagePointCoords(comment.point);
      else end = getTextTargetCoords('right');

      if (start && end) {
        const isHoveredComment = hoveredId === comment.id;
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        if (isHoveredComment) {
          lines.push(
            <path
              key={`line-glow-${comment.id}`}
              d={path}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              opacity={0.8}
              style={{ transition: 'opacity 0.2s ease' }}
            />,
          );
        }
        lines.push(
          <path
            key={`line-${comment.id}`}
            d={path}
            fill="none"
            stroke="#4887FF"
            strokeWidth={isHoveredComment ? '3' : '1.5'}
            opacity={isHoveredComment ? 1 : 0.15}
            style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
          />,
        );
      }
    });

    return lines;
  }, [pageSnapshot, comments, redrawTrigger, hoveredId]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-120px)] w-full overflow-hidden bg-[#FFFDF3] font-sans flex flex-col relative rounded-3xl border border-gray-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
    >
      {/* 订单标题栏 */}
      <div className="flex-shrink-0 px-6 py-3 bg-white/60 backdrop-blur-md border-b border-gray-100 flex items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate">
            {order.orderNumber}
            <span className="text-slate-400 font-normal mx-2">·</span>
            {order.orderName}
          </span>
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{version.name}</span>
      </div>

      {/* 背景渐变 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#60DFF6]/25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#4887FF]/20 blur-[120px] pointer-events-none" />

      {/* 连线层 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
        {!isThankYouPage && drawLines()}
      </svg>

      {isThankYouPage ? (
        <div className="flex-1 flex flex-col items-center justify-center z-20 text-center p-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">感谢您的审阅</h1>
          <p className="text-slate-600 text-lg max-w-md leading-relaxed mb-12">
            您的反馈已全部提交。设计师将根据您的意见进行修改，并在完成后通知您。
          </p>
          <div className="flex gap-4">
            <button
              onClick={handlePrevPageClick}
              className="px-8 py-3.5 bg-white/80 backdrop-blur-xl border border-white/50 text-slate-700 rounded-full font-medium hover:bg-white transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> 返回查看
            </button>
            <button
              onClick={onBack}
              className="px-8 py-3.5 bg-[#FF9C3E] text-white rounded-full font-medium hover:bg-[#EF6B00] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <LayoutGrid className="w-4 h-4" /> 返回订单总览
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-row overflow-hidden p-6 pb-28 gap-6">
          {/* 左侧 EPC 标注 */}
          <div className="w-1/5 flex flex-col gap-4">
            <div className="flex items-center justify-start gap-2 px-1">
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/50 text-slate-700 hover:text-[#4887FF] hover:bg-white rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5 transition-all"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>返回总览</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden">
              <div className="p-5 border-b border-white/50 flex justify-between items-center pt-5">
                <div>
                  <h2 className="font-semibold text-slate-800 tracking-wide">EPC 标注</h2>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Design Notes</p>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar"
                onScroll={() => setRedrawTrigger((prev) => prev + 1)}
              >
                {sortedAnnotations.map((anno) => (
                  <div
                    key={anno.id}
                    ref={(el) => (epcCardRefs.current[anno.id] = el)}
                    onMouseEnter={() => setHoveredId(anno.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'bg-white/80 backdrop-blur-md border shadow-sm rounded-2xl p-4 relative transition-all hover:shadow-md',
                      hoveredId === anno.id ? 'border-slate-400 ring-2 ring-slate-500/10' : 'border-white',
                    )}
                  >
                    <div className="absolute -left-3 -top-3 w-7 h-7 bg-[#4887FF] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
                      {anno.targetType === 'text_description' ? (
                        <TextQuote className="w-3.5 h-3.5" />
                      ) : (
                        getEpcImageIndex(anno.id)
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                      {anno.targetType === 'image_point' ? '图纸位置' : '文字描述'}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{anno.content}</p>
                  </div>
                ))}
                {pageSnapshot.annotations.length === 0 && (
                  <div className="text-center text-slate-400 text-sm py-10">暂无设计注释</div>
                )}
              </div>
            </div>
          </div>

          {/* 中间内容：标题 + 文本 + 图纸 */}
          <div className="w-3/5 flex flex-col gap-6">
            <div className="flex-none bg-white/60 backdrop-blur-2xl rounded-3xl p-5 md:p-6 text-center border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                {pageSnapshot.title}
              </h1>
            </div>

            <div
              ref={textContainerRef}
              className="flex-none bg-white/60 backdrop-blur-2xl rounded-3xl p-5 md:p-6 text-center border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group"
            >
              <p className="text-slate-600 text-sm md:text-base max-w-4xl mx-auto leading-relaxed">
                {pageSnapshot.text}
              </p>
              {!isPageLocked && (
                <button
                  onClick={handleAddTextComment}
                  className="absolute top-3 right-3 p-2 bg-[#FFF4E0] text-[#C87800] rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FFE4B5] border border-[#FFD699]/60 shadow-sm hover:shadow"
                  title="对这段文字发表意见"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="flex-1 min-h-0 relative flex items-center justify-center p-3 group"
            >
              <div
                className={cn(
                  'absolute inset-0 bg-white/60 backdrop-blur-2xl rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 -z-10',
                  isAddingCommentToImage && !isPageLocked ? 'border-[#FF9C3E]/70 ring-4 ring-[#FF9C3E]/20' : 'border-white/80',
                )}
              />

              {isAddingCommentToImage && !isPageLocked && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#EF6B00]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-[60] pointer-events-none">
                  请点击图纸上的具体位置进行标注
                </div>
              )}

              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={pageSnapshot.imageUrl}
                  alt="CAD Floor Plan"
                  className={cn(
                    'w-full h-full object-contain rounded-2xl bg-white/50 relative z-10 transition-transform duration-300',
                    !isAddingCommentToImage && 'cursor-zoom-in group-hover:scale-[1.01]',
                  )}
                  referrerPolicy="no-referrer"
                />

                {!isAddingCommentToImage && (
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5" /> 点击查看大图
                  </div>
                )}
              </div>

              {pageSnapshot.annotations
                .filter((a) => a.targetType === 'image_point')
                .map((anno) => (
                  <div
                    key={`dot-${anno.id}`}
                    onMouseEnter={() => setHoveredId(anno.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'marker-dot absolute w-5 h-5 rounded-full border-[2.5px] border-white shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform cursor-pointer',
                      hoveredId === anno.id ? 'bg-[#4887FF] scale-125 z-[60]' : 'bg-[#4887FF]/80 z-50',
                    )}
                    style={{ left: `${anno.point?.x}%`, top: `${anno.point?.y}%` }}
                  >
                    <span className="text-[9px] text-white font-bold">{getEpcImageIndex(anno.id)}</span>
                  </div>
                ))}

              {comments
                .filter((c) => c.targetType === 'image_point')
                .map((comment) => (
                  <div
                    key={`dot-${comment.id}`}
                    onMouseEnter={() => setHoveredId(comment.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'marker-dot absolute w-5 h-5 rounded-full border-[2.5px] border-white shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform cursor-pointer',
                      hoveredId === comment.id
                        ? 'bg-gradient-to-br from-[#EF6B00] to-[#FF9C3E] scale-125 z-[60]'
                        : 'bg-gradient-to-br from-[#FF9C3E] to-[#EF6B00] z-50',
                    )}
                    style={{ left: `${comment.point?.x}%`, top: `${comment.point?.y}%` }}
                  >
                    <span className="text-[9px] text-white font-bold">{getCommentImageIndex(comment.id)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* 右侧客户反馈 */}
          <div className="w-1/5 flex flex-col gap-4">
            <div className="flex items-center justify-end gap-2 px-1">
              <button
                className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/50 text-slate-500 hover:text-slate-700 hover:bg-white rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5 transition-all"
                title="查看历史版本"
                onClick={() => {
                  setShowHistoryModal(true);
                  const historyVersions = ORDER_VERSIONS.filter((v) => v.id !== version.id);
                  if (historyVersions.length > 0) {
                    setHistoryPreviewVersionId(historyVersions[0].id);
                  }
                }}
              >
                <History className="w-3.5 h-3.5" />
                <span>历史</span>
              </button>
              <div className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/50 text-slate-700 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    readOnly ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse',
                  )}
                />
                {version.name.split(' ')[0]}
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative">
              {isPageLocked && (
                <div className="absolute top-0 left-0 right-0 h-16 bg-slate-50/80 backdrop-blur-sm z-10 flex items-center justify-center border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <Lock className="w-4 h-4" /> {readOnly ? '历史版本仅供查看' : '本页已提交，不可修改'}
                  </div>
                </div>
              )}

              <div className="p-5 border-b border-white/50 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-slate-800 tracking-wide">客户反馈</h2>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Your Comments</p>
                </div>
                {!isPageLocked && (
                  <button
                    onClick={() => setIsAddingCommentToImage(!isAddingCommentToImage)}
                    className={cn(
                      'p-2 rounded-xl transition-all text-sm font-medium flex items-center gap-1 shadow-sm',
                      isAddingCommentToImage
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-[#4887FF]/10 text-[#4887FF] hover:bg-[#4887FF]/20 border border-[#4887FF]/30',
                    )}
                  >
                    {isAddingCommentToImage ? '取消标注' : '图纸打点'}
                  </button>
                )}
              </div>

              <div
                className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar"
                onScroll={() => setRedrawTrigger((prev) => prev + 1)}
              >
                {sortedComments.map((comment) => (
                  <div
                    key={comment.id}
                    ref={(el) => (commentCardRefs.current[comment.id] = el)}
                    onMouseEnter={() => setHoveredId(comment.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'backdrop-blur-md border shadow-sm rounded-2xl p-4 relative transition-all hover:shadow-md',
                      editingCommentIds.has(comment.id)
                        ? 'bg-white/90 border-[#4887FF]/40 ring-2 ring-[#4887FF]/20'
                        : hoveredId === comment.id
                          ? 'bg-white/90 border-[#4887FF]/50 ring-2 ring-[#4887FF]/25'
                          : 'bg-white/80 border-white',
                      isPageLocked && 'opacity-90 grayscale-[20%]',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute -right-3 -top-3 w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white',
                        isPageLocked
                          ? 'bg-slate-400'
                          : 'bg-[#FF9C3E]',
                      )}
                    >
                      {comment.targetType === 'text_description' ? (
                        <TextQuote className="w-3.5 h-3.5" />
                      ) : (
                        getCommentImageIndex(comment.id)
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-2.5">
                      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        针对: {comment.targetType === 'image_point' ? '图纸位置' : '文字描述'}
                      </div>
                      {!isPageLocked && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {editingCommentIds.has(comment.id) && !isPageLocked ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          autoFocus
                          value={comment.content}
                          onChange={(e) => updateComment(comment.id, e.target.value)}
                          placeholder="请输入您的修改意见..."
                          className="w-full text-sm p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9C3E]/30 focus:border-[#FF9C3E]/50 resize-none h-24 transition-all"
                        />
                        <button
                          onClick={() => saveComment(comment.id)}
                          className="bg-[#FF9C3E] text-white text-xs py-2 rounded-xl font-medium hover:bg-[#EF6B00] transition-all shadow-sm"
                        >
                          确认保存
                        </button>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'text-sm text-slate-700 leading-relaxed p-2 -mx-2 rounded-xl transition-colors',
                          !isPageLocked && 'cursor-pointer hover:bg-slate-50/50',
                        )}
                        onClick={() => !isPageLocked && setEditingCommentIds((prev) => new Set(prev).add(comment.id))}
                        title={isPageLocked ? '' : '点击修改'}
                      >
                        {comment.content}
                      </div>
                    )}
                  </div>
                ))}

                {comments.length === 0 && !isAddingCommentToImage && (
                  <div className="text-center text-slate-400 text-sm py-12 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <MessageSquarePlus className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="leading-relaxed">
                      {isPageLocked ? '本页无反馈意见' : '点击上方按钮或文字框\n添加您的反馈意见'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航 + 满意按钮 */}
      {!isThankYouPage && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
          {currentPageIndex > 0 && (
            <button
              onClick={handlePrevPageClick}
              className="px-6 py-3.5 bg-white/80 backdrop-blur-xl border border-white/50 text-slate-700 rounded-full font-medium hover:bg-white transition-all flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <ArrowLeft className="w-4 h-4" /> 上一页
            </button>
          )}
          <button
            onClick={handleNextPageClick}
            className="px-8 py-3.5 bg-white/80 backdrop-blur-xl border border-white/50 text-slate-700 rounded-full font-medium hover:bg-white transition-all flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            {currentPageIndex === version.pages.length - 1 ? '完成审阅' : '下一页'}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
          {!readOnly && (
            <button
              onClick={goToNextPage}
              className="px-8 py-3.5 bg-gradient-to-r from-[#FF9C3E] to-[#EF6B00] text-white rounded-full font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_8px_30px_rgba(255,156,62,0.3)] hover:shadow-[0_8px_30px_rgba(255,156,62,0.4)]"
            >
              {currentPageIndex === version.pages.length - 1 ? '满意并提交' : '满意 😄'}
            </button>
          )}
        </div>
      )}

      {/* 页码显示 */}
      {!isThankYouPage && (
        <div className="absolute bottom-8 right-8 px-5 py-2.5 bg-white/60 backdrop-blur-xl border border-white/50 text-slate-600 rounded-full text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-50 tracking-widest">
          {currentPageIndex + 1} / {version.pages.length}
        </div>
      )}

      {/* 没有反馈时的确认弹窗 */}
      {showConfirmDialog && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-white">
            <div className="flex items-center gap-3 text-indigo-500 mb-5">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">这页方案还满意吗？</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              我看您在这页还没有留下反馈哦。如果觉得方案不错，我们可以直接看下一页；如果有任何小想法，随时欢迎补充～
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100/80 rounded-xl transition-colors"
              >
                返回写点意见
              </button>
              <button
                onClick={goToNextPage}
                className="px-5 py-2.5 text-sm font-medium bg-[#FF9C3E] text-white hover:bg-[#EF6B00] rounded-xl transition-all shadow-md"
              >
                挺满意的，下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 大图预览 */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={pageSnapshot.imageUrl}
            alt="Full Screen View"
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 历史版本大弹窗 */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-[95vw] h-[90vh] max-w-[1600px] rounded-[32px] shadow-2xl flex overflow-hidden relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-all shadow-sm border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 mb-1">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold tracking-tight">历史版本</h3>
                </div>
                <p className="text-xs text-slate-400">选择版本查看当时的设计快照</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {ORDER_VERSIONS.map((v, idx) => {
                  const isCurrent = v.id === version.id;
                  const isActive = historyPreviewVersionId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setHistoryPreviewVersionId(v.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-2xl border transition-all relative group',
                        isActive
                          ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-500/10'
                          : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-200',
                      )}
                    >
                      {idx !== ORDER_VERSIONS.length - 1 && (
                        <div className="absolute left-[1.65rem] top-12 bottom-[-1rem] w-0.5 bg-slate-200 -z-10" />
                      )}
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-3 h-3 mt-1.5 rounded-full border-2 flex-shrink-0',
                            isActive
                              ? 'bg-indigo-500 border-indigo-500'
                              : isCurrent
                                ? 'bg-emerald-400 border-emerald-400'
                                : 'bg-slate-300 border-slate-300',
                          )}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                'text-xs font-bold px-2 py-0.5 rounded',
                                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600',
                              )}
                            >
                              {v.name.split(' ')[0]}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                                当前
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {new Date(v.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 bg-slate-100/50 relative flex flex-col overflow-hidden">
              {(() => {
                const previewVersion = ORDER_VERSIONS.find((v) => v.id === historyPreviewVersionId);
                const snapshot = previewVersion?.pages.find((p) => p.pageId === pageSnapshot.pageId);
                if (!previewVersion || !snapshot) {
                  return (
                    <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <p>该版本中无此页面的快照数据</p>
                    </div>
                  );
                }
                return (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-30 relative shadow-sm">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-800">{snapshot.title}</h2>
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded border border-slate-200">
                          {previewVersion.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>只读快照模式</span>
                      </div>
                    </div>
                    <HistorySnapshotViewer snapshot={snapshot} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 自定义滚动条样式（局部作用于 custom-scrollbar 类） */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `,
        }}
      />
    </div>
  );
}

// 3. 简化后的订单总览 + 查看入口
function DesignOverview({
  order,
  onStartView,
}: {
  order: DesignOrder;
  onStartView: (versionId: string) => void;
}) {
  const activeVersion = order.versions.find((v) => v.id === order.currentVersionId) || order.versions[0];

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-4xl mb-6">
        <div className="text-sm font-medium text-slate-600 mb-1">订单总览</div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {order.orderNumber}
          <span className="text-slate-400 font-normal mx-2">·</span>
          {order.orderName}
        </h1>
        <p className="text-slate-500 text-xs mt-2">
          {order.clientName} · {order.versions.length} 个版本
        </p>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-8 w-full max-w-4xl mb-10 border border-white/50 relative overflow-hidden">
        {/* 待审阅角标 */}
        <div className="absolute top-0 right-0">
          <div className="bg-amber-500 text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            待审阅
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF9C3E] text-white px-3 py-1 rounded-full text-sm font-bold">
              {activeVersion.name.split(' ')[0]}
            </div>
            <span className="text-slate-600 font-medium">进行中</span>
          </div>
          <div className="text-slate-400 text-sm font-mono">
            已回复 0 / {activeVersion.pages.length}
          </div>
        </div>

        {/* 缩略图网格 */}
        <div className="grid grid-cols-6 gap-4 mb-10">
          {activeVersion.pages.map((page, idx) => (
            <div
              key={page.snapshotId}
              className="aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative group"
            >
              <img
                src={page.imageUrl}
                alt={page.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="absolute inset-0 bg-transparent" />
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - activeVersion.pages.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-slate-50/50 rounded-xl border border-dashed border-slate-200"
            />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => onStartView(activeVersion.id)}
            className="bg-gradient-to-r from-[#FF9C3E] to-[#EF6B00] text-white px-10 py-3.5 rounded-full font-medium shadow-lg shadow-[#FF9C3E]/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            继续查看 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 历史版本 */}
      {order.versions.filter((v) => v.id !== activeVersion.id).length > 0 && (
        <div className="w-full max-w-4xl space-y-4">
          <h3 className="text-slate-400 text-sm font-medium ml-2">历史版本</h3>
          {order.versions
            .filter((v) => v.id !== activeVersion.id)
            .map((version) => (
              <div
                key={version.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-between border border-white/50 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {version.name.split(' ')[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">
                      {version.status === 'completed' ? '已完成' : '已归档'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono mt-0.5">
                      {version.pages.length} / {version.pages.length} Pages
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-70">
                  {version.pages.slice(0, 5).map((p) => (
                    <div key={p.snapshotId} className="w-12 h-8 bg-slate-100 rounded-md overflow-hidden">
                      <img
                        src={p.imageUrl}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onStartView(version.id)}
                  className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors px-4 py-2"
                >
                  查看回顾
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// 4. 对外暴露的主组件：供 Step 中直接使用（完整沿用原项目 App 逻辑）
export function DesignFeedbackApp({ onGoHome }: { onGoHome?: () => void }) {
  const [currentView, setCurrentView] = useState<'overview' | 'viewer'>('overview');
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isViewerReadOnly, setIsViewerReadOnly] = useState(false);

  // 全局评论状态：Record<versionId, Record<pageId, Comment[]>>
  const [allComments, setAllComments] = useState<Record<string, Record<string, Comment[]>>>({});

  // 进度状态：Record<versionId, maxReachedIndex>
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const handleSelectVersion = useCallback((versionId: string, readOnly: boolean) => {
    setActiveVersionId(versionId);
    setIsViewerReadOnly(readOnly);
    setCurrentView('viewer');
  }, []);

  const handleBackToOverview = useCallback(() => {
    setCurrentView('overview');
    setActiveVersionId(null);
  }, []);

  const handleUpdateComments = useCallback((versionId: string, pageId: string, comments: Comment[]) => {
    setAllComments((prev) => ({
      ...prev,
      [versionId]: {
        ...(prev[versionId] || {}),
        [pageId]: comments,
      },
    }));
  }, []);

  const handleUpdateProgress = useCallback((versionId: string, index: number) => {
    setProgressMap((prev) => {
      const current = prev[versionId] || 0;
      if (index <= current) return prev;
      return {
        ...prev,
        [versionId]: index,
      };
    });
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {currentView === 'overview' && (
        <DesignOverview
          order={DESIGN_FEEDBACK_ORDER}
          onStartView={(versionId) => handleSelectVersion(versionId, false)}
        />
      )}

      {currentView === 'viewer' && activeVersionId && (
        <PageViewer
          order={DESIGN_FEEDBACK_ORDER}
          version={ORDER_VERSIONS.find((v) => v.id === activeVersionId)!}
          initialPageIndex={0}
          onBack={handleBackToOverview}
          readOnly={isViewerReadOnly}
          globalComments={allComments[activeVersionId] || {}}
          onUpdateComments={(pageId, comments) => handleUpdateComments(activeVersionId, pageId, comments)}
          onUpdateProgress={(index) => handleUpdateProgress(activeVersionId, index)}
          initialMaxReachedIndex={progressMap[activeVersionId] || 0}
        />
      )}
    </div>
  );
}

