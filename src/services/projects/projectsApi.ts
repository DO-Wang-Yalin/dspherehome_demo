/**
 * 项目列表 API
 *
 * 后端可提供：
 * GET {BASE}/projects
 * 返回: { projects: [{ id, name, location?, status?, ... }] }
 *
 * 当前使用本地 mock 数据 + localStorage 持久化
 */

/** 项目卡片封面图（演示用外链图，可后续换为上传图或 OSS） */
export const PROJECT_COVER_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80&auto=format&fit=crop',
];

export interface Project {
  id: string;
  name: string;
  location?: string;
  createdAt?: string;
  /** 列表页展示用封面 */
  coverImage?: string;
}

const STORAGE_KEY = 'ai-studio:user-projects:v2';

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: '龙湖璟宸府（示例项目）', location: '上海市', coverImage: PROJECT_COVER_PLACEHOLDERS[0] },
  { id: '2', name: '滨江翠苑 120 ㎡', location: '上海市浦东新区', coverImage: PROJECT_COVER_PLACEHOLDERS[1] },
  { id: '3', name: '万科翡翠公园复式', location: '杭州市余杭区', coverImage: PROJECT_COVER_PLACEHOLDERS[2] },
];

function loadFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...MOCK_PROJECTS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...MOCK_PROJECTS];
    if (parsed.length === 0) return [...MOCK_PROJECTS];
    return parsed.map((p: Project, i: number) => ({
      ...p,
      coverImage: p.coverImage || PROJECT_COVER_PLACEHOLDERS[i % PROJECT_COVER_PLACEHOLDERS.length],
    }));
  } catch {
    return [...MOCK_PROJECTS];
  }
}

function saveToStorage(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

/** 获取当前用户的项目列表（mock：从 localStorage 读取，无则用默认） */
export function getProjects(): Promise<Project[]> {
  return Promise.resolve(loadFromStorage());
}

/** 添加项目（用于表单流程完成后同步到项目列表） */
export function addProject(project: Omit<Project, 'id'>): Project {
  const projects = loadFromStorage();
  const id = `p-${Date.now()}`;
  const idx = projects.length;
  const newProject: Project = {
    ...project,
    id,
    coverImage:
      project.coverImage ||
      PROJECT_COVER_PLACEHOLDERS[idx % PROJECT_COVER_PLACEHOLDERS.length],
  };
  projects.unshift(newProject);
  saveToStorage(projects);
  return newProject;
}
