import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Review from '@/pages/Review';
import Words from '@/pages/Words';
import WordEdit from '@/pages/WordEdit';
import Dialogues from '@/pages/Dialogues';
import DialogueDetail from '@/pages/DialogueDetail';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/memorizeStore';
import Dictionaries from '@/pages/Dictionaries';

/** 路由守卫：未登录 → /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  const loaded = useStore(s => s.loaded);
  const reload = useStore(s => s.reload);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
    if (!loaded) {
      reload().catch(() => {
        navigate('/login', { replace: true });
      });
    }
  }, [token, loaded]);

  if (!token) return null;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/words" element={<Words />} />
          <Route path="/words/new" element={<WordEdit />} />
          <Route path="/words/:id" element={<WordEdit />} />
          <Route path="/dialogues" element={<Dialogues />} />
          <Route path="/dialogues/:id" element={<DialogueDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/dicts" element={<Dictionaries />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
