/**
 * 项目列表 API
 *
 * 后端可提供：
 * GET {BASE}/projects
 * 返回: { projects: [{ id, name, location?, status?, ... }] }
 *
 * 当前使用本地 mock 数据 + localStorage 持久化
 */

export interface Project {
  id: string;
  name: string;
  location?: string;
  createdAt?: string;
}

const STORAGE_KEY = 'ai-studio:user-projects:v1';

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: '静安·云境公寓（示例项目）', location: '上海市静安区' },
  { id: '2', name: '滨江翠苑 120 ㎡', location: '上海市浦东新区' },
  { id: '3', name: '万科翡翠公园复式', location: '杭州市余杭区' },
];

function loadFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...MOCK_PROJECTS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...MOCK_PROJECTS];
    return parsed.length > 0 ? parsed : [...MOCK_PROJECTS];
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
  const newProject: Project = { ...project, id };
  projects.unshift(newProject);
  saveToStorage(projects);
  return newProject;
}
