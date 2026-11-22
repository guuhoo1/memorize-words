import { useEffect, useState } from 'react';
import { dictsApi } from '@/utils/api';
import type { DictItem } from '@/utils/api';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import Modal from '@/components/Modal';

const TYPES: { key: string; label: string }[] = [
  { key: 'dialogue_category', label: '对话分类' },
  { key: 'word_tag', label: '单词标签' }
];

export default function Dictionaries() {
  const [activeType, setActiveType] = useState('dialogue_category');
  const [items, setItems] = useState<DictItem[]>([]);

  // 新增弹窗
  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // 编辑弹窗
  const [editTarget, setEditTarget] = useState<DictItem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // 删除弹窗
  const [delTarget, setDelTarget] = useState<DictItem | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const load = async () => {
    try {
      const data = await dictsApi.list(activeType);
      setItems(data);
    } catch {}
  };

  useEffect(() => { load(); }, [activeType]);

  // --- 新增 ---
  const openAdd = () => {
    setAddLabel(''); setAddError(''); setAddOpen(true);
  };
  const submitAdd = async () => {
    const label = addLabel.trim();
    if (!label) { setAddError('请输入名称'); return; }
    if (items.some(x => x.itemLabel.toLowerCase() === label.toLowerCase())) {
      setAddError('已存在同名项'); return;
    }
    setAddLoading(true);
    try {
      const newItem = await dictsApi.create(activeType, label, items.length);
      setItems([...items, newItem]);
      setAddOpen(false);
    } catch (err: any) {
      setAddError(err?.message || '添加失败');
    } finally {
      setAddLoading(false);
    }
  };

  // --- 编辑 ---
  const openEdit = (item: DictItem) => {
    setEditTarget(item); setEditLabel(item.itemLabel); setEditError('');
  };
  const submitEdit = async () => {
    if (!editTarget) return;
    const label = editLabel.trim();
    if (!label) { setEditError('请输入名称'); return; }
    if (items.some(x => x.id !== editTarget.id && x.itemLabel.toLowerCase() === label.toLowerCase())) {
      setEditError('已存在同名项'); return;
    }
    setEditLoading(true);
    try {
      const updated = await dictsApi.update(editTarget.id, label, editTarget.sortOrder);
      setItems(items.map(i => (i.id === editTarget.id ? updated : i)));
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err?.message || '保存失败');
    } finally {
      setEditLoading(false);
    }
  };

  // --- 删除 ---
  const confirmDelete = (item: DictItem) => setDelTarget(item);
  const doDelete = async () => {
    if (!delTarget) return;
    setDelLoading(true);
    try {
      await dictsApi.remove(delTarget.id);
      setItems(items.filter(i => i.id !== delTarget.id));
      setDelTarget(null);
    } catch (err: any) {
      alert(err?.message || '删除失败');
    } finally {
      setDelLoading(false);
    }
  };

  const currentMeta = TYPES.find(t => t.key === activeType)!;

  return (
    <div className="animate-[fadeUp_0.5s_ease-out] max-w-[560px]">
      <h2 className="text-[20px] font-semibold tracking-tight mb-[6px]">字典管理</h2>
      <p className="text-[13px] text-neutral-500 mb-[24px]">维护对话分类和单词标签建议</p>

      {/* Tab + 操作栏 */}
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex gap-1 bg-[#f4f4f5] p-[3px] rounded-[10px] w-fit">
          {TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveType(t.key); }}
              className={`px-[14px] py-[6px] rounded-[8px] text-[13px] font-medium transition-all ${
                activeType === t.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="h-9 px-[14px] rounded-[10px] bg-neutral-900 text-white text-[13px] font-medium inline-flex items-center gap-[4px] hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} strokeWidth={2.2} /> 添加
        </button>
      </div>

      {/* 列表 */}
      <div className="rounded-[14px] border border-neutral-200/70 bg-white overflow-hidden">
        {items.length === 0 ? (
          <div className="py-[48px] text-center text-neutral-400 text-[13px]">暂无条目，点击右上角"添加"</div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-[12px] px-[16px] h-[48px] ${idx !== items.length - 1 ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50/60 transition-colors`}
            >
              <span className="w-5 text-[11px] text-neutral-400 font-mono text-right">{item.sortOrder + 1}</span>
              <span className="flex-1 text-[14px] text-neutral-800">{item.itemLabel}</span>
              <button
                onClick={() => openEdit(item)}
                className="w-8 h-8 rounded-[8px] inline-flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                title="编辑"
              >
                <Pencil size={13} strokeWidth={2} />
              </button>
              <button
                onClick={() => confirmDelete(item)}
                className="w-8 h-8 rounded-[8px] inline-flex items-center justify-center text-neutral-400 hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors"
                title="删除"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 新增弹窗 */}
      <Modal open={addOpen} onClose={() => !addLoading && setAddOpen(false)} title={`添加${currentMeta.label}`} size="sm">
        <div className="p-5">
          <input
            autoFocus
            type="text"
            value={addLabel}
            onChange={e => { setAddLabel(e.target.value); setAddError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') submitAdd(); }}
            placeholder={`输入新的${currentMeta.label}名称`}
            className="w-full h-11 px-4 rounded-[12px] bg-[#f4f4f5] focus:bg-[#ededed] outline-none text-[14px]"
          />
          {addError && <p className="text-[12px] text-red-500 mt-2">{addError}</p>}

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setAddOpen(false)}
              disabled={addLoading}
              className="h-9 px-4 rounded-[10px] bg-[#f4f4f5] text-neutral-700 text-[13px] font-medium hover:bg-[#ededed] disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={submitAdd}
              disabled={addLoading || !addLabel.trim()}
              className="h-9 px-5 rounded-[10px] bg-neutral-900 text-white text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-[4px]"
            >
              <Check size={14} strokeWidth={2.2} /> {addLoading ? '添加中…' : '添加'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal open={!!editTarget} onClose={() => !editLoading && setEditTarget(null)} title={`编辑${currentMeta.label}`} size="sm">
        <div className="p-5">
          <input
            autoFocus
            type="text"
            value={editLabel}
            onChange={e => { setEditLabel(e.target.value); setEditError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') submitEdit(); }}
            placeholder="输入名称"
            className="w-full h-11 px-4 rounded-[12px] bg-[#f4f4f5] focus:bg-[#ededed] outline-none text-[14px]"
          />
          {editError && <p className="text-[12px] text-red-500 mt-2">{editError}</p>}

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setEditTarget(null)}
              disabled={editLoading}
              className="h-9 px-4 rounded-[10px] bg-[#f4f4f5] text-neutral-700 text-[13px] font-medium hover:bg-[#ededed] disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={submitEdit}
              disabled={editLoading || !editLabel.trim()}
              className="h-9 px-5 rounded-[10px] bg-neutral-900 text-white text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-[4px]"
            >
              <Check size={14} strokeWidth={2.2} /> {editLoading ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 删除弹窗 */}
      <Modal open={!!delTarget} onClose={() => !delLoading && setDelTarget(null)} title="确认删除" size="sm">
        <div className="p-5">
          <p className="text-[14px] text-neutral-700 leading-relaxed">
            确定删除 <span className="font-semibold text-neutral-900">"{delTarget?.itemLabel}"</span>？
          </p>
          <p className="text-[12px] text-neutral-400 mt-2">已有对话/单词不受影响，只是不再出现在下拉选项里。</p>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setDelTarget(null)}
              disabled={delLoading}
              className="h-9 px-4 rounded-[10px] bg-[#f4f4f5] text-neutral-700 text-[13px] font-medium hover:bg-[#ededed] disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={doDelete}
              disabled={delLoading}
              className="h-9 px-5 rounded-[10px] bg-[#dc2626] text-white text-[13px] font-medium hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-[4px]"
            >
              <Trash2 size={14} strokeWidth={2.2} /> {delLoading ? '删除中…' : '删除'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
