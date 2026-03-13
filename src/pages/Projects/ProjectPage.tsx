import React, { useEffect, useState } from 'react';
import { FolderOpen, ChevronLeft, ChevronRight, Wallet, Clock, PieChart } from 'lucide-react';
import { StepWrapper } from '../../components/ui';
import { getProjects, type Project } from '../../services/projects';
import { getFundPool, type FundPool } from '../../services/fundPool';

export interface ProjectPageProps {
  onSelectProject: (project: Project) => void;
  onBack?: () => void;
}

function formatCurrency(n: number): string {
  return `¥${n.toLocaleString('zh-CN')}`;
}

export function ProjectPage({ onSelectProject, onBack }: ProjectPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundPool, setFundPool] = useState<FundPool | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getFundPool().then(setFundPool);
  }, []);

  const getProjectDisplayName = (projectId: string, fallbackName?: string) => {
    const p = projects.find((x) => x.id === projectId);
    return fallbackName || p?.name || `项目 ${projectId}`;
  };

  return (
    <StepWrapper noCard>
      <div className="flex flex-col items-center py-8 min-h-[60vh]">
        <div className="w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1 mb-6">
            <FolderOpen className="w-3.5 h-3.5 text-[#EF6B00]" />
            <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">我的项目</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">选择项目</h2>
          <p className="text-sm text-gray-500 mb-6">选择一个项目进入工作台，查看项目概览、需求书与订单等信息。</p>

          {/* 项目选择卡片 - 置顶 */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-100 animate-pulse h-36"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-8 py-12 text-center mb-8">
              <p className="text-gray-500">暂无项目，请先完成注册并创建项目。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col items-stretch text-left hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] hover:border-[#EF6B00]/20 transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <FolderOpen className="w-5 h-5 text-[#EF6B00]/60 shrink-0 mt-0.5" />
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#EF6B00] transition-colors shrink-0" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                  {project.location && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{project.location}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 客户资金池 - 独立区块 */}
          {fundPool && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
                <h3 className="text-base font-semibold text-gray-900">客户资金池</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-[#EF6B00]" />
                    <span className="text-xs font-medium text-gray-500">资金池总额</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(fundPool.totalAmount)}</div>
                </div>
                <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#EF6B00]" />
                    <span className="text-xs font-medium text-gray-500">待分配资金</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(fundPool.pendingAllocation)}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-[#EF6B00]" />
                  <span className="text-xs font-medium text-gray-500">项目分配资金</span>
                  <div className="text-xs text-gray-400 ml-auto text-right leading-snug">
                    <div>合计：已分配资金 / 项目总预算</div>
                    <div className="text-gray-500">
                      {formatCurrency(fundPool.projectAllocations.reduce((s, a) => s + a.amount, 0))} / {formatCurrency(fundPool.projectAllocations.reduce((s, a) => s + a.totalBudget, 0))}
                    </div>
                  </div>
                </div>
                {fundPool.projectAllocations.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">暂无项目分配</p>
                ) : (
                  <div className="space-y-3">
                    {fundPool.projectAllocations.map((pa) => {
                      const progressPercent = pa.totalBudget > 0 ? Math.min(100, (pa.amount / pa.totalBudget) * 100) : 0;
                      return (
                        <div key={pa.projectId} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-800 truncate">{getProjectDisplayName(pa.projectId, pa.projectName)}</span>
                            <span className="text-gray-600 shrink-0 ml-2">{formatCurrency(pa.amount)} / {formatCurrency(pa.totalBudget)}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#EF6B00] transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
              返回
            </button>
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
