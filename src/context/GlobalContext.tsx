import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { FormData, initialFormData } from '../types';

/** 与登录态同步持久化，刷新欢迎页仍可识别已登录用户 */
const AUTH_SESSION_KEY = 'dsphr_logged_in';

function readStoredLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

interface GlobalContextType {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  /** 当前选中的已转化线索（项目），用于需求书/合同展示与深度测评绑定 */
  activeProjectLeadId: string | null;
  setActiveProjectLeadId: (id: string | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(initialFormData);
  const [isLoggedIn, setIsLoggedIn] = useState(readStoredLoggedIn);
  const [activeProjectLeadId, setActiveProjectLeadId] = useState<string | null>(null);

  const setLoggedIn = useCallback((val: boolean) => {
    setIsLoggedIn(val);
    try {
      if (val) localStorage.setItem(AUTH_SESSION_KEY, '1');
      else localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const updateData = (fields: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <GlobalContext.Provider
      value={{
        data,
        updateData,
        setData,
        isLoggedIn,
        setLoggedIn,
        activeProjectLeadId,
        setActiveProjectLeadId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}
