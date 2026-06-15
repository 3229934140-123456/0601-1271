import { create } from 'zustand';
import type { Video, DanceClass, Music, Program, Vote, EnrollmentConfig, Device, Statistics, CampusReport, User, PlaybackState } from '../../shared/types';
import {
  videoAPI,
  classAPI,
  musicAPI,
  programAPI,
  playbackAPI,
  deviceAPI,
  statisticsAPI,
  interactionAPI,
  reportAPI,
} from '../services/api';
import { mockUser, mockProgram, mockVote, mockEnrollmentConfig, mockStatistics } from '../data/mockData';

interface AppState {
  user: User | null;
  videos: Video[];
  classes: DanceClass[];
  music: Music[];
  program: Program;
  vote: Vote;
  enrollmentConfig: EnrollmentConfig;
  devices: Device[];
  statistics: Statistics;
  reports: CampusReport[];
  playback: PlaybackState;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  dataLoaded: boolean;

  loadAllData: (force?: boolean) => Promise<void>;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  togglePlay: () => void;
  toggleMute: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  skipVideo: () => void;
  setLoopMode: (mode: 'single' | 'list' | 'random') => void;
  insertVideo: (videoId: string) => void;
  syncPlayback: () => Promise<void>;
  updateProgress: (progress: number) => void;

  fetchVideos: () => Promise<void>;
  approveVideo: (videoId: string) => Promise<void>;
  rejectVideo: (videoId: string) => Promise<void>;
  blockVideo: (videoId: string) => Promise<void>;
  unblockVideo: (videoId: string) => Promise<void>;
  togglePortraitAuth: (videoId: string) => Promise<void>;
  createVideo: (data: { title: string; classId: string; theme: string; duration: number; orientation: 'portrait' | 'landscape'; coverUrl: string; videoUrl: string; bgmId?: string }) => Promise<void>;
  updateVideo: (id: string, data: Partial<Video>) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;

