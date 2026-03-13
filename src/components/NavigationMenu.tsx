import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_STEPS } from '../utils/navigationConfig';

export function NavigationMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Find current step index based on path and search
  const currentStepIndex = NAVIGATION_STEPS.findIndex(step => {
    if (step.path !== location.pathname) return false;
    if (step.search) {
      // Simple check: if step defines a search, current location must include it
      // Note: This is a bit fragile if params order changes, but sufficient for ?step=X
      return location.search.includes(step.search);
    }
    return true;
  });

  // If not found, maybe default to the first step of the path?
  // Or just don't highlight.
  const displayIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <>
      <button
        onClick={() => setShowMenu(true)}
        className="absolute right-0 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors z-50"
      >
        <List size={14} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-500">
          <span className="text-[#EF6B00]">{displayIndex + 1}</span> / {NAVIGATION_STEPS.length}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">测评目录</h2>
                <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                  {NAVIGATION_STEPS.map((step, index) => {
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
                          isCurrent
                            ? 'bg-[#EF6B00]/5 border-[#EF6B00]/20'
                            : 'hover:bg-gray-50 border-transparent bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`${step.path}${step.search || ''}`);
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent ? 'bg-[#EF6B00] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex flex-col items-start min-w-0">
                            {step.qId && (
                              <span className="text-[10px] font-bold text-[#EF6B00] uppercase tracking-wider mb-0.5">
                                {step.qId}
                              </span>
                            )}
                            <span className={`font-medium truncate ${isCurrent ? 'text-[#EF6B00]' : 'text-gray-700'}`}>
                              {step.title}
                            </span>
                          </div>
                          {isCurrent && (
                            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
