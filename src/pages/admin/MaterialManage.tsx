import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Music,
  Upload,
  Play,
  Edit2,
  Trash2,
  Clock,
  Smartphone,
  Monitor,
  Search,
  Plus,
  Eye,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'blocked': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return '已通过';
    case 'pending': return '待审核';
    case 'rejected': return '已驳回';
    case 'blocked': return '已屏蔽';
    default: return status;
  }
};

export default function MaterialManage() {
  const { videos, music } = useStore();
  const [activeTab, setActiveTab] = useState<'video' | 'music'>('video');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMusic = music.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">素材库管理</h1>
          <p className="text-gray-400 mt-1">管理视频素材和背景音乐</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索素材..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stage-800/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" />上传素材
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 bg-stage-800/30 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('video')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg transition-all',
            activeTab === 'video'
              ? 'bg-gold-gradient text-stage-900 font-semibold'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Video className="w-4 h-4" />视频库
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg transition-all',
            activeTab === 'music'
              ? 'bg-gold-gradient text-stage-900 font-semibold'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Music className="w-4 h-4" />音乐库
        </button>
      </div>

      {activeTab === 'video' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="group relative bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-stage-700 to-stage-800 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gold-400/30" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-stage-900 ml-1" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded-lg text-xs font-medium border',
                    getStatusStyle(video.status)
                  )}>
                    {getStatusText(video.status)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
                    {video.orientation === 'portrait' ? (
                      <><Smartphone className="w-3 h-3" />竖屏</>
                    ) : (
                      <><Monitor className="w-3 h-3" />横屏</>
                    )}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />{formatDuration(video.duration)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold truncate group-hover:text-gold-400 transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{video.className}</span>
                  <span>{video.playCount.toLocaleString()} 播放</span>
                </div>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-gold-500/20 text-gold-400 transition-colors text-sm">
                    <Eye className="w-4 h-4" />预览
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-neon-cyan/20 text-neon-cyan transition-colors text-sm">
                    <Edit2 className="w-4 h-4" />编辑
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors text-sm">
                    <Trash2 className="w-4 h-4" />删除
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gold-500/30 rounded-2xl p-6 cursor-pointer hover:border-gold-400 hover:bg-gold-500/5 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gold-gradient/20 flex items-center justify-center mb-4 group-hover:bg-gold-gradient/30 transition-colors">
              <Plus className="w-8 h-8 text-gold-400" />
            </div>
            <p className="text-gold-400 font-semibold">上传新视频</p>
            <p className="text-xs text-gray-500 mt-1">支持 MP4、MOV 格式</p>
          </motion.div>
        </motion.div>
      ) : (
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
                        <div className="h-full bg-gold-gradient rounded-full" style={{ width: `${track.volume}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{track.volume}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-colors"><Play className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-neon-cyan/20 text-neon-cyan transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
