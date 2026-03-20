import React from 'react'
import { ChevronRight, Construction } from 'lucide-react'
export function ComingSoon({ title, onBackHome }: { title: string; onBackHome: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 md:p-14">
      <div className="max-w-md mx-auto text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
          <Construction size={22} />
        </div>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">功能开发中，敬请期待；你可以先返回「订单方案」查看订单与待定决策事项。</p>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold px-6 py-3 hover:brightness-95 active:scale-[0.99] transition"
        >
          返回订单方案
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  )
}
