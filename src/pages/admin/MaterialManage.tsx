import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Music, Search, Upload, Filter, Plus } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { Video as VideoType } from '../../../shared/types';
import VideoCard from '@/components/MaterialManage/VideoCard';
import VideoModal from '@/components/MaterialManage/VideoModal';
import PreviewModal from '@/components/MaterialManage/PreviewModal';
import MusicManager from '@/components/MaterialManage/MusicManager';

export default function MaterialManage() {
  const { videos, classes, music, fetchVideos, fetchClasses, fetchMusic, createVideo, updateVideo, deleteVideo } = useStore();
  const [activeTab, setActiveTab] = useState<'video' | 'music'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrientation, setFilterOrientation] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchClasses();
    fetchMusic();
  }, []);

  const filteredVideos = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = !filterClass || v.classId === filterClass;
    const matchStatus = !filterStatus || v.status === filterStatus;
    const matchOrientation = !filterOrientation || v.orientation === filterOrientation;
    return matchSearch && matchClass && matchStatus && matchOrientation;
  });

  const handlePreview = (video: VideoType) => {
    setPreviewVideo(video);
    setShowPreviewModal(true);
  };

  const handleEdit = (video: VideoType) => {
    setEditingVideo(video);
    setShowVideoModal(true);
  };

  const handleDelete = async (video: VideoType) => {
    if (confirm(`确定要删除视频「${video.title}」吗？`)) {
      await deleteVideo(video.id);
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setShowVideoModal(true);
  };

  const handleVideoSubmit = async (data: any) => {
    if (editingVideo) {
      await updateVideo(editingVideo.id, data);
    } else {
      await createVideo(data);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
            素材库管理
          </h1>
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
          {activeTab === 'video' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors',
                showFilters
                  ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                  : 'bg-white/5 border-gold-500/20 hover:bg-white/10'
              )}
            >
              <Filter className="w-4 h-4" />筛选
            </button>
          )}
          {activeTab === 'video' && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />上传视频
            </button>
          )}
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

      {activeTab === 'video' && showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-wrap gap-4 p-4 bg-stage-800/50 rounded-xl border border-gold-500/20"
        >
          <div>
            <label className="block text-xs text-gray-400 mb-1">班级</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 rounded-lg bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm"
            >
              <option value="">全部班级</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已驳回</option>
              <option value="blocked">已屏蔽</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">格式</label>
            <select
              value={filterOrientation}
              onChange={(e) => setFilterOrientation(e.target.value)}
              className="px-3 py-2 rounded-lg bg-stage-900/50 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm"
            >
              <option value="">全部格式</option>
              <option value="portrait">竖屏</option>
              <option value="landscape">横屏</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterClass('');
                setFilterStatus('');
                setFilterOrientation('');
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gold-400 transition-colors"
            >
              重置筛选
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'video' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Video className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">暂无视频素材</p>
              <p className="text-sm mt-2">点击右上角按钮上传第一个视频</p>
              <button
                onClick={handleCreate}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />上传视频
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={index}
                  onPreview={handlePreview}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <MusicManager searchQuery={searchQuery} />
      )}

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onSubmit={handleVideoSubmit}
        video={editingVideo}
        classes={classes}
        musicList={music}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        video={previewVideo}
      />
    </div>
  );
}
