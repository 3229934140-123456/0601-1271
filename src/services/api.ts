import axios from 'axios'
import type {
  Video,
  DanceClass,
  Music,
  Program,
  Vote,
  EnrollmentConfig,
  Device,
  Statistics,
  CampusReport,
  PlaybackState,
} from '../../shared/types'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => {
    const { success, data, error } = response.data
    if (success) {
      return data
    }
    throw new Error(error || 'Request failed')
  },
  (error) => {
    throw new Error(error.response?.data?.error || error.message)
  }
)

export const videoAPI = {
  list: (params?: { status?: string; classId?: string }) =>
    api.get<any, Video[]>('/videos', { params }),
  get: (id: string) =>
    api.get<any, Video>(`/videos/${id}`),
  create: (data: {
    title: string
    classId: string
    theme: string
    duration: number
    orientation: 'portrait' | 'landscape'
    coverUrl: string
    videoUrl: string
    bgmId?: string
  }) => api.post<any, Video>('/videos', data),
  update: (id: string, data: Partial<Video>) =>
    api.put<any, Video>(`/videos/${id}`, data),
  remove: (id: string) =>
    api.delete<any, { deleted: boolean }>(`/videos/${id}`),
  approve: (id: string) =>
    api.patch<any, Video>(`/videos/${id}/approve`),
  reject: (id: string) =>
    api.patch<any, Video>(`/videos/${id}/reject`),
  block: (id: string) =>
    api.patch<any, Video>(`/videos/${id}/block`),
  unblock: (id: string) =>
    api.patch<any, Video>(`/videos/${id}/unblock`),
  toggleAuthorize: (id: string) =>
    api.patch<any, Video>(`/videos/${id}/authorize`),
}

export const classAPI = {
  list: () => api.get<any, DanceClass[]>('/classes'),
  create: (data: Omit<DanceClass, 'id' | 'campusName'>) =>
    api.post<any, DanceClass>('/classes', data),
  update: (id: string, data: Partial<Omit<DanceClass, 'id' | 'campusName'>>) =>
    api.put<any, DanceClass>(`/classes/${id}`, data),
  remove: (id: string) =>
    api.delete<any, { deleted: boolean }>(`/classes/${id}`),
}

export const musicAPI = {
  list: () => api.get<any, Music[]>('/music'),
  get: (id: string) => api.get<any, Music>(`/music/${id}`),
  create: (data: Omit<Music, 'id'>) =>
    api.post<any, Music>('/music', data),
  update: (id: string, data: Omit<Music, 'id'>) =>
    api.put<any, Music>(`/music/${id}`, data),
  remove: (id: string) =>
    api.delete<any, { deleted: boolean }>(`/music/${id}`),
}

export const programAPI = {
  list: () => api.get<any, Program[]>('/programs'),
  getActive: () => api.get<any, Program | null>('/programs/active'),
  create: (data: Omit<Program, 'id' | 'items'>) =>
    api.post<any, Program>('/programs', data),
  update: (id: string, data: Partial<Omit<Program, 'id' | 'items'>>) =>
    api.put<any, Program>(`/programs/${id}`, data),
  updateItems: (id: string, items: { id: string; sortOrder: number }[]) =>
    api.put<any, Program>(`/programs/${id}/items`, { items }),
  addItem: (id: string, data: { videoId: string; scheduledDuration?: number }) =>
    api.post<any, Program>(`/programs/${id}/items`, data),
  addItems: (id: string, videoIds: string[]) =>
    api.post<any, Program>(`/programs/${id}/items/batch`, { videoIds }),
  removeItem: (id: string, itemId: string) =>
    api.delete<any, Program>(`/programs/${id}/items/${itemId}`),
  updateItem: (id: string, itemId: string, data: { scheduledDuration?: number }) =>
    api.put<any, Program>(`/programs/${id}/items/${itemId}`, data),
  setActive: (id: string) =>
    api.post<any, Program>(`/programs/${id}/activate`),
}

export const playbackAPI = {
  next: () => api.post<any, PlaybackState>('/playback/next'),
  prev: () => api.post<any, PlaybackState>('/playback/prev'),
  pause: () => api.post<any, PlaybackState>('/playback/pause'),
  resume: () => api.post<any, PlaybackState>('/playback/resume'),
  skip: () => api.post<any, PlaybackState>('/playback/skip'),
  insert: (videoId: string) =>
    api.post<any, PlaybackState>('/playback/insert', { videoId }),
  toggleMute: () => api.post<any, PlaybackState>('/playback/mute'),
  setLoopMode: (mode: 'single' | 'list' | 'random') =>
    api.post<any, PlaybackState>('/playback/loop', { mode }),
  getState: () => api.get<any, PlaybackState>('/playback/state'),
}

export const deviceAPI = {
  list: () => api.get<any, Device[]>('/devices'),
  heartbeat: (id: string, data?: { currentProgramId?: string; ipAddress?: string }) =>
    api.patch<any, Device>(`/devices/${id}/heartbeat`, data),
}

export const statisticsAPI = {
  getOverview: () => api.get<any, Statistics>('/statistics/overview'),
  getCampusStats: (id: string) =>
    api.get<any, any>(`/statistics/campus/${id}`),
}

export const interactionAPI = {
  votes: {
    list: () => api.get<any, Vote[]>('/votes'),
    create: (data: { title: string; options: string[]; isActive?: boolean; endAt?: string }) =>
      api.post<any, Vote>('/votes', data),
    update: (id: string, data: { title?: string; endAt?: string; isActive?: boolean }) =>
      api.put<any, Vote>(`/votes/${id}`, data),
    addOption: (id: string, text: string) =>
      api.post<any, Vote>(`/votes/${id}/options`, { text }),
    updateOption: (id: string, optionId: string, text: string) =>
      api.put<any, Vote>(`/votes/${id}/options/${optionId}`, { text }),
    removeOption: (id: string, optionId: string) =>
      api.delete<any, Vote>(`/votes/${id}/options/${optionId}`),
    reset: (id: string) =>
      api.post<any, Vote>(`/votes/${id}/reset`),
    submitVote: (id: string, optionId: string) =>
      api.post<any, Vote>(`/votes/${id}/vote`, { optionId }),
  },
  enrollment: {
    get: () => api.get<any, EnrollmentConfig | null>('/enrollment'),
    update: (data: EnrollmentConfig) =>
      api.put<any, EnrollmentConfig>('/enrollment', data),
  },
  like: (videoId: string, deviceId?: string) =>
    api.post<any, { likeCount: number }>('/like', { videoId, deviceId }),
  recordScan: (data: { type: string; videoId?: string; deviceId?: string }) =>
    api.post<any, { scanned: boolean }>('/scan', data),
  recordConsultation: (data: { type: string; videoId?: string; deviceId?: string }) =>
    api.post<any, { recorded: boolean }>('/consultation', data),
}

export const reportAPI = {
  list: () => api.get<any, CampusReport[]>('/reports'),
  create: (data: { campusId: string; startDate: string; endDate: string }) =>
    api.post<any, CampusReport>('/reports', data),
  getDetail: (id: string) => api.get<any, CampusReport>(`/reports/${id}`),
}

export default api
