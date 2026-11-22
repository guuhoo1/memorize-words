import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { useAuthStore } from '@/store/authStore';
import { dueWords } from '@/utils/sm2';
import { Home, CalendarCheck, BookOpen, MessageSquare, Type } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '概览' },
  { to: '/review', icon: CalendarCheck, label: '今日复习', badge: true },
  { to: '/words', icon: BookOpen, label: '单词库' },
  { to: '/patterns', icon: Type, label: '常用句型' },
  { to: '/dialogues', icon: MessageSquare, label: '对话库' }
];

/** 判断头像字符串是否为图片（URL 或相对路径） */
function isImageAvatar(raw: string | undefined): boolean {
  if (!raw) return false;
  if (/\p{Extended_Pictographic}/u.test(raw)) return false; // emoji 不用当图片渲染
  return raw.startsWith('http') || raw.startsWith('/') || raw.startsWith('data:image');
}

export default function Layout() {
  const words = useStore(s => s.words);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const due = dueWords(words).length;

  // 头像渲染：emoji / URL 图片 / 相对路径图片 / 用户名首字
  const renderAvatar = () => {
    const raw = user?.avatar?.trim();
    if (!raw) return <span className="text-[16px] font-semibold text-neutral-700">{user?.username?.[0]?.toUpperCase() || '?'}</span>;
    if (/\p{Extended_Pictographic}/u.test(raw)) return <span className="text-[20px]">{raw}</span>;
    // http / /uploads/xxx / data:image 都当图片
    if (isImageAvatar(raw)) return <img src={raw} alt="avatar" className="w-full h-full object-cover rounded-full" onError={e => (e.currentTarget.style.display = 'none')} />;
    return <span className="text-[16px] font-semibold text-neutral-700">{raw[0].toUpperCase()}</span>;
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Rail - 72px narrow icon bar */}
      <nav className="w-[72px] flex-shrink-0 bg-white border-r border-line sticky top-0 h-screen flex flex-col items-center gap-1.5 py-[22px]">
        {/* 顶部：头像 */}
        <button
          onClick={() => navigate('/profile')}
          title="个人信息"
          className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 grid place-items-center overflow-hidden transition-colors ring-2 ring-transparent hover:ring-neutral-300"
        >
          {renderAvatar()}
        </button>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'rail-btn group relative flex flex-col items-center gap-[3px]',
                  isActive ? 'active' : ''
                ].join(' ')
              }
            >
              <Icon size={22} strokeWidth={1.6} />
              <span className="text-[10px] text-[#9a9a9a] group-hover:text-ink leading-none">{item.label}</span>
              {item.badge && due > 0 && <span className="dot" />}
            </NavLink>
          );
        })}

        {/* 底部：设置 */}
        <button
          onClick={() => navigate('/settings')}
          title="设置"
          className="mt-auto rail-btn"
        >
          <span className="text-[18px] text-[#b0b0b0]">⚙</span>
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 pb-[90px]">
        <div className="max-w-[1200px] mx-auto pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
