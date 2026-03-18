import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Code2,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { PROJECT_COVER_PLACEHOLDERS } from '../../services/projects';
import {
  getPendingLeads,
  getConvertedLeads,
  deleteUserLead,
  type UserLead,
} from '../../services/leads/savedLeadsStorage';
import { LeadEditModal } from './LeadEditModal';

export interface ProjectFromLead {
  id: string;
  leadId: string;
  name: string;
  location?: string;
  coverImage?: string;
}

function projectTypeShort(apiValue: string): string {
  if (!apiValue) return '';
  const after = apiValue.replace(/^[HAT]_/, '');
  const i = after.indexOf(' ');
  return i >= 0 ? after.slice(0, i).trim() : after.trim();
}

function budgetLabel(lead: UserLead): string {
  const b = lead.budget;
  if (!b) return '预算待定';
  if (/^\d+$/.test(b)) {
    const area = parseFloat(lead.area) || 0;
    if (area > 0) {
      const t = (area * Number(b)) / 10000;
      if (t >= 100) return `约 ${Math.round(t)}w+`;
      return `约 ${t.toFixed(0)}w`;
    }
    return `${b} 元/㎡`;
  }
  return b.slice(b.indexOf(' ') + 1) || b;
}

function galleryForProject(index: number): string[] {
  const n = PROJECT_COVER_PLACEHOLDERS.length;
  return [0, 1, 2].map((k) => PROJECT_COVER_PLACEHOLDERS[(index * 3 + k) % n]);
}

export interface ProjectPageProps {
  onSelectProject: (project: ProjectFromLead) => void;
  onBack?: () => void;
  onDevEnterWorkbench?: () => void;
}

