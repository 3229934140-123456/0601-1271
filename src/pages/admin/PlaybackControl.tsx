import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  SkipForward as Skip,
  Repeat,
  Repeat1,
  Shuffle,
  Plus,
  X,
  QrCode,
  ListVideo,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const loopModes = [
  { mode: 'single', icon: Repeat1, label: '单曲循环' },
  { mode: 'list', icon: Repeat, label: '列表循环' },
  { mode: 'random', icon: Shuffle, label: '随机播放' },
] as const;

export default function PlaybackControl() {
  const { playback, program, videos, togglePlay, toggleMute, nextVideo, prevVideo, skipVideo, setLoopMode, insertVideo } = useStore();
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const approvedVideos = videos.filter(v => v.status === 'approved');
  const currentIdx = program.items.findIndex(i => i.status === 'playing');
  const progressPercent = currentIdx >= 0 ? ((currentIdx + 1) / program.items.length) * 100 : 0;

  const handleInsertVideo = (videoId: string) => {
    insertVideo(videoId);
    setInsertModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">播放控制</h1>
          <p className="text-gray-400 mt-1">远程控制电视端播放</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setQrModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stage-800/50 border border-gold-500/20 hover:border-gold-400/50 transition-all">
            <QrCode className="w-4 h-4 text-gold-400" />远程控制
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          <div className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-4">
              {playback.currentVideo ? (
                <img src={playback.currentVideo.coverUrl} alt={playback.currentVideo.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <ListVideo className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold mb-1">{playback.currentVideo?.title || '暂无播放'}</h3>
                <p className="text-sm text-gray-400">{playback.currentVideo?.className}</p>
              </div>
              <div className="absolute top-4 right-4">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', playback.isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>
                  {playback.isPlaying ? '播放中' : '已暂停'}
                </span>
              </div>
            </div>
            <div className="h-2 bg-stage-700 rounded-full overflow-hidden mb-4">
              <motion.div className="h-full bg-gold-gradient" initial={{ width: 0 }} animate={{ width: `${playback.progress * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={prevVideo} className="p-3 rounded-xl bg-stage-700 hover:bg-gold-500/20 hover:text-gold-400 transition-all"><SkipBack className="w-5 h-5" /></button>
              <button onClick={togglePlay} className="p-4 rounded-2xl bg-gold-gradient text-stage-900 hover:opacity-90 transition-all">
                {playback.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button onClick={nextVideo} className="p-3 rounded-xl bg-stage-700 hover:bg-gold-500/20 hover:text-gold-400 transition-all"><SkipForward className="w-5 h-5" /></button>
              <div className="w-px h-8 bg-gold-500/20" />
              <button onClick={toggleMute} className={cn('p-3 rounded-xl transition-all', playback.isMuted ? 'bg-red-500/20 text-red-400' : 'bg-stage-700 hover:bg-gold-500/20 hover:text-gold-400')}>
                {playback.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={skipVideo} className="p-3 rounded-xl bg-stage-700 hover:bg-neon-pink/20 hover:text-neon-pink transition-all"><Skip className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Repeat className="w-5 h-5 text-gold-400" />循环模式</h3>
            <div className="grid grid-cols-3 gap-3">
              {loopModes.map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setLoopMode(mode)} className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border transition-all', playback.loopMode === mode ? 'bg-gold-gradient/20 border-gold-400 text-gold-400' : 'bg-stage-700/50 border-transparent hover:border-gold-500/30')}>
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><ListVideo className="w-5 h-5 text-gold-400" />播放进度</h3>
              <button onClick={() => setInsertModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold-gradient/20 text-gold-400 text-sm hover:bg-gold-gradient/30 transition-all">
                <Plus className="w-4 h-4" />插播
              </button>
            </div>
            <div className="relative mb-4">
              <div className="h-2 bg-stage-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold-gradient" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{currentIdx + 1} / {program.items.length}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {program.items.map((item, index) => (
                <div key={item.id} className={cn('flex items-center gap-3 p-3 rounded-xl transition-all', item.status === 'playing' ? 'bg-gold-gradient/10 border border-gold-400/30' : item.status === 'played' ? 'opacity-60' : 'bg-white/5')}>
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', item.status === 'playing' ? 'bg-gold-gradient text-stage-900' : item.status === 'played' ? 'bg-green-500/20 text-green-400' : 'bg-stage-700 text-gray-500')}>
                    {item.status === 'played' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.video.title}</p>
                    <p className="text-xs text-gray-500">{item.video.className}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{formatDuration(item.scheduledDuration)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {insertModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-stage-800 border border-gold-500/30 rounded-2xl p-6">
              <button onClick={() => setInsertModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-6">选择插播视频</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {approvedVideos.map((video) => (
                  <button key={video.id} onClick={() => handleInsertVideo(video.id)} className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-gold-500/10 hover:border-gold-400/30 border border-transparent transition-all text-left">
                    <img src={video.coverUrl} alt={video.title} className="w-16 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.className}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatDuration(video.duration)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {qrModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-stage-800 border border-gold-500/30 rounded-2xl p-6 text-center">
              <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              <QrCode className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-4">扫码远程控制</h3>
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCodeSVG value="https://remote-control.example.com" size={180} level="H" />
              </div>
              <p className="text-sm text-gray-400">使用手机扫描二维码，即可远程控制电视播放</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
