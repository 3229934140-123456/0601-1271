import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Edit2, Trash2, Plus, X, Upload } from 'lucide-react';
import type { Music as MusicType } from '../../../shared/types';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface MusicManagerProps {
  searchQuery: string;
}

const defaultForm = {
  name: '',
  artist: '',
  duration: 180,
  url: '',
  volume: 80,
};

export default function MusicManager({ searchQuery }: MusicManagerProps) {
  const { music, createMusic, updateMusic, deleteMusic } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicType | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredMusic = music.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingMusic(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (item: MusicType) => {
    setEditingMusic(item);
    setForm({
      name: item.name,
      artist: item.artist,
      duration: item.duration,
      url: item.url,
      volume: item.volume,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMusic) {
        await updateMusic(editingMusic.id, { ...form, volume: form.volume / 100 });
      } else {
        await createMusic({ ...form, volume: form.volume / 100 });
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: MusicType) => {
    if (confirm(`确定要删除音乐「${item.name}」吗？`)) {
      await deleteMusic(item.id);
    }
  };

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />上传音乐
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold-500/20">
              <th className="text-left p-4 text-gray-400 font-medium text-sm">名称</th>
              <th className="text-left p-4 text-gray-400 font-medium text-sm">艺术家</th>
              <th className="text-left p-4 text-gray-400 font-medium text-sm">时长</th>
              <th className="text-left p-4 text-gray-400 font-medium text-sm">音量</th>
              <th className="text-right p-4 text-gray-400 font-medium text-sm">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredMusic.map((track, index) => (
              <motion.tr
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-gradient/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-gold-400" />
                    </div>
                    <span className="font-medium">{track.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400">{track.artist}</td>
                <td className="p-4 text-gray-400 font-mono">{formatDuration(track.duration)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-stage-700 overflow-hidden">
                      <div
                        className="h-full bg-gold-gradient rounded-full"
                        style={{ width: `${track.volume * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(track.volume * 100)}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => togglePlay(track.id)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        playingId === track.id
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'hover:bg-gold-500/20 text-gold-400'
                      )}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(track)}
                      className="p-2 rounded-lg hover:bg-neon-cyan/20 text-neon-cyan transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(track)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredMusic.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无音乐</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-stage-800/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gold-500/20">
                <h2 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                  {editingMusic ? '编辑音乐' : '上传音乐'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">音乐名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                    placeholder="请输入音乐名称"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">艺术家</label>
                  <input
                    type="text"
                    value={form.artist}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                    placeholder="艺术家名称"
                  />
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">音量（%）</label>
                    <input
                      type="number"
                      value={form.volume}
                      onChange={(e) => setForm({ ...form, volume: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">音乐 URL</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    {submitting ? '提交中...' : editingMusic ? '保存修改' : '上传音乐'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
