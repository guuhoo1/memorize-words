import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'max-w-[420px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[640px]'
};

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.18s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[18px] w-full ${SIZE_MAP[size]} max-h-[90vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.18)]`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-line">
          <h3 className="text-[16px] font-semibold text-ink tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] text-muted hover:bg-[#f2f2f2] hover:text-ink inline-flex items-center justify-center transition"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
