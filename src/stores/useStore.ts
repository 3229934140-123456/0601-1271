import { create } from 'zustand';
import type { Video, DanceClass, Music, Program, Vote, EnrollmentConfig, Device, Statistics, CampusReport, User, PlaybackState } from '../../shared/types';
import { mockVideos, mockClasses, mockMusic, mockProgram, mockVote, mockEnrollmentConfig, mockDevices, mockStatistics, mockReports, mockUser } from '../data/mockData';

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
  
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  togglePlay: () => void;
  toggleMute: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  skipVideo: () => void;
  setLoopMode: (mode: 'single' | 'list' | 'random') => void;
  insertVideo: (videoId: string) => void;
  updateProgress: (progress: number) => void;
  
  approveVideo: (videoId: string) => void;
  rejectVideo: (videoId: string) => void;
  blockVideo: (videoId: string) => void;
  unblockVideo: (videoId: string) => void;
  togglePortraitAuth: (videoId: string) => void;
  
  likeVideo: (videoId: string) => void;
  submitVote: (optionId: string) => void;
  recordScan: () => void;
  recordConsultation: () => void;
  
  updateProgramItemOrder: (items: { id: string; sortOrder: number }[]) => void;
  addVideoToProgram: (videoId: string) => void;
  removeFromProgram: (itemId: string) => void;
  
  createClass: (name: string, level: string, teacher: string, studentCount: number) => void;
  updateClass: (id: string, data: Partial<DanceClass>) => void;
  deleteClass: (id: string) => void;
  
  generateReport: (campusId: string, startDate: string, endDate: string) => CampusReport;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  videos: mockVideos,
  classes: mockClasses,
  music: mockMusic,
  program: mockProgram,
  vote: mockVote,
  enrollmentConfig: mockEnrollmentConfig,
  devices: mockDevices,
  statistics: mockStatistics,
  reports: mockReports,
  playback: {
    isPlaying: true,
    isMuted: false,
    currentIndex: 2,
    currentVideo: mockProgram.items[2]?.video || null,
    progress: 0.35,
    loopMode: 'list',
  },
  isLoggedIn: false,

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

  togglePlay: () => set((state) => ({
    playback: { ...state.playback, isPlaying: !state.playback.isPlaying }
  })),
  
  toggleMute: () => set((state) => ({
    playback: { ...state.playback, isMuted: !state.playback.isMuted }
  })),
  
  nextVideo: () => set((state) => {
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
    
    return {
      playback: {
        ...state.playback,
        currentIndex: nextIdx,
        currentVideo: items[nextIdx]?.video || null,
        progress: 0,
        isPlaying: true,
      },
      program: { ...state.program, items: updatedItems },
    };
  }),
  
  prevVideo: () => set((state) => {
    const items = state.program.items.filter(i => i.video.status === 'approved');
    const currentIdx = state.playback.currentIndex;
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
    
    const updatedItems = state.program.items.map((item, idx) => {
      const status = idx === prevIdx ? 'playing' as const : idx < prevIdx ? 'played' as const : 'pending' as const;
      return { ...item, status };
    });
    
    return {
      playback: {
        ...state.playback,
        currentIndex: prevIdx,
        currentVideo: items[prevIdx]?.video || null,
        progress: 0,
        isPlaying: true,
      },
      program: { ...state.program, items: updatedItems },
    };
  }),
  
  skipVideo: () => {
    get().nextVideo();
  },
  
  setLoopMode: (mode: 'single' | 'list' | 'random') => set((state) => ({
    playback: { ...state.playback, loopMode: mode },
    program: { ...state.program, loopMode: mode },
  })),
  
  insertVideo: (videoId: string) => set((state) => {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) return state;
    
    const newItem = {
      id: `item_${Date.now()}`,
      videoId,
      video,
      sortOrder: state.playback.currentIndex + 0.5,
      scheduledDuration: video.duration,
      status: 'pending' as const,
    };
    
    const items = [...state.program.items, newItem].sort((a, b) => a.sortOrder - b.sortOrder);
    
    return {
      program: { ...state.program, items },
    };
  }),
  
  updateProgress: (progress: number) => set((state) => ({
    playback: { ...state.playback, progress },
  })),

  approveVideo: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, status: 'approved' as const, updatedAt: new Date().toISOString() } : v
    ),
  })),
  
  rejectVideo: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, status: 'rejected' as const, updatedAt: new Date().toISOString() } : v
    ),
  })),
  
  blockVideo: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, status: 'blocked' as const, updatedAt: new Date().toISOString() } : v
    ),
  })),
  
  unblockVideo: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, status: 'approved' as const, updatedAt: new Date().toISOString() } : v
    ),
  })),
  
  togglePortraitAuth: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, portraitAuthorized: !v.portraitAuthorized, updatedAt: new Date().toISOString() } : v
    ),
  })),

  likeVideo: (videoId: string) => set((state) => ({
    videos: state.videos.map(v => 
      v.id === videoId ? { ...v, likeCount: v.likeCount + 1 } : v
    ),
    playback: state.playback.currentVideo?.id === videoId
      ? { ...state.playback, currentVideo: { ...state.playback.currentVideo, likeCount: state.playback.currentVideo.likeCount + 1 } }
      : state.playback,
    statistics: { ...state.statistics, totalLikes: state.statistics.totalLikes + 1 },
  })),
  
  submitVote: (optionId: string) => set((state) => ({
    vote: {
      ...state.vote,
      options: state.vote.options.map(o => 
        o.id === optionId ? { ...o, count: o.count + 1 } : o
      ),
    },
  })),
  
  recordScan: () => set((state) => ({
    statistics: { ...state.statistics, totalScans: state.statistics.totalScans + 1 },
  })),
  
  recordConsultation: () => set((state) => ({
    statistics: { ...state.statistics, totalConsultations: state.statistics.totalConsultations + 1 },
  })),

  updateProgramItemOrder: (items: { id: string; sortOrder: number }[]) => set((state) => ({
    program: {
      ...state.program,
      items: state.program.items.map(item => {
        const updated = items.find(i => i.id === item.id);
        return updated ? { ...item, sortOrder: updated.sortOrder } : item;
      }).sort((a, b) => a.sortOrder - b.sortOrder),
    },
  })),
  
  addVideoToProgram: (videoId: string) => set((state) => {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) return state;
    
    const newItem = {
      id: `item_${Date.now()}`,
      videoId,
      video,
      sortOrder: state.program.items.length,
      scheduledDuration: video.duration,
      status: 'pending' as const,
    };
    
    return {
      program: { ...state.program, items: [...state.program.items, newItem] },
    };
  }),
  
  removeFromProgram: (itemId: string) => set((state) => ({
    program: {
      ...state.program,
      items: state.program.items.filter(i => i.id !== itemId),
    },
  })),

  createClass: (name: string, level: string, teacher: string, studentCount: number) => set((state) => {
    const newClass: DanceClass = {
      id: `class_${Date.now()}`,
      name,
      level,
      teacher,
      studentCount,
      campusId: 'campus_001',
      campusName: '朝阳校区',
    };
    return { classes: [...state.classes, newClass] };
  }),
  
  updateClass: (id: string, data: Partial<DanceClass>) => set((state) => ({
    classes: state.classes.map(c => c.id === id ? { ...c, ...data } : c),
  })),
  
  deleteClass: (id: string) => set((state) => ({
    classes: state.classes.filter(c => c.id !== id),
  })),

  generateReport: (campusId: string, startDate: string, endDate: string) => {
    const campus = campusId === 'campus_001' ? '朝阳校区' : '海淀校区';
    const approvedVideos = get().videos.filter(v => v.status === 'approved');
    const popularVideos = [...approvedVideos].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
    
    const newReport: CampusReport = {
      id: `report_${Date.now()}`,
      campusId,
      campusName: campus,
      startDate,
      endDate,
      totalPlays: approvedVideos.reduce((sum, v) => sum + v.playCount, 0),
      totalLikes: approvedVideos.reduce((sum, v) => sum + v.likeCount, 0),
      totalScans: Math.floor(Math.random() * 200) + 100,
      popularVideos,
      generatedAt: new Date().toISOString(),
    };
    
    set((state) => ({ reports: [...state.reports, newReport] }));
    return newReport;
  },
}));
