import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Ban,
  Shield,
  ShieldOff,
  Play,
  Clock,
  GraduationCap,
  Video as VideoIcon,
  Search,
  ThumbsUp,
  Eye,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import type { Video } from '../../../shared/types';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ReviewCenter() {
  const {
    videos,
    fetchVideos,
    approveVideo,
    rejectVideo,
    blockVideo,
    unblockVideo,
    togglePortraitAuth,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'blocked'>('pending');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || null;

  const pendingVideos = videos.filter(v =>
    v.status === 'pending' &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.className.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const blockedVideos = videos.filter(v =>
    v.status === 'blocked' &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.className.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayVideos = activeTab === 'pending' ? pendingVideos : blockedVideos;

  const handleApprove = async (id: string) => {
    await approveVideo(id);
    const updated = videos.find(v => v.id === id);
    if (updated?.status === 'approved') {
      setSelectedVideoId(null);
    }
  };

  const handleReject = async (id: string) => {
    await rejectVideo(id);
    const updated = videos.find(v => v.id === id);
    if (updated?.status === 'rejected') {
      setSelectedVideoId(null);
    }
  };

  const handleBlock = async (id: string) => {
    await blockVideo(id);
    const updated = videos.find(v => v.id === id);
    if (updated?.status === 'blocked') {
      setSelectedVideoId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    await unblockVideo(id);
    const updated = videos.find(v => v.id === id);
    if (updated?.status === 'approved') {
      setSelectedVideoId(null);
    }
  };

  const handleTogglePortraitAuth = async (id: string) => {
    await togglePortraitAuth(id);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">审核中心</h1>
          <p className="text-gray-400 mt-1">审核视频内容，管理屏蔽列表</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索视频..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stage-800/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 bg-stage-800/30 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab('pending'); setSelectedVideoId(null); }}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg transition-all relative',
            activeTab === 'pending' ? 'bg-gold-gradient text-stage-900 font-semibold' : 'text-gray-400 hover:text-white'
          )}
        >
          <Clock className="w-4 h-4" />待审核
          {pendingVideos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-neon-pink text-white">{pendingVideos.length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('blocked'); setSelectedVideoId(null); }}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg transition-all',
            activeTab === 'blocked' ? 'bg-gold-gradient text-stage-900 font-semibold' : 'text-gray-400 hover:text-white'
          )}
        >
          <Ban className="w-4 h-4" />已屏蔽
          {blockedVideos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-600 text-white">{blockedVideos.length}</span>
          )}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-gold-500/20">
            <h3 className="font-semibold flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-gold-400" />
              {activeTab === 'pending' ? '待审核列表' : '已屏蔽列表'}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {displayVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <VideoIcon className="w-12 h-12 mb-4 opacity-30" />
                <p>{activeTab === 'pending' ? '暂无待审核视频' : '暂无已屏蔽视频'}</p>
              </div>
            ) : (
              displayVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => setSelectedVideoId(video.id)}
                  className={cn(
                    'p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5',
                    selectedVideoId === video.id ? 'bg-gold-gradient/10 border-l-4 border-l-gold-400' : ''
                  )}
                >
                  <div className="flex gap-3">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-stage-700 flex-shrink-0">
                      <VideoIcon className="absolute inset-0 m-auto w-8 h-8 text-gold-400/30" />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs bg-black/70 text-white">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{video.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <GraduationCap className="w-3 h-3" />
                        <span className="truncate">{video.className}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {!video.portraitAuthorized && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">需肖像授权</span>
                        )}
                        <span className="text-xs text-gray-500">{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedVideo ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><Play className="w-5 h-5 text-gold-400" />预览面板</h3>
                <button onClick={() => setSelectedVideoId(null)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="aspect-video rounded-2xl overflow-hidden bg-stage-900 mb-6 relative">
                  <VideoIcon className="absolute inset-0 m-auto w-16 h-16 text-gold-400/20" />
                  <button className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-stage-900 ml-1" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedVideo.title}</h2>
                    <p className="text-gray-400 text-sm">主题：{selectedVideo.theme}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">班级</p>
                      <p className="font-medium flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gold-400" />{selectedVideo.className}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">时长</p>
                      <p className="font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-gold-400" />{formatDuration(selectedVideo.duration)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">格式</p>
                      <p className="font-medium">{selectedVideo.orientation === 'portrait' ? '竖屏 9:16' : '横屏 16:9'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">上传时间</p>
                      <p className="font-medium">{new Date(selectedVideo.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">播放量</p>
                      <p className="font-medium flex items-center gap-2"><Eye className="w-4 h-4 text-gold-400" />{selectedVideo.playCount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">点赞数</p>
                      <p className="font-medium flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-neon-pink" />{selectedVideo.likeCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      {selectedVideo.portraitAuthorized ? (
                        <><Shield className="w-5 h-5 text-green-400" /><div><p className="font-medium">肖像权已授权</p><p className="text-xs text-gray-400">可正常播放</p></div></>
                      ) : (
                        <><ShieldOff className="w-5 h-5 text-red-400" /><div><p className="font-medium">肖像权未授权</p><p className="text-xs text-gray-400">需确认后方可播放</p></div></>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">授权</span>
                      <button
                        onClick={() => handleTogglePortraitAuth(selectedVideo.id)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          selectedVideo.portraitAuthorized ? 'bg-green-500' : 'bg-gray-600'
                        )}
                      >
                        <motion.div
                          animate={{ x: selectedVideo.portraitAuthorized ? 24 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gold-500/20 flex gap-3">
                {activeTab === 'pending' ? (
                  <>
                    <button onClick={() => handleReject(selectedVideo.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-medium">
                      <X className="w-5 h-5" />驳回
                    </button>
                    <button onClick={() => handleBlock(selectedVideo.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:bg-gray-500/20 transition-colors font-medium">
                      <Ban className="w-5 h-5" />屏蔽
                    </button>
                    <button onClick={() => handleApprove(selectedVideo.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-stage-900 hover:opacity-90 transition-opacity font-semibold">
                      <Check className="w-5 h-5" />通过
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleUnblock(selectedVideo.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-stage-900 hover:opacity-90 transition-opacity font-semibold">
                    <Shield className="w-5 h-5" />解除屏蔽
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl flex items-center justify-center"
            >
              <div className="text-center text-gray-500">
                <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">选择一个视频进行预览</p>
                <p className="text-sm mt-2">点击左侧列表中的视频查看详情</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
