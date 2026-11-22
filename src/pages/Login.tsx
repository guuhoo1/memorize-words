import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/memorizeStore';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const reload = useStore(s => s.reload);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      await reload();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const gotoRegister = () => navigate('/register');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#f09433,#dc2743,#bc1888)' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span className="text-xl font-semibold tracking-tight">memorize</span>
        </div>

        <div className="bg-white rounded-[18px] border border-black/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h1 className="text-lg font-semibold mb-1">欢迎回来</h1>
          <p className="text-xs text-neutral-500 mb-6">使用账号登录继续记单词</p>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] text-neutral-600 mb-1 block font-medium">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-sm"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-[12px] text-neutral-600 mb-1 block font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-sm"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-[12px] bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-4">
            还没有账号？
            <button type="button" onClick={gotoRegister} className="ml-1 text-black font-medium hover:underline">
              去注册
            </button>
          </p>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6 opacity-60">
          新用户？<button type="button" onClick={gotoRegister} className="underline hover:text-neutral-600">注册账号</button>
        </p>
      </div>
    </div>
  );
}