  fetchClasses: () => Promise<void>;
  createClass: (name: string, level: string, teacher: string, studentCount: number, campusId?: string) => Promise<void>;
  updateClass: (id: string, data: Partial<DanceClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  fetchMusic: () => Promise<void>;
  createMusic: (data: Omit<Music, 'id'>) => Promise<void>;
  updateMusic: (id: string, data: Omit<Music, 'id'>) => Promise<void>;
  deleteMusic: (id: string) => Promise<void>;

  fetchProgram: () => Promise<void>;
  updateProgramInfo: (data: { name?: string; campusId?: string; loopMode?: 'single' | 'list' | 'random' }) => Promise<void>;
  updateProgramItemOrder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
  addVideoToProgram: (videoId: string) => Promise<void>;
  addVideosToProgram: (videoIds: string[]) => Promise<void>;
  removeFromProgram: (itemId: string) => Promise<void>;
  updateProgramItem: (itemId: string, data: { scheduledDuration?: number }) => Promise<void>;
  setActiveProgram: (programId: string) => Promise<void>;

  likeVideo: (videoId: string) => Promise<void>;
  submitVote: (optionId: string) => Promise<void>;
  recordScan: () => Promise<void>;
  recordConsultation: () => Promise<void>;
  fetchVote: () => Promise<void>;
  updateVote: (data: { title?: string; endAt?: string; isActive?: boolean }) => Promise<void>;
  addVoteOption: (text: string) => Promise<void>;
  updateVoteOption: (optionId: string, text: string) => Promise<void>;
  removeVoteOption: (optionId: string) => Promise<void>;
  resetVote: () => Promise<void>;
  fetchEnrollmentConfig: () => Promise<void>;
  updateEnrollmentConfig: (data: EnrollmentConfig) => Promise<void>;

  fetchStatistics: () => Promise<void>;
  fetchReports: () => Promise<void>;
  generateReport: (campusId: string, startDate: string, endDate: string) => Promise<CampusReport>;
}

const initialPlayback: PlaybackState = {
  isPlaying: true,
  isMuted: false,
  currentIndex: 0,
  currentVideo: null,
  progress: 0,
  loopMode: 'list',
  insertQueue: [],
  resumeIndex: -1,
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  videos: [],
  classes: [],
  music: [],
  program: mockProgram,
  vote: mockVote,
  enrollmentConfig: mockEnrollmentConfig,
  devices: [],
  statistics: mockStatistics,
  reports: [],
  playback: initialPlayback,
  isLoggedIn: false,
  loading: false,
  error: null,
  dataLoaded: false,

  loadAllData: async (force = false) => {
    if (get().dataLoaded && !force && !get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const [videos, classes, music, program, devices, statistics, reports, voteData, enrollment] = await Promise.all([
        videoAPI.list().catch(() => []),
        classAPI.list().catch(() => []),
        musicAPI.list().catch(() => []),
        programAPI.getActive().catch(() => mockProgram),
        deviceAPI.list().catch(() => []),
        statisticsAPI.getOverview().catch(() => mockStatistics),
        reportAPI.list().catch(() => []),
        interactionAPI.votes.list().catch(() => [mockVote]),
        interactionAPI.enrollment.get().catch(() => mockEnrollmentConfig),
      ]);

      const activeProgram = program || mockProgram;
      const approvedItems = activeProgram.items.filter(i => i.video.status === 'approved');
      const currentVideo = approvedItems[0]?.video || null;

      set({
        videos,
        classes,
        music,
        program: activeProgram,
        devices,
        statistics,
        reports,
        vote: voteData[0] || mockVote,
        enrollmentConfig: enrollment || mockEnrollmentConfig,
        playback: {
          ...initialPlayback,
          currentVideo,
          loopMode: activeProgram.loopMode,
        },
        loading: false,
        dataLoaded: true,
      });
    } catch (err: any) {
      set({ error: err.message || '加载数据失败', loading: false, dataLoaded: false });
    }
  },

  login: (username: string, password: string) => {
    if ((username === 'admin' && password === 'admin123') ||
        (username === 'teacher1' && password === '123456')) {
      set({ user: mockUser, isLoggedIn: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
  },

  togglePlay: () => {
    const isPlaying = !get().playback.isPlaying;
    set((state) => ({ playback: { ...state.playback, isPlaying } }));
    playbackAPI[isPlaying ? 'resume' : 'pause']().catch(() => {});
  },

  toggleMute: () => {
    const isMuted = !get().playback.isMuted;
    set((state) => ({ playback: { ...state.playback, isMuted } }));
    playbackAPI.toggleMute().catch(() => {});
  },

  nextVideo: () => {
    const state = get();

    if (state.playback.insertQueue.length > 0) {
      const newQueue = [...state.playback.insertQueue];
      newQueue.shift();
      if (newQueue.length > 0) {
        set({
          playback: {
            ...state.playback,
            insertQueue: newQueue,
            currentVideo: newQueue[0],
            progress: 0,
            isPlaying: true,
          },
        });
      } else {
        const resumeIdx = state.playback.resumeIndex >= 0 ? state.playback.resumeIndex : state.playback.currentIndex;
        const items = state.program.items.filter(i => i.video.status === 'approved');
        const nextIdx = state.playback.loopMode === 'random'
          ? Math.floor(Math.random() * items.length)
          : (resumeIdx + 1) % items.length;
        set({
          playback: {
            ...state.playback,
            insertQueue: [],
            resumeIndex: -1,
            currentIndex: nextIdx,
            currentVideo: items[nextIdx]?.video || null,
            progress: 0,
            isPlaying: true,
          },
        });
      }
      playbackAPI.next().catch(() => {});
      return;
    }

    const items = state.program.items.filter(i => i.video.status === 'approved');
    const currentIdx = state.playback.currentIndex;
    let nextIdx: number;

    if (state.playback.loopMode === 'random') {
      nextIdx = Math.floor(Math.random() * items.length);
    } else {
      nextIdx = (currentIdx + 1) % items.length;
    }

    const updatedItems = state.program.items.map((item, idx) => {
      const status = idx === nextIdx ? 'playing' as const : idx < nextIdx ? 'played' as const : 'pending' as const;
      return { ...item, status };
    });

    set({
      playback: {
        ...state.playback,
        currentIndex: nextIdx,
        currentVideo: items[nextIdx]?.video || null,
        progress: 0,
        isPlaying: true,
      },
      program: { ...state.program, items: updatedItems },
    });
    playbackAPI.next().catch(() => {});
  },

  prevVideo: () => {
    const state = get();

    if (state.playback.insertQueue.length > 0) {
      const newQueue = [...state.playback.insertQueue];
      newQueue.shift();
      if (newQueue.length > 0) {
        set({
          playback: {
            ...state.playback,
            insertQueue: newQueue,
            currentVideo: newQueue[0],
            progress: 0,
            isPlaying: true,
          },
        });
      } else {
        const resumeIdx = state.playback.resumeIndex >= 0 ? state.playback.resumeIndex : state.playback.currentIndex;
        const items = state.program.items.filter(i => i.video.status === 'approved');
        const prevIdx = resumeIdx > 0 ? resumeIdx - 1 : items.length - 1;
        set({
          playback: {
            ...state.playback,
            insertQueue: [],
            resumeIndex: -1,
            currentIndex: prevIdx,
            currentVideo: items[prevIdx]?.video || null,
            progress: 0,
            isPlaying: true,
          },
        });
      }
      playbackAPI.prev().catch(() => {});
      return;
    }

    const items = state.program.items.filter(i => i.video.status === 'approved');
    const currentIdx = state.playback.currentIndex;
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : items.length - 1;

    const updatedItems = state.program.items.map((item, idx) => {
      const status = idx === prevIdx ? 'playing' as const : idx < prevIdx ? 'played' as const : 'pending' as const;
      return { ...item, status };
    });

    set({
      playback: {
        ...state.playback,
        currentIndex: prevIdx,
        currentVideo: items[prevIdx]?.video || null,
        progress: 0,
        isPlaying: true,
      },
      program: { ...state.program, items: updatedItems },
    });
    playbackAPI.prev().catch(() => {});
  },

  skipVideo: () => {
    get().nextVideo();
  },

  setLoopMode: (mode: 'single' | 'list' | 'random') => {
    set((state) => ({
      playback: { ...state.playback, loopMode: mode },
      program: { ...state.program, loopMode: mode },
    }));
    playbackAPI.setLoopMode(mode).catch(() => {});
  },

  insertVideo: async (videoId: string) => {
    const state = get();
    const video = state.videos.find(v => v.id === videoId);
    if (!video) return;
    try {
      const result = await playbackAPI.insert(videoId);
      if (result) {
        set({ playback: result });
      } else {
        const newInsertQueue = [...state.playback.insertQueue, video];
        const resumeIndex = state.playback.insertQueue.length === 0 ? state.playback.currentIndex : state.playback.resumeIndex;
        set({
          playback: {
            ...state.playback,
            insertQueue: newInsertQueue,
            resumeIndex,
            currentVideo: newInsertQueue[0],
            progress: 0,
            isPlaying: true,
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  syncPlayback: async () => {
    try {
      const serverState = await playbackAPI.getState();
      if (serverState) {
        const prevVideoId = get().playback.currentVideo?.id;
        set({ playback: serverState });
        if (serverState.currentVideo && serverState.currentVideo.id !== prevVideoId) {
          const program = await programAPI.getActive();
          if (program) set({ program });
        }
      }
    } catch {}
  },

  updateProgress: (progress: number) => {
    set((state) => ({ playback: { ...state.playback, progress } }));
  },

  fetchVideos: async () => {
    try {
      const videos = await videoAPI.list();
      set({ videos });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  approveVideo: async (videoId: string) => {
    try {
      const updated = await videoAPI.approve(videoId);
      set((state) => ({
        videos: state.videos.map(v => v.id === videoId ? updated : v),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  rejectVideo: async (videoId: string) => {
    try {
      const updated = await videoAPI.reject(videoId);
      set((state) => ({
        videos: state.videos.map(v => v.id === videoId ? updated : v),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  blockVideo: async (videoId: string) => {
    try {
      const updated = await videoAPI.block(videoId);
      set((state) => ({
        videos: state.videos.map(v => v.id === videoId ? updated : v),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unblockVideo: async (videoId: string) => {
    try {
      const updated = await videoAPI.unblock(videoId);
      set((state) => ({
        videos: state.videos.map(v => v.id === videoId ? updated : v),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  togglePortraitAuth: async (videoId: string) => {
    try {
      const updated = await videoAPI.toggleAuthorize(videoId);
      set((state) => ({
        videos: state.videos.map(v => v.id === videoId ? updated : v),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createVideo: async (data) => {
    try {
      const newVideo = await videoAPI.create(data);
      set((state) => ({ videos: [...state.videos, newVideo] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateVideo: async (id, data) => {
    try {
      const updated = await videoAPI.update(id, data);
      set((state) => {
        const newVideos = state.videos.map(v => v.id === id ? updated : v);
        const newProgram = {
          ...state.program,
          items: state.program.items.map(item =>
            item.videoId === id ? { ...item, video: updated, scheduledDuration: data.duration ?? item.scheduledDuration } : item
          ),
        };
        const newPlayback = state.playback.currentVideo?.id === id
          ? { ...state.playback, currentVideo: updated }
          : state.playback;
        return { videos: newVideos, program: newProgram, playback: newPlayback };
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteVideo: async (videoId: string) => {
    try {
      await videoAPI.remove(videoId);
      set((state) => ({
        videos: state.videos.filter(v => v.id !== videoId),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchClasses: async () => {
    try {
      const classes = await classAPI.list();
      set({ classes });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createClass: async (name, level, teacher, studentCount, campusId?) => {
    try {
      const newClass = await classAPI.create({
        name, level, teacher, studentCount,
        campusId: campusId || 'campus_001',
      });
      set((state) => ({ classes: [...state.classes, newClass] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateClass: async (id, data) => {
    try {
      const existing = get().classes.find(c => c.id === id);
      const payload = {
        name: data.name ?? existing?.name,
        level: data.level ?? existing?.level,
        teacher: data.teacher ?? existing?.teacher,
        studentCount: data.studentCount ?? existing?.studentCount,
        campusId: data.campusId ?? existing?.campusId,
      };
      const updated = await classAPI.update(id, payload as any);
      set((state) => ({
        classes: state.classes.map(c => c.id === id ? updated : c),
        videos: state.videos.map(v =>
          v.classId === id ? { ...v, className: updated.name } : v
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteClass: async (id: string) => {
    try {
      await classAPI.remove(id);
      set((state) => ({
        classes: state.classes.filter(c => c.id !== id),
        videos: state.videos.map(v =>
          v.classId === id ? { ...v, classId: '', className: '未分配' } : v
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchMusic: async () => {
    try {
      const music = await musicAPI.list();
      set({ music });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createMusic: async (data) => {
    try {
      const newMusic = await musicAPI.create(data);
      set((state) => ({ music: [...state.music, newMusic] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateMusic: async (id, data) => {
    try {
      const updated = await musicAPI.update(id, data);
      set((state) => ({
        music: state.music.map(m => m.id === id ? updated : m),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteMusic: async (id: string) => {
    try {
      await musicAPI.remove(id);
      set((state) => ({
        music: state.music.filter(m => m.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchProgram: async () => {
    try {
      const program = await programAPI.getActive() || mockProgram;
      set({ program });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateProgramInfo: async (data) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.update(programId, { ...data, campusId: data.campusId || state.program.campusId });
      set({
        program: updated,
        playback: data.loopMode
          ? { ...state.playback, loopMode: data.loopMode }
          : state.playback,
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateProgramItemOrder: async (items) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.updateItems(programId, items);
      const approvedItems = updated.items.filter(i => i.video.status === 'approved');
      const currentVideoId = state.playback.currentVideo?.id;
      const newIdx = approvedItems.findIndex(i => i.videoId === currentVideoId);
      set({
        program: updated,
        playback: {
          ...state.playback,
          currentIndex: newIdx >= 0 ? newIdx : 0,
        },
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addVideoToProgram: async (videoId: string) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.addItem(programId, { videoId });
      set({ program: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addVideosToProgram: async (videoIds: string[]) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.addItems(programId, videoIds);
      set({ program: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeFromProgram: async (itemId: string) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.removeItem(programId, itemId);
      const approvedItems = updated.items.filter(i => i.video.status === 'approved');
      const removedIdx = state.program.items.findIndex(i => i.id === itemId);
      let newPlayback = { ...state.playback };
      if (removedIdx === state.playback.currentIndex || removedIdx < state.playback.currentIndex) {
        const newIdx = Math.min(state.playback.currentIndex, Math.max(0, approvedItems.length - 1));
        const currentStillExists = approvedItems.find(i => i.videoId === state.playback.currentVideo?.id);
        if (!currentStillExists || removedIdx === state.playback.currentIndex) {
          newPlayback = {
            ...newPlayback,
            currentIndex: newIdx,
            currentVideo: approvedItems[newIdx]?.video || null,
            progress: 0,
            isPlaying: true,
          };
        }
      }
      if (approvedItems.length === 0) {
        newPlayback = { ...newPlayback, currentIndex: 0, currentVideo: null, progress: 0, isPlaying: false };
      }
      set({ program: updated, playback: newPlayback });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateProgramItem: async (itemId, data) => {
    const state = get();
    const programId = state.program.id;
    try {
      const updated = await programAPI.updateItem(programId, itemId, data);
      set({ program: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setActiveProgram: async (programId: string) => {
    try {
      const updated = await programAPI.setActive(programId);
      set({ program: updated });
      const approvedItems = updated.items.filter(i => i.video.status === 'approved');
      const currentVideo = approvedItems[0]?.video || null;
      set((state) => ({
        playback: {
          ...state.playback,
          currentVideo,
          currentIndex: 0,
          loopMode: updated.loopMode,
        },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  likeVideo: async (videoId: string) => {
    try {
      const result = await interactionAPI.like(videoId);
      set((state) => ({
        videos: state.videos.map(v =>
          v.id === videoId ? { ...v, likeCount: result.likeCount } : v
        ),
        playback: state.playback.currentVideo?.id === videoId
          ? { ...state.playback, currentVideo: { ...state.playback.currentVideo, likeCount: result.likeCount } }
          : state.playback,
        statistics: { ...state.statistics, totalLikes: state.statistics.totalLikes + 1 },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  submitVote: async (optionId: string) => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.submitVote(state.vote.id, optionId);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  recordScan: async () => {
    try {
      await interactionAPI.recordScan({ type: 'qr', deviceId: 'device_001' });
      set((state) => ({
        statistics: { ...state.statistics, totalScans: state.statistics.totalScans + 1 },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  recordConsultation: async () => {
    try {
      await interactionAPI.recordConsultation({ type: 'phone', deviceId: 'device_001' });
      set((state) => ({
        statistics: { ...state.statistics, totalConsultations: state.statistics.totalConsultations + 1 },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchVote: async () => {
    try {
      const votes = await interactionAPI.votes.list();
      if (votes.length > 0) set({ vote: votes[0] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateVote: async (data) => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.update(state.vote.id, data);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addVoteOption: async (text: string) => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.addOption(state.vote.id, text);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateVoteOption: async (optionId: string, text: string) => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.updateOption(state.vote.id, optionId, text);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeVoteOption: async (optionId: string) => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.removeOption(state.vote.id, optionId);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  resetVote: async () => {
    const state = get();
    try {
      const updated = await interactionAPI.votes.reset(state.vote.id);
      set({ vote: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchEnrollmentConfig: async () => {
    try {
      const config = await interactionAPI.enrollment.get();
      if (config) set({ enrollmentConfig: config });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateEnrollmentConfig: async (data) => {
    try {
      const updated = await interactionAPI.enrollment.update(data);
      set({ enrollmentConfig: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchStatistics: async () => {
    try {
      const statistics = await statisticsAPI.getOverview();
      set({ statistics });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchReports: async () => {
    try {
      const reports = await reportAPI.list();
      set({ reports });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  generateReport: async (campusId, startDate, endDate) => {
    const newReport = await reportAPI.create({ campusId, startDate, endDate });
    set((state) => ({ reports: [...state.reports, newReport] }));
    return newReport;
  },
}));
