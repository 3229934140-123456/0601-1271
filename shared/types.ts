export interface Video {
  id: string;
  title: string;
  classId: string;
  className: string;
  theme: string;
  duration: number;
  orientation: 'portrait' | 'landscape';
  coverUrl: string;
  videoUrl: string;
  bgmId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  portraitAuthorized: boolean;
  playCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DanceClass {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  teacher: string;
  campusId: string;
  campusName: string;
}

export interface Music {
  id: string;
  name: string;
  artist: string;
  duration: number;
  url: string;
  volume: number;
}

export interface ProgramItem {
  id: string;
  videoId: string;
  video: Video;
  sortOrder: number;
  scheduledDuration: number;
  status: 'pending' | 'playing' | 'played' | 'skipped';
  playedAt?: string;
}

export interface Program {
  id: string;
  name: string;
  campusId: string;
  items: ProgramItem[];
  loopMode: 'single' | 'list' | 'random';
  isActive: boolean;
}

export interface Vote {
  id: string;
  title: string;
  options: VoteOption[];
  isActive: boolean;
  endAt: string;
}

export interface VoteOption {
  id: string;
  text: string;
  count: number;
}

export interface EnrollmentConfig {
  phone: string;
  wechatQr: string;
  description: string;
  buttonText: string;
}

export interface Device {
  id: string;
  name: string;
  campusId: string;
  isOnline: boolean;
  lastActive: string;
  currentProgramId?: string;
  ipAddress: string;
}

export interface Statistics {
  totalPlays: number;
  todayPlays: number;
  totalScans: number;
  totalConsultations: number;
  totalLikes: number;
  topVideos: { videoId: string; title: string; playCount: number }[];
  deviceStatus: { online: number; offline: number };
}

export interface CampusReport {
  id: string;
  campusId: string;
  campusName: string;
  startDate: string;
  endDate: string;
  totalPlays: number;
  totalLikes: number;
  totalScans: number;
  popularVideos: Video[];
  generatedAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
  name: string;
  campusId: string;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isMuted: boolean;
  currentIndex: number;
  currentVideo: Video | null;
  progress: number;
  loopMode: 'single' | 'list' | 'random';
}
