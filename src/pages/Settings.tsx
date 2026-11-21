import { useRef } from 'react';
import { useStore } from '@/store/memorizeStore';
import { downloadJSON } from '@/utils/storage';
import { Upload, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  const words = useStore(s => s.words);
  const dialogues = useStore(s => s.dialogues);
  const resetAll = useStore(s => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => downloadJSON({ words, dialogues }, `memorize-backup-${Date.now()}.json`);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.words || data.dialogues) {
        alert('导入功能即将上线');
      } else {
        alert('文件格式不正确');
      }
    } catch {
      alert('解析失败，请确认是 JSON 文件');
    }
    e.target.value = '';
  };

  return (
    <div className="animate-[fadeUp_0.5s_ease-out] max-w-[500px]">
      <h2 className="text-[20px] font-semibold tracking-tight mb-[30px]">设置</h2>

      <div className="form bg-white rounded-[18px] p-5 mb-5">
        <div className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">数据管理</div>

        <Row label="导出数据" desc="备份所有单词和对话到 JSON 文件">
          <button
            onClick={exportData}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <Download size={14} /> 导出
          </button>
        </Row>
        <Row label="导入数据" desc="从 JSON 备份文件恢复">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <Upload size={14} /> 导入
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </Row>
        <Row label="清空所有数据" desc="删除所有单词、对话和复习记录（不可恢复）">
          <button
            onClick={() => { if (confirm('确定要清空所有数据吗？')) resetAll(); }}
            className="btn bg-[#fff4f5] text-[#d94a5f] hover:bg-[#ffe8eb] px-[13px] py-[7px] rounded-[10px] text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <Trash2 size={14} /> 清空
          </button>
        </Row>
      </div>

      <div className="form bg-white rounded-[18px] p-5">
        <div className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">关于</div>
        <div className="text-[13px] text-muted leading-relaxed space-y-1">
          <p>词话 · 记单词 & 记对话 v0.1</p>
          <p>基于 SM-2 间隔重复算法</p>
          <p>数据存储于浏览器 localStorage · 可离线使用</p>
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
