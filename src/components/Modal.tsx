import { ReactNode, useEffect, useState, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
}

const SIZE_MAP = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[520px]',
  lg: 'sm:max-w-[640px]'
};

export default function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  // 移动端 Bottom Sheet：下滑关闭手势
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTranslateY(0);
      setDragging(false);
    }
  }, [open]);

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

  // 触摸手势处理（仅移动端 Bottom Sheet）
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.modal-body-scroll')) return;
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setTranslateY(Math.min(delta, 200));
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (translateY > 80) {
      onClose();
    } else {
      setTranslateY(0);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-[fadeIn_0.18s_ease-out]"
      onClick={onClose}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* 桌面端：居中弹窗 */}
      <div
        className="hidden sm:flex absolute inset-0 items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className={`relative bg-white rounded-[20px] w-full ${SIZE_MAP[size]} max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-[scaleIn_0.2s_ease-out]`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-line shrink-0">
            <h3 className="text-[16px] font-semibold text-ink tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] text-muted hover:bg-[#f2f2f2] hover:text-ink inline-flex items-center justify-center transition"
            >
              <span className="text-lg leading-none">✕</span>
            </button>
          </div>
          {/* Body */}
          <div className={`overflow-y-auto ${footer ? 'flex-1' : 'sm:flex-1'}`}>
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div className="shrink-0 border-t border-line bg-[#fafafa] px-5 py-3 rounded-b-[20px]">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* 移动端：Bottom Sheet */}
      <div
        className="sm:hidden absolute inset-x-0 bottom-0 top-auto"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={sheetRef}
          className="bg-white rounded-t-[20px] flex flex-col overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
          style={{
            maxHeight: '92dvh',
            height: 'min(92dvh, max-content)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* 拖拽手柄 */}
          <div className="shrink-0 pt-2 pb-1 flex justify-center touch-none select-none">
            <div className="w-10 h-1 rounded-full bg-[#d0d0d0]" />
          </div>

          {/* Header */}
          <div className="shrink-0 px-4 py-2 flex items-center gap-2 border-b border-line">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full text-muted hover:bg-[#f2f2f2] active:bg-[#e8e8e8] inline-flex items-center justify-center transition touch-manipulation"
              aria-label="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h3 className="flex-1 text-[16px] font-semibold text-ink tracking-tight text-center pr-9">{title}</h3>
          </div>

          {/* Body */}
          <div className={`modal-body-scroll overflow-y-auto overscroll-contain ${footer ? '' : 'flex flex-col'}`}>
            <div className={`w-full ${footer ? '' : 'flex flex-col'}`}>
              {children}
            </div>
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="shrink-0 border-t border-line bg-white px-4 py-3"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
