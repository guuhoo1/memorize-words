import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { useAuthStore } from '@/store/authStore';
import { wordsApi, dialoguesApi } from '@/utils/api';
import { downloadJSON } from '@/utils/storage';
import { Upload, Download, LogOut, Database } from 'lucide-react';

export default function Settings() {
  const words = useStore(s => s.words);
  const dialogues = useStore(s => s.dialogues);
  const logout = useAuthStore(s => s.logout);
  const reload = useStore(s => s.reload);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    if (!confirm('即将导出所有单词和对话到 JSON 文件，继续？')) return;
    downloadJSON({ words, dialogues }, `memorize-backup-${Date.now()}.json`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || (!data.words && !data.dialogues)) {
        alert('文件格式不正确：需要包含 words 或 dialogues 数组');
        e.target.value = '';
        return;
      }
      if (!confirm(
        `即将导入：${data.words?.length ?? 0} 个单词，${data.dialogues?.length ?? 0} 个对话\n` +
        '导入会逐个创建到你的账号下（不覆盖已有），继续？'
      )) {
        e.target.value = '';
        return;
      }

      let ok = 0, fail = 0;
      for (const w of (data.words ?? [])) {
        try {
          await wordsApi.create({
            english: w.english,
            chinese: w.chinese,
            phonetic: w.phonetic,
            example: w.example,
            tags: w.tags ?? []
          });
          ok++;
        } catch { fail++; }
      }
      for (const d of (data.dialogues ?? [])) {
        try {
          await dialoguesApi.create({
            title: d.title,
            source: d.source,
            category: d.category ?? '日常/工作',
            content: d.content
          });
          ok++;
        } catch { fail++; }
      }

      await reload();
      alert(`导入完成：成功 ${ok} 条，失败 ${fail} 条`);
    } catch {
      alert('解析失败，请确认是有效的 JSON 备份文件');
    }
    e.target.value = '';
  };

  return (
    <div className="animate-[fadeUp_0.5s_ease-out] max-w-[500px]">
      <h2 className="text-[20px] font-semibold tracking-tight mb-[30px]">设置</h2>

      <div className="form bg-white rounded-[18px] p-5 mb-5">
        <div className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">数据维护</div>

        <Row label="字典管理" desc="维护对话分类、单词标签建议等选项">
          <button
            onClick={() => navigate('/settings/dicts')}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <Database size={14} /> 进入
          </button>
        </Row>

        <Row label="导出数据" desc="备份所有单词和对话到 JSON 文件">
          <button onClick={exportData}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5">
            <Download size={14} /> 导出
          </button>
        </Row>
        <Row label="导入数据" desc="从 JSON 备份文件恢复（逐条创建）">
          <button onClick={() => fileRef.current?.click()}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5">
            <Upload size={14} /> 导入
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </Row>
        <Row label="退出登录" desc="清除本地 token，回到登录页">
          <button onClick={handleLogout}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5">
            <LogOut size={14} /> 退出
          </button>
        </Row>
      </div>

      <div className="form bg-white rounded-[18px] p-5">
        <div className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">关于</div>
        <div className="text-[13px] text-muted leading-relaxed space-y-1">
          <p>词话 · 记单词 & 记对话 v0.1</p>
          <p>基于 SM-2 间隔重复算法 · 后端 Spring Boot + MyBatis-Plus</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <div>
        <div className="text-[13px] text-ink">{label}</div>
        {desc && <div className="text-[12px] text-muted mt-[3px]">{desc}</div>}
      </div>
      {children}
    </div>
  );
}
