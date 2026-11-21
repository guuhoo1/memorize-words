import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { dueWords } from '@/utils/sm2';
import { Home, CalendarCheck, BookOpen, MessageSquare } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '概览' },
  { to: '/review', icon: CalendarCheck, label: '今日复习', badge: true },
  { to: '/words', icon: BookOpen, label: '单词库' },
  { to: '/dialogues', icon: MessageSquare, label: '对话库' }
];

export default function Layout() {
  const words = useStore(s => s.words);
  const navigate = useNavigate();
  const due = dueWords(words).length;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Rail - 72px narrow icon bar */}
      <nav className="w-[72px] flex-shrink-0 bg-white border-r border-line sticky top-0 h-screen flex flex-col items-center gap-1.5 py-[22px]">
        {/* Logo */}
        <div
          className="w-[38px] h-[38px] rounded-full grid place-items-center text-white text-[16px] font-semibold mb-5 tracking-[-0.5px]"
          style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
        >
          词
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={item.label}
              className={({ isActive }) =>
                [
                  'rail-btn',
                  isActive ? 'active' : ''
                ].join(' ')
              }
            >
              <Icon size={22} strokeWidth={1.6} />
              {item.badge && due > 0 && <span className="dot" />}
            </NavLink>
          );
        })}

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
        <div className="max-w-[600px] mx-auto pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
