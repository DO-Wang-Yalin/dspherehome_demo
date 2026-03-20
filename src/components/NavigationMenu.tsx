import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getNavigationStepsForFlow,
  isRequirementsSupplementFlow,
} from '../utils/navigationConfig';
import { useGlobal } from '../context/GlobalContext';

type NavigationMenuProps = {
  /** 锚点水平位置类，默认贴齐标题栏右缘（与 max-w 内容区一致） */
  anchorClass?: string;
  /** 与兄弟按钮横向排列时设为 true，外层不再使用 absolute 定位 */
  inline?: boolean;
};

export function NavigationMenu({ anchorClass = 'right-0', inline = false }: NavigationMenuProps = {}) {
  const [showMenu, setShowMenu] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);
  const location = useLocation();
  const { activeProjectLeadId } = useGlobal();

  const reqFlow =
    (location.pathname === '/style-eval' || location.pathname === '/deep-eval') &&
    isRequirementsSupplementFlow(location.search);
  const stepsList = getNavigationStepsForFlow(reqFlow);
  const leadIdForNav =
    new URLSearchParams(location.search).get('leadId') || activeProjectLeadId || null;

  const buildStepHref = (step: (typeof stepsList)[0]) => {
    if (step.path === '/deep-eval' && reqFlow) {
      const p = new URLSearchParams((step.search || '').replace(/^\?/, ''));
      p.set('from', 'requirements');
      if (leadIdForNav) p.set('leadId', leadIdForNav);
      return `/deep-eval?${p.toString()}`;
    }
    if (step.path === '/style-eval' && reqFlow) {
      return '/style-eval?from=requirements';
    }
    return `${step.path}${step.search || ''}`;
  };

  const deepStepParam = location.pathname === '/deep-eval' ? new URLSearchParams(location.search).get('step') ?? '0' : null;
  let resolvedCurrentIndex = -1;
  if (location.pathname === '/style-eval') {
    resolvedCurrentIndex = stepsList.findIndex((s) => s.id === 'style-eval');
  } else if (location.pathname === '/deep-eval' && deepStepParam !== null) {
    resolvedCurrentIndex = stepsList.findIndex((s) => {
      if (s.path !== '/deep-eval' || !s.search) return false;
      return (new URLSearchParams(s.search).get('step') ?? '0') === deepStepParam;
    });
  } else {
    const have = new URLSearchParams(location.search.replace(/^\?/, ''));
    if (location.pathname === '/leads' && !have.get('step')) {
      have.set('step', '1');
    }
    resolvedCurrentIndex = stepsList.findIndex((step) => {
      if (step.path !== location.pathname) return false;
      if (!step.search) return true;
      const want = new URLSearchParams(step.search.replace(/^\?/, ''));
      for (const key of want.keys()) {
        if (want.get(key) !== have.get(key)) return false;
      }
      return true;
    });
  }
  const displayIndex = resolvedCurrentIndex !== -1 ? resolvedCurrentIndex : 0;

  return (
    <div
      className={
        inline
          ? `relative z-50 ${anchorClass}`
          : `absolute top-1/2 z-50 -translate-y-1/2 ${anchorClass}`
      }
    >
      <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        aria-expanded={showMenu}
        aria-haspopup="dialog"
        className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <List size={14} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-500">
          <span className="text-[#EF6B00]">{displayIndex + 1}</span> / {stepsList.length}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.button
              key="nav-backdrop"
              type="button"
              aria-label="关闭目录"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px] cursor-pointer border-0 p-0 appearance-none"
            />
            <motion.div
              ref={panelRef}
              key="nav-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nav-menu-title"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full z-[100] mt-2 w-[min(calc(100vw-1.25rem),22rem)] max-h-[min(80vh,28rem)] bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-stone-100 overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center gap-2 shrink-0 bg-white">
                <h2 id="nav-menu-title" className="text-base font-bold text-gray-900">
                  测评目录
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors -mr-1"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-2 custom-scrollbar flex-1 min-h-0">
                <div className="grid grid-cols-1 gap-1">
                  {stepsList.map((step, index) => {
                    const isCurrent = index === resolvedCurrentIndex;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between rounded-xl transition-all border ${
                          isCurrent
                            ? 'bg-[#EF6B00]/5 border-[#EF6B00]/20'
                            : 'hover:bg-stone-50 border-transparent bg-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            navigate(buildStepHref(step));
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left p-3"
                        >
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isCurrent ? 'bg-[#EF6B00] text-white' : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex flex-col items-start min-w-0 gap-0.5">
                            <div className="flex flex-wrap items-center gap-1 min-w-0">
                              {step.qId && (
                                <span className="text-[10px] font-bold text-[#EF6B00] uppercase tracking-wider">
                                  {step.qId}
                                </span>
                              )}
                              {step.fromStyleEval && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0">
                                  风格测评迁入
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium leading-snug ${isCurrent ? 'text-[#EF6B00]' : 'text-gray-700'}`}
                            >
                              {step.title}
                            </span>
                          </div>
                          {isCurrent ? (
                            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
