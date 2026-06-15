import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, GraduationCap, Tag, Music } from 'lucide-react';
import type { Video } from '../../../shared/types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PreviewModal({ isOpen, onClose, video }: PreviewModalProps) {
  if (!isOpen || !video) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-3xl bg-stage-800/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gold-500/20">
            <h2 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              视频预览
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-stage-900">
              <video
                src={video.videoUrl}
                poster={video.coverUrl}
                controls
                className="w-full h-full object-cover"
              >
                您的浏览器不支持视频播放
              </video>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{video.title}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <GraduationCap className="w-5 h-5 text-gold-400" />
                  <div>
                    <p className="text-xs text-gray-400">班级</p>
                    <p className="font-medium">{video.className}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Clock className="w-5 h-5 text-gold-400" />
                  <div>
                    <p className="text-xs text-gray-400">时长</p>
                    <p className="font-medium">{formatDuration(video.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Tag className="w-5 h-5 text-gold-400" />
                  <div>
                    <p className="text-xs text-gray-400">主题</p>
                    <p className="font-medium">{video.theme}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Music className="w-5 h-5 text-gold-400" />
                  <div>
                    <p className="text-xs text-gray-400">格式</p>
                    <p className="font-medium">
                      {video.orientation === 'portrait' ? '竖屏 9:16' : '横屏 16:9'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-400">播放量</p>
                    <p className="text-lg font-bold text-gold-400">{video.playCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">点赞数</p>
                    <p className="text-lg font-bold text-neon-pink">{video.likeCount.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    video.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    video.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    video.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {video.status === 'approved' ? '已通过' :
                     video.status === 'pending' ? '待审核' :
                     video.status === 'rejected' ? '已驳回' : '已屏蔽'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
