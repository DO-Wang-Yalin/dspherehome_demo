import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { DreamOneLogo } from '../../components/DreamOneLogo';

const ACCENT = '#FF7A18';
const HERO_IMG = '/img/landing-hero-interior.jpg';

function DreamLogo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center py-1 transition-opacity hover:opacity-[0.88] active:opacity-100"
      aria-label="DREAM.ONE 首页"
    >
      {/* 与稿一致：横向 lockup（3D D + DREAM.ONE），白底整图，无描边卡片 */}
      <DreamOneLogo className="h-8 w-auto sm:h-9 md:h-10 max-w-[min(100%,260px)]" />
    </Link>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useGlobal();

  const handleCustomerWorkbench = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectTo: '/home', from: 'landing' } });
      return;
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <DreamLogo />
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleCustomerWorkbench}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/40 transition hover:brightness-95 active:scale-[0.98]"
                style={{ background: ACCENT }}
              >
                客户工作台
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        {/* 左侧叠卡 */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
          style={{ perspective: '1200px' }}
        >
          <div className="relative aspect-[4/5] w-full max-w-[420px] mx-auto">
            {/* 底层装饰卡 */}
            {[2, 1].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-[28px] border-[10px] border-white bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
                style={{
                  transform: `translate(${i * 10}px, ${i * 10}px) rotate(${i * 2}deg)`,
                  zIndex: i,
                }}
              />
            ))}
            {/* 顶层主卡 */}
            <div
              className="absolute inset-0 z-30 rounded-[28px] border-[10px] border-white bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
              style={{ transform: 'translate(0, 0) rotate(0deg)' }}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-[20px]">
                <div className="relative flex-1 overflow-hidden rounded-t-[20px]">
                  <img
                    src={HERO_IMG}
                    alt="现代室内空间效果图"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="text-base font-semibold tracking-wide text-black sm:text-lg">室内空间</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 右侧文案 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="flex flex-col items-start text-left"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 shrink-0" style={{ background: ACCENT }} aria-hidden />
            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
              居住人格探索测试
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-black sm:text-5xl lg:text-[3.25rem]">
            寻觅理想居所
            <span
              className="ml-1 inline-block h-2.5 w-2.5 translate-y-[-2px] rounded-full align-middle sm:h-3 sm:w-3"
              style={{ background: ACCENT }}
              aria-hidden
            />
          </h1>

          <p className="mb-3 max-w-xl text-base leading-relaxed text-[#666666] sm:text-lg">
            家不仅是居住的地方，更是你内心的投射。
          </p>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-[#666666] sm:text-lg">
            花3分钟，找到那个让灵魂安顿的角落。
          </p>

          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <button
              type="button"
              onClick={() => navigate('/style-eval')}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-300/50 transition hover:brightness-95 active:scale-[0.98]"
              style={{ background: ACCENT }}
            >
              开始探索之旅
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <div className="hidden h-12 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-black sm:text-4xl">12k+</span>
              <span className="mt-1 text-sm text-[#666666]">梦想家已加入</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-gray-400 sm:text-right sm:pr-10">
        <div className="font-semibold uppercase tracking-widest">Version 1.0.4</div>
        <div className="mt-1 text-gray-500">© 2026 DREAM.ONE</div>
      </footer>
    </div>
  );
}
