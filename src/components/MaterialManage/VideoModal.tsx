import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import type { Video, DanceClass, Music } from '../../../shared/types';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  video?: Video | null;
  classes: DanceClass[];
  musicList: Music[];
}

const defaultForm = {
  title: '',
  classId: '',
  theme: '',
  duration: 60,
  orientation: 'landscape' as 'portrait' | 'landscape',
  coverUrl: '',
  videoUrl: '',
  bgmId: '',
};

export default function VideoModal({ isOpen, onClose, onSubmit, video, classes, musicList }: VideoModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (video) {
      setForm({
        title: video.title,
        classId: video.classId,
        theme: video.theme,
        duration: video.duration,
        orientation: video.orientation,
        coverUrl: video.coverUrl,
        videoUrl: video.videoUrl,
        bgmId: video.bgmId || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [video, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form };
      if (!data.bgmId) delete (data as any).bgmId;
      await onSubmit(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-stage-800/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gold-500/20">
            <h2 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              {video ? '编辑视频' : '上传视频'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">视频标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                placeholder="请输入视频标题"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">班级</label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">请选择班级</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">主题</label>
                <input
                  type="text"
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                  placeholder="舞蹈主题"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">视频格式</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={form.orientation === 'landscape'}
                    onChange={(e) => setForm({ ...form, orientation: e.target.value as 'landscape' | 'portrait' })}
                    className="text-gold-500"
                  />
                  <span className="text-sm">横屏 16:9</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={form.orientation === 'portrait'}
                    onChange={(e) => setForm({ ...form, orientation: e.target.value as 'landscape' | 'portrait' })}
                    className="text-gold-500"
                  />
                  <span className="text-sm">竖屏 9:16</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">时长（秒）</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">背景音乐</label>
                <select
                  value={form.bgmId}
                  onChange={(e) => setForm({ ...form, bgmId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                >
                  <option value="">无背景音乐</option>
                  {musicList.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} - {m.artist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">封面图 URL</label>
              <input
                type="url"
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">视频 URL</label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                placeholder="https://..."
                required
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-gold-500/20 hover:bg-white/10 transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {submitting ? '提交中...' : video ? '保存修改' : '上传视频'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
