import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/memorizeStore';
import { Sparkles } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);
  const reload = useStore(s => s.reload);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('请填写完整'); return; }
    if (password !== confirm) { setError('两次密码不一致'); return; }
    if (password.length < 4) { setError('密码至少 4 位'); return; }
    setLoading(true);
    setError('');
    try {
      await register(username.trim(), password);
      await reload();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-lg font-semibold mb-1">创建账号</h1>
          <p className="text-xs text-neutral-500 mb-6">注册后立即开始记单词</p>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">用户名</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                     className="w-full h-10 px-3 rounded-[10px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                     className="w-full h-10 px-3 rounded-[10px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">确认密码</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                     className="w-full h-10 px-3 rounded-[10px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-sm" />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button type="submit" disabled={loading}
                    className="w-full h-10 rounded-[12px] bg-black text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition">
              {loading ? '注册中…' : '注册并登录'}
            </button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-4">
            已有账号？
            <button type="button" onClick={() => navigate('/login')} className="ml-1 text-black font-medium hover:underline">
              去登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
