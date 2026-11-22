import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/utils/api';
import { Camera, Save, Upload, Loader2 } from 'lucide-react';

const AVATAR_PRESETS = ['🐱', '🐶', '🦊', '🐼', '🦄', '🌟', '🌸', '🍀', '🎯', '🚀'];

export default function Profile() {
  const { user, updateMe } = useAuthStore();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setAvatar(user.avatar || '');
    }
  }, [user?.id]);

  // 本地预览（上传中）或后端 URL（已上传）或 URL 输入
  const effectiveAvatar = localPreview || avatar?.trim();
  const hasChanges =
    (nickname !== (user?.nickname || '')) || (avatar !== (user?.avatar || '')) || !!localPreview;

  const showMsg = (text: string, ms = 1800) => {
    setMsg(text);
    setTimeout(() => setMsg(''), ms);
  };

  const onSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await updateMe({ nickname: nickname.trim(), avatar: avatar.trim() });
      showMsg('已保存 ✓');
    } catch (e: any) {
      showMsg(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 前端预校验
    if (!file.type.startsWith('image/')) {
      showMsg('仅支持图片文件');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMsg('文件不能超过 2MB');
      return;
    }

    // 本地预览（即时反馈）
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    setMsg('上传中…');

    try {
      const res = await authApi.uploadAvatar(file);
      setAvatar(res.url);           // 后端返回的 /uploads/avatar/xxx.png
      setLocalPreview(null);        // 清除本地预览，用后端 URL
      await updateMe({ avatar: res.url }); // 同步全局 store
      showMsg('头像已更新 ✓');
    } catch (err: any) {
      showMsg(err?.message || '上传失败');
      setLocalPreview(null);
    } finally {
      setUploading(false);
      // 清空 input 让同一个文件可以重新选
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 预览头渲染
  const isEmojiAvatar = /\p{Extended_Pictographic}/u.test(effectiveAvatar || '');
  const isRemoteImage = !!effectiveAvatar && !isEmojiAvatar;

  const renderAvatarContent = () => {
    if (isRemoteImage) {
      return (
        <img
          src={effectiveAvatar}
          alt="avatar"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      );
    }
    if (effectiveAvatar && isEmojiAvatar) {
      return <span className="text-[28px]">{effectiveAvatar}</span>;
    }
    // 首字回退
    return <span className="text-[22px] font-semibold text-neutral-700">{user?.username?.[0]?.toUpperCase() || '?'}</span>;
  };

  return (
    <div className="animate-[fadeUp_0.5s_ease-out] max-w-[560px]">
      <h2 className="text-[20px] font-semibold tracking-tight mb-[6px]">个人信息</h2>
      <p className="text-[13px] text-neutral-500 mb-[24px]">维护昵称和头像展示</p>

      {/* 顶部预览卡 */}
      <div className="rounded-[20px] border border-neutral-200/70 bg-white p-[24px] flex items-center gap-[20px]">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
          {renderAvatarContent()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold text-neutral-900 truncate">
            {nickname.trim() || user?.username || '—'}
          </div>
          <div className="text-[12.5px] text-neutral-500 mt-[2px]">@{user?.username}</div>
        </div>
        <div className="text-[11.5px] text-neutral-400">{msg}</div>
      </div>

      {/* 昵称 */}
      <div className="mt-[20px]">
        <label className="block text-[12px] font-medium text-neutral-700 mb-[8px]">昵称</label>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value.slice(0, 24))}
          placeholder="起个好听的昵称（可选）"
          className="w-full h-11 px-4 rounded-[12px] bg-[#f4f4f5] focus:bg-[#ededed] outline-none text-[14px]"
        />
        <div className="text-[11px] text-neutral-400 mt-[6px]">{nickname.length}/24</div>
      </div>

      {/* 头像选择 */}
      <div className="mt-[24px]">
        <label className="flex items-center gap-[6px] text-[12px] font-medium text-neutral-700 mb-[10px]">
          <Camera size={13} strokeWidth={2} /> 头像
        </label>

        {/* 上传按钮 */}
        <div className="flex items-center gap-[10px] mb-[14px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-[6px] h-10 px-4 rounded-[12px] bg-neutral-900 text-white text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? '上传中…' : '上传本地图片'}
          </button>
          <span className="text-[11px] text-neutral-400">JPG / PNG / WebP / GIF · ≤ 2MB</span>
        </div>

        {/* Emoji 预设 */}
        <div className="text-[11.5px] text-neutral-400 mb-[6px]">或选一个 emoji：</div>
        <div className="flex flex-wrap gap-[8px]">
          {AVATAR_PRESETS.map(em => (
            <button
              key={em}
              onClick={() => { setAvatar(em); setLocalPreview(null); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-[22px] transition-all ${
                !localPreview && avatar === em
                  ? 'bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-2'
                  : 'bg-[#f4f4f5] hover:bg-[#ededed]'
              }`}
            >
              {em}
            </button>
          ))}
        </div>

        {/* URL 输入 */}
        <div className="mt-[12px] flex gap-[8px]">
          <input
            type="text"
            value={avatar}
            onChange={e => { setAvatar(e.target.value); setLocalPreview(null); }}
            placeholder="或粘贴图片 URL"
            className="flex-1 h-10 px-4 rounded-[10px] bg-[#f4f4f5] focus:bg-[#ededed] outline-none text-[13px]"
          />
          {avatar && (
            <button
              onClick={() => { setAvatar(''); setLocalPreview(null); }}
              className="h-10 px-4 rounded-[10px] bg-[#f4f4f5] text-neutral-600 text-[12.5px] hover:bg-[#ededed]"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="mt-[28px] flex justify-end">
        <button
          onClick={onSave}
          disabled={saving || uploading || !hasChanges}
          className="inline-flex items-center gap-[4px] h-10 px-5 rounded-[12px] bg-neutral-900 text-white text-[13.5px] font-medium hover:bg-neutral-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={14} strokeWidth={2.2} /> {saving ? '保存中…' : '保存修改'}
        </button>
      </div>
    </div>
  );
}
