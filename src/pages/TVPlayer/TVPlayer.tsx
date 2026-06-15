import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, QrCode, Phone, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Settings } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../stores/useStore';

const TVPlayer = () => {
  const { 
    playback, 
    program, 
    vote, 
    enrollmentConfig,
    togglePlay, 
    toggleMute, 
    nextVideo, 
    prevVideo, 
    likeVideo, 
    recordScan,
    recordConsultation,
    submitVote,
    updateProgress,
    loadAllData,
    syncPlayback,
  } = useStore();

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      syncPlayback();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncPlayback]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [likeParticles, setLikeParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const currentVideo = playback.currentVideo;
  const approvedItems = program.items.filter(i => i.video.status === 'approved');
  const isInsertMode = playback.insertQueue.length > 0;

  const displayIndex = isInsertMode
    ? (playback.resumeIndex >= 0 ? playback.resumeIndex : 0) + 1
    : playback.currentIndex + 1;
  const totalCount = approvedItems.length;
  const sideTrackItems = isInsertMode
    ? [...playback.insertQueue.map(v => ({ id: `insert-${v.id}`, video: v, status: 'playing' as const, isInsert: true })),
       ...approvedItems.map((it, i) => ({ ...it, isInsert: false, resumed: i === playback.resumeIndex + 1 }))]
    : approvedItems.map((it) => ({ ...it, isInsert: false }));
  const sideTrackCurrent = isInsertMode
    ? 0
    : playback.currentIndex;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    const handleTimeUpdate = () => {
      const progress = video.currentTime / video.duration;
      updateProgress(progress);
    };

    const handleEnded = () => {
      if (playback.loopMode === 'single') {
        video.currentTime = 0;
        video.play();
      } else {
        nextVideo();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo?.id, playback.loopMode, nextVideo, updateProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playback.isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playback.isPlaying, playback.currentIndex]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = (e: React.MouseEvent) => {
    if (!currentVideo) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    setLikeParticles(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => {
      setLikeParticles(prev => prev.slice(1));
    }, 800);
    
    likeVideo(currentVideo.id);
  };

  const handleVote = (optionId: string) => {
    if (votedOption) return;
    setVotedOption(optionId);
    submitVote(optionId);
    setTimeout(() => {
      setShowVote(false);
      setVotedOption(null);
    }, 2000);
  };

  const totalVotes = vote.options.reduce((sum, o) => sum + o.count, 0);

  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stage-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold-400 text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        key={currentVideo.id}
        src={currentVideo.videoUrl}
        poster={currentVideo.coverUrl}
        className={`absolute inset-0 w-full h-full object-cover video-transition-enter ${
          currentVideo.orientation === 'portrait' ? 'object-contain bg-black' : ''
        }`}
        muted={playback.isMuted}
        playsInline
        autoPlay
        loop={playback.loopMode === 'single'}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 p-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="pointer-events-auto">
            <div className="glass-card px-6 py-4 glow-border">
              <h1 className="font-display text-3xl font-bold text-gradient-gold text-shadow-glow mb-1">
                {currentVideo.title}
              </h1>
              <div className="flex items-center gap-4 text-white/70">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                  {currentVideo.className}
                </span>
                <span>{currentVideo.theme}</span>
                <span>{formatTime(currentVideo.duration)}</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            {isInsertMode && (
              <div className="glass-card px-4 py-2 flex items-center gap-2 border-neon-pink/50">
                <div className="w-3 h-3 rounded-full bg-neon-pink animate-pulse" />
                <span className="text-sm text-neon-pink font-semibold">临时插播</span>
              </div>
            )}
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white/80">正在播放</span>
            </div>
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gold-400">第 {displayIndex}/{totalCount} 个{isInsertMode ? '（插播）' : ''}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-32 left-8 z-10">
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-6"
            >
              <button
                onClick={handleLike}
                className="group relative glass-card-hover p-4 flex flex-col items-center gap-2 min-w-[80px]"
              >
                <Heart
                  size={32}
                  className="text-neon-pink group-hover:scale-110 transition-transform fill-neon-pink"
                />
                <span className="text-sm font-medium">{currentVideo.likeCount}</span>
              </button>

              <button
                onClick={() => {
                  recordScan();
                  setShowVote(!showVote);
                  setShowEnrollment(false);
                }}
                className={`glass-card-hover p-4 flex flex-col items-center gap-2 min-w-[80px] ${showVote ? 'border-gold-500' : ''}`}
              >
                <Settings size={32} className="text-neon-purple" />
                <span className="text-sm font-medium">投票</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {likeParticles.map(particle => (
          <div
            key={particle.id}
            className="fixed pointer-events-none z-50 like-particle"
            style={{ left: particle.x, top: particle.y }}
          >
            <Heart size={24} className="text-neon-pink fill-neon-pink" />
          </div>
        ))}
      </div>

      <div className="absolute bottom-32 right-8 z-10">
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-6"
            >
              <button
                onClick={() => {
                  recordScan();
                  setShowEnrollment(!showEnrollment);
                  setShowVote(false);
                }}
                className={`glass-card-hover p-6 flex flex-col items-center gap-2 qr-pulse ${showEnrollment ? 'border-gold-500' : ''}`}
              >
                <QRCodeSVG value="https://example.com/enroll" size={64} level="H" includeMargin={false} />
                <span className="text-sm font-medium text-gold-400">扫码咨询</span>
              </button>

              <button
                onClick={() => {
                  recordConsultation();
                  setShowEnrollment(true);
                }}
                className="btn-gold flex items-center gap-2 py-4"
              >
                <Phone size={24} />
                <span>{enrollmentConfig.buttonText}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showEnrollment && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute right-8 bottom-56 w-80 glass-card p-6 glow-border z-20"
          >
            <h3 className="font-display text-xl font-bold text-gradient-gold mb-4">课程咨询</h3>
            <p className="text-white/70 mb-4">{enrollmentConfig.description}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Phone size={20} className="text-gold-400" />
                <span className="text-lg font-medium">{enrollmentConfig.phone}</span>
              </div>
              <div className="flex justify-center p-4 bg-white rounded-xl">
                <QRCodeSVG value="https://example.com/wechat" size={120} level="H" />
              </div>
              <p className="text-center text-sm text-white/60">扫码添加老师微信</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVote && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute left-8 bottom-56 w-96 glass-card p-6 glow-border z-20 max-h-[60vh] overflow-y-auto"
          >
            <h3 className="font-display text-xl font-bold text-gradient-gold mb-2">{vote.title}</h3>
            <p className="text-white/60 text-sm mb-4">
              截止时间：{new Date(vote.endAt).toLocaleDateString('zh-CN')}
            </p>
            <div className="space-y-3">
              {vote.options.map((option, idx) => {
                const percentage = totalVotes > 0 ? Math.round((option.count / totalVotes) * 100) : 0;
                const isVoted = votedOption === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={!!votedOption}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isVoted 
                        ? 'bg-gold-500/20 border border-gold-500' 
                        : votedOption 
                          ? 'bg-white/5 border border-white/10 opacity-60' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold-500/30'
                    }`}
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-gold-500/30 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isVoted ? 'bg-gold-500 text-stage-900' : 'bg-white/10 text-white/70'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gold-400 font-bold">{percentage}%</span>
                        <span className="text-white/50 text-sm">({option.count}票)</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {votedOption && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gold-400 mt-4 font-medium"
              >
                ✓ 投票成功！感谢您的参与
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-6 z-10"
          >
            <div className="glass-card p-4 backdrop-blur-xl">
              <div className="relative h-2 bg-white/10 rounded-full mb-4 overflow-hidden cursor-pointer group">
                <div
                  className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full progress-glow transition-all duration-100"
                  style={{ width: `${playback.progress * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${playback.progress * 100}% - 8px)` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <span>{formatTime(playback.progress * currentVideo.duration)}</span>
                  <span>/</span>
                  <span>{formatTime(currentVideo.duration)}</span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={prevVideo}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <SkipBack size={24} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-gold-gradient text-stage-900 hover:scale-110 transition-transform"
                  >
                    {playback.isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                  </button>
                  <button
                    onClick={nextVideo}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <SkipForward size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                    <span className="text-xs text-white/60">循环模式</span>
                    <span className="text-sm text-gold-400 font-medium">
                      {playback.loopMode === 'single' ? '单曲' : playback.loopMode === 'list' ? '列表' : '随机'}
                    </span>
                  </div>
                  <button
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {playback.isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <QrCode size={24} className="text-white/50" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {sideTrackItems.map((item: any, idx: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx, 8) * 0.1 }}
            className={`w-1.5 h-12 rounded-full transition-all duration-300 cursor-pointer ${
              idx === sideTrackCurrent
                ? item.isInsert
                  ? 'bg-neon-pink w-3 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                  : 'bg-gold-gradient w-3 progress-glow'
                : item.isInsert
                  ? 'bg-neon-pink/40'
                  : item.resumed
                    ? 'bg-gold-400/50'
                    : item.status === 'played'
                      ? 'bg-white/30'
                      : 'bg-white/10 hover:bg-white/30'
            }`}
            title={item.isInsert ? `插播: ${item.video.title}` : item.video.title}
          />
        ))}
      </div>
    </div>
  );
};

export default TVPlayer;
