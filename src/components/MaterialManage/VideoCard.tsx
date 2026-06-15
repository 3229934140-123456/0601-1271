import { motion } from 'framer-motion';
import { Play, Eye, Edit2, Trash2, Clock, Smartphone, Monitor } from 'lucide-react';
import type { Video } from '../../../shared/types';
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

interface VideoCardProps {
  video: Video;
  index: number;
  onPreview: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

export default function VideoCard({ video, index, onPreview, onEdit, onDelete }: VideoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="group relative bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all"
    >
      <div className="relative aspect-video overflow-hidden">
        {video.coverUrl ? (
          <img
            src={video.coverUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stage-700 to-stage-800 flex items-center justify-center">
            <Play className="w-12 h-12 text-gold-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPreview(video)}
            className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center hover:scale-110 transition-transform"
          >
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
          <button
            onClick={() => onPreview(video)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-gold-500/20 text-gold-400 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />预览
          </button>
          <button
            onClick={() => onEdit(video)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-neon-cyan/20 text-neon-cyan transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />编辑
          </button>
          <button
            onClick={() => onDelete(video)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />删除
          </button>
        </div>
      </div>
    </motion.div>
  );
}
