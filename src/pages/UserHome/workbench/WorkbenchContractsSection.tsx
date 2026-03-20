import React from 'react'
import { ChevronRight, Copy, ScrollText } from 'lucide-react'
import { ContractDetailModal } from '../../../components/ContractDetailModal'
import { getPaymentAccountCopyText } from '../../../constants/contract'
export function ContractsSection({
  projectName,
  hasSigned,
  signatureData,
  customText,
  onGoToContractStep,
}: {
  projectName: string
  hasSigned: boolean
  signatureData?: string
  customText?: string
  onGoToContractStep?: () => void
}) {
  const [showDetailModal, setShowDetailModal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(getPaymentAccountCopyText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
          <h2 className="text-lg font-semibold">项目协议</h2>
        </div>
        <button
          type="button"
          onClick={handleCopyAccount}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Copy size={16} />
          {copied ? '已复制' : '一键复制账户信息'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="min-w-0 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9C3E]/10 px-3 py-1">
            <ScrollText size={14} className="text-[#FF9C3E]" />
            <span className="text-xs font-semibold text-[#C87800]">项目服务框架协议</span>
          </div>
          <div className="text-base md:text-lg font-semibold text-gray-900 truncate">
            {projectName || '当前项目'} · 意向金服务合同
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasSigned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {hasSigned ? '已签署' : '待签署'}
            </span>
            <span className="text-gray-500">
              {customText
                ? customText
                : hasSigned
                  ? '您已在注册流程中完成本合同的电子签署，本页展示的是您的签署记录示意。'
                  : '完成注册意向金流程并签署合同后，本页将展示您的签署记录。'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative w-32 h-24 md:w-40 md:h-28 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] flex items-center justify-center overflow-hidden">
            <div className="w-[85%] h-[80%] border border-gray-200 rounded-xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <span className="text-[11px] text-gray-500">合同正文</span>
            </div>
            {hasSigned && signatureData && (
              <div className="absolute -bottom-3 -right-2">
                <div className="w-16 h-16 rounded-full border-2 border-[#EF6B00]/80 bg-[#FFF4E0] flex items-center justify-center rotate-[-15deg] shadow-sm">
                  <img
                    src={signatureData}
                    alt="签名印记"
                    className="w-12 h-12 object-contain opacity-95"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDetailModal(true)}
            className="md:w-[180px] w-full inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            查看合同详情
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
      <ContractDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        signatureData={signatureData}
        hasSigned={hasSigned}
        onGoToSign={onGoToContractStep}
      />
    </div>
  )
}
