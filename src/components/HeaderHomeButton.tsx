import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { isRequirementsSupplementFlow } from '../utils/navigationConfig';

/** 与风格测评页一致：需求书补齐流程回工作台，否则回欢迎页 */
export function HeaderHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRequirements = isRequirementsSupplementFlow(location.search);

  return (
    <button
      type="button"
      onClick={() => {
        if (fromRequirements) {
          navigate('/home', { state: { activeTab: 'requirements' } });
        } else {
          navigate('/');
        }
      }}
      aria-label="返回欢迎页"
      className="w-[34px] h-[34px] shrink-0 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
    >
      <Home size={14} strokeWidth={2} />
    </button>
  );
}
