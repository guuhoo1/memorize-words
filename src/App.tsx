import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Review from '@/pages/Review';
import Words from '@/pages/Words';
import WordEdit from '@/pages/WordEdit';
import Dialogues from '@/pages/Dialogues';
import DialogueDetail from '@/pages/DialogueDetail';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/words" element={<Words />} />
          <Route path="/words/new" element={<WordEdit />} />
          <Route path="/words/:id" element={<WordEdit />} />
          <Route path="/dialogues" element={<Dialogues />} />
          <Route path="/dialogues/:id" element={<DialogueDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
