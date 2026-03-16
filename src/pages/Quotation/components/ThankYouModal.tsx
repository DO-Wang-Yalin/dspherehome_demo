import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">感谢您的反馈</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-[#EF6B00] text-white py-3 rounded-xl font-bold hover:bg-[#d66000] transition-colors"
        >
          返回订单详情
        </button>
      </div>
    </div>
  );
};
