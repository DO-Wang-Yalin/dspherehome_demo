import React, { useEffect, useState } from 'react';
import { FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepWrapper } from '../../components/ui';
import { getProjects, type Project } from '../../services/projects';

export interface ProjectPageProps {
  onSelectProject: (project: Project) => void;
  onBack?: () => void;
}

export function ProjectPage({ onSelectProject, onBack }: ProjectPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

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