export function ProjectPage({
  onSelectProject,
  onBack,
  onDevEnterWorkbench,
}: ProjectPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'leads'>('projects');
  const [pending, setPending] = useState<UserLead[]>([]);
  const [converted, setConverted] = useState<UserLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<UserLead | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setPending(getPendingLeads());
    setConverted(getConvertedLeads());
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  const hasSignedProjects = converted.length > 0;

  const openEdit = (lead: UserLead) => {
    setEditingLead(lead);
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteUserLead(id);
    refresh();
    setDeleteConfirmId(null);
  };

  const goSignContract = (leadId: string) => {
    navigate(`/contracts?leadId=${encodeURIComponent(leadId)}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F4]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-8 sm:pt-10 pb-24">
        {onDevEnterWorkbench && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={onDevEnterWorkbench}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/90 px-3 py-2 text-xs font-medium text-violet-800"
            >
              <Code2 className="w-3.5 h-3.5" />
              开发：进入工作台
            </button>
          </div>
        )}

        <header className="mb-8 sm:mb-10">
          <h1 className="text-[1.65rem] sm:text-3xl font-serif font-semibold text-[#EF6B00] tracking-tight leading-tight">
            欢迎回家
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] text-gray-500 leading-relaxed max-w-lg">
            筑家之旅的每一步，都在这里与您同步。
          </p>
        </header>

        {hasSignedProjects && (
          <div className="flex gap-8 sm:gap-10 border-b border-[#E8E4DC] mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`pb-3 text-[15px] sm:text-base transition-colors relative ${
                activeTab === 'projects'
                  ? 'font-semibold text-[#2C2825]'
                  : 'text-gray-400 font-medium hover:text-gray-600'
              }`}
            >
              已签约项目（{converted.length}）
              {activeTab === 'projects' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EF6B00] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`pb-3 text-[15px] sm:text-base transition-colors relative ${
                activeTab === 'leads'
                  ? 'font-semibold text-[#2C2825]'
                  : 'text-gray-400 font-medium hover:text-gray-600'
              }`}
            >
              待签约线索（{pending.length}）
              {activeTab === 'leads' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EF6B00] rounded-full" />
              )}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#EDE9E2] animate-pulse min-h-[220px] md:min-h-[300px]" />
          </div>
        ) : !hasSignedProjects ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#2C2825]">
                  待签约线索（{pending.length}）
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-xl">
                  提交线索后在此签约即可转为已签约项目。可编辑、删除本地记录；从本页进入填写无需再注册。
                </p>
              </div>
              <Link
                to="/leads?from=projects"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#d85f00] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                新增线索
              </Link>
            </div>
            {pending.length === 0 ? (
              <div className="rounded-[20px] bg-white/80 border border-dashed border-[#E8D5C4] px-6 py-12 text-center">
                <p className="text-gray-600 text-sm mb-1">暂无线索</p>
                <p className="text-xs text-gray-400 mb-6">点击右上角「新增线索」填写项目概况与联系方式</p>
                <Link
                  to="/leads?from=projects"
                  className="inline-flex items-center justify-center rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-6 py-3 hover:bg-[#d85f00] transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  新增线索
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {pending.map((lead) => {
                  const typeLabel = projectTypeShort(lead.projectType);
                  return (
                    <li key={lead.id}>
                      <article className="rounded-[20px] bg-white border border-[#F0EBE3] shadow-sm px-4 sm:px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {typeLabel && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FFF9F0] text-[#8B6914] border border-[#F5E6D3]">
                              {typeLabel}
                            </span>
                          )}
                          {lead.area ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                              {lead.area}㎡
                            </span>
                          ) : null}
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                            待签约
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">{budgetLabel(lead)}</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#2C2825]">
                          {lead.projectName || lead.projectPosition || '未命名项目'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {lead.name}
                          {lead.salutation} · {lead.phone} · {lead.city}
                        </p>
                        <button
                          type="button"
                          onClick={() => goSignContract(lead.id)}
                          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl bg-[#2C2825] text-white text-sm font-medium px-6 py-3 hover:bg-[#1a1816] transition-colors"
                        >
                          签署合同
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex gap-4 mt-3">
                          <button
                            type="button"
                            onClick={() => openEdit(lead)}
                            className="text-xs text-gray-500 hover:text-[#EF6B00] inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(lead.id)}
                            className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : activeTab === 'projects' ? (
          <div className="space-y-10 lg:space-y-12">
            <ul className="space-y-10 lg:space-y-14">
              {converted.map((lead, idx) => {
                  const imgs = galleryForProject(idx);
                  const loc = lead.city || lead.projectPosition || '未填写城市';
                  const title = lead.projectName || lead.projectPosition || '未命名项目';
                  const project: ProjectFromLead = {
                    id: lead.projectId!,
                    leadId: lead.id,
                    name: title,
                    location: loc,
                    coverImage: imgs[0],
                  };
                  return (
                    <li key={lead.id}>
                      <article
                        role="button"
                        tabIndex={0}
                        aria-label={`进入项目：${title}`}
                        onClick={() => onSelectProject(project)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectProject(project);
                          }
                        }}
                        className="rounded-2xl overflow-hidden bg-white border border-[#E8E4DC] shadow-[0_8px_40px_rgba(44,40,37,0.06)] cursor-pointer transition-all hover:border-[#EF6B00]/35 hover:shadow-[0_12px_48px_rgba(239,107,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF6B00]/50 focus-visible:ring-offset-2"
                      >
                        <div className="flex w-full min-h-[200px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[360px]">
                          {imgs.map((src, i) => (
                            <div
                              key={i}
                              className="flex-1 min-w-0 relative bg-[#E8E4DC]"
                            >
                              <img
                                src={src}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="px-5 sm:px-7 py-5 sm:py-6 bg-white border-t border-[#F0EBE3]">
                          <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2825] tracking-tight">
                            {title}
                          </h3>
                          <p className="flex items-center gap-2 text-sm sm:text-base text-gray-500 mt-2">
                            <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                            {loc}
                          </p>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#2C2825]">
                  待签约线索（{pending.length}）
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-xl">
                  提交线索后在此签约即可转为已签约项目。可编辑、删除本地记录；从本页进入填写无需再注册。
                </p>
              </div>
              <Link
                to="/leads?from=projects"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#d85f00] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                新增线索
              </Link>
            </div>
            {pending.length === 0 ? (
              <div className="rounded-[20px] bg-white/80 border border-dashed border-[#E8D5C4] px-6 py-12 text-center">
                <p className="text-gray-600 text-sm mb-1">暂无线索</p>
                <p className="text-xs text-gray-400 mb-6">点击「新增线索」填写项目概况与联系方式</p>
                <Link
                  to="/leads?from=projects"
                  className="inline-flex items-center justify-center rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-6 py-3 hover:bg-[#d85f00] transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  新增线索
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {pending.map((lead) => {
                  const typeLabel = projectTypeShort(lead.projectType);
                  return (
                    <li key={lead.id}>
                      <article className="rounded-[20px] bg-white border border-[#F0EBE3] shadow-sm px-4 sm:px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {typeLabel && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FFF9F0] text-[#8B6914] border border-[#F5E6D3]">
                              {typeLabel}
                            </span>
                          )}
                          {lead.area ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                              {lead.area}㎡
                            </span>
                          ) : null}
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                            待签约
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">{budgetLabel(lead)}</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#2C2825]">
                          {lead.projectName || lead.projectPosition || '未命名项目'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {lead.name}
                          {lead.salutation} · {lead.phone} · {lead.city}
                        </p>
                        <button
                          type="button"
                          onClick={() => goSignContract(lead.id)}
                          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl bg-[#2C2825] text-white text-sm font-medium px-6 py-3 hover:bg-[#1a1816] transition-colors"
                        >
                          签署合同
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex gap-4 mt-3">
                          <button
                            type="button"
                            onClick={() => openEdit(lead)}
                            className="text-xs text-gray-500 hover:text-[#EF6B00] inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(lead.id)}
                            className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-[#F0EBE3]">
              <p className="text-[#2C2825] font-medium mb-2">确认删除该线索？</p>
              <p className="text-sm text-gray-500 mb-6">将同时移除本地深度测评草稿（若未签约）。</p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        <LeadEditModal
          lead={editingLead}
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditingLead(null);
          }}
          onSaved={refresh}
        />

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-12 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#2C2825] transition-colors"
          >
            <ChevronLeft size={16} />
            返回
          </button>
        )}
      </div>
    </div>
  );
}
