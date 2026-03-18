import React from 'react'
import { X, ChevronRight } from 'lucide-react'
import { CONTRACT_TEXT } from '../constants/contract'
const contractFlowImg = '/img/contract-flow.png'

export function ContractDetailModal({
  open,
  onClose,
  signatureData,
  hasSigned,
  onGoToSign,
}: {
  open: boolean
  onClose: () => void
  signatureData?: string
  hasSigned: boolean
  onGoToSign?: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center px-3">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">签字版合同详情</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar bg-[#FDFCF8]">
          <div className="mx-auto max-w-2xl bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
            <div className="whitespace-pre-line font-serif text-[11px] leading-7 text-gray-900 tracking-wide space-y-2">
              {CONTRACT_TEXT.split('\n').map((line, idx) => {
                if (line.trim() === '[图片]') {
                  return (
                    <div key={idx} className="my-4 flex justify-center">
                      <img
                        src={contractFlowImg}
                        alt="订单管理服务流程状态图解"
                        className="max-w-full rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  )
                }
                return (
                  <p
                    key={idx}
                    className={idx === 0 ? 'text-center font-semibold text-[12px]' : ''}
                  >
                    {line || '\u00A0'}
                  </p>
                )
              })}
            </div>
            {hasSigned && signatureData && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">甲方签字：</p>
                <div className="inline-block p-3 rounded-xl border border-gray-200 bg-[#FFFDF3]">
                  <img
                    src={signatureData}
                    alt="签名"
                    className="h-16 object-contain"
                  />
                </div>
              </div>
            )}
            {!hasSigned && onGoToSign && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { onClose(); onGoToSign(); }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00]"
                >
                  去签署
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
