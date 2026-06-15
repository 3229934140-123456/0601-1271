import type { Video, DanceClass, Program, ProgramItem, Device, Vote, VoteOption, EnrollmentConfig, CampusReport, Campus, Music } from '../../shared/types.js'

export function mapToVideo(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    classId: row.class_id,
    className: row.class_name || '',
    theme: row.theme || '',
    duration: row.duration,
    orientation: row.orientation,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    bgmId: row.bgm_id || undefined,
    status: row.status,
    portraitAuthorized: row.portrait_authorized === 1,
    playCount: row.play_count || 0,
    likeCount: row.like_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapToDanceClass(row: any): DanceClass {
  return {
    id: row.id,
    name: row.name,
    level: row.level || '',
    studentCount: row.student_count || 0,
    teacher: row.teacher || '',
    campusId: row.campus_id,
    campusName: row.campus_name || '',
  }
}

export function mapToProgram(row: any): Program {
  return {
    id: row.id,
    name: row.name,
    campusId: row.campus_id,
    items: [],
    loopMode: row.loop_mode,
    isActive: row.is_active === 1,
  }
}

export function mapToProgramItem(row: any): ProgramItem {
  return {
    id: row.id,
    videoId: row.video_id,
    video: {} as Video,
    sortOrder: row.sort_order,
    scheduledDuration: row.scheduled_duration || 0,
    status: row.status,
    playedAt: row.played_at || undefined,
  }
}

export function mapToDevice(row: any): Device {
  return {
    id: row.id,
    name: row.name,
    campusId: row.campus_id,
    isOnline: row.is_online === 1,
    lastActive: row.last_active,
    currentProgramId: row.current_program_id || undefined,
    ipAddress: row.ip_address || '',
  }
}

export function mapToVote(row: any): Vote {
  return {
    id: row.id,
    title: row.title,
    options: [],
    isActive: row.is_active === 1,
    endAt: row.end_at,
  }
}

export function mapToVoteOption(row: any): VoteOption {
  return {
    id: row.id,
    text: row.text,
    count: row.count || 0,
  }
}

export function mapToEnrollmentConfig(row: any): EnrollmentConfig {
  return {
    phone: row.phone || '',
    wechatQr: row.wechat_qr || '',
    description: row.description || '',
    buttonText: row.button_text || '立即咨询',
  }
}

export function mapToCampusReport(row: any): CampusReport {
  return {
    id: row.id,
    campusId: row.campus_id,
    campusName: row.campus_name,
    startDate: row.start_date,
    endDate: row.end_date,
    totalPlays: row.total_plays || 0,
    totalLikes: row.total_likes || 0,
    totalScans: row.total_scans || 0,
    popularVideos: [],
    generatedAt: row.generated_at,
  }
}

export function mapToCampus(row: any): Campus {
  return {
    id: row.id,
    name: row.name,
    address: row.address || '',
    phone: row.phone || '',
  }
}

export function mapToMusic(row: any): Music {
  return {
    id: row.id,
    name: row.name,
    artist: row.artist || '',
    duration: row.duration,
    url: row.url,
    volume: row.volume || 1.0,
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
