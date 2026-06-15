import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToVideo, generateId } from '../db/utils.js'
import type { PlaybackState, Video } from '../../shared/types.js'

const router = Router()
const db = getDb()

let playbackState: PlaybackState = {
  isPlaying: true,
  isMuted: false,
  currentIndex: 0,
  currentVideo: null,
  progress: 0,
  loopMode: 'list',
}

function getActiveProgram() {
  const programRow = db.prepare('SELECT * FROM program WHERE is_active = 1 LIMIT 1').get() as any
  if (!programRow) return null
  const itemRows = db.prepare(`
    SELECT pi.*, v.*, c.name as class_name 
    FROM program_item pi 
    LEFT JOIN video v ON pi.video_id = v.id 
    LEFT JOIN dance_class c ON v.class_id = c.id 
    WHERE pi.program_id = ? 
    ORDER BY pi.sort_order ASC
  `).all(programRow.id) as any[]
  return { program: programRow, items: itemRows.map(mapToVideo) }
}

function getCurrentVideo(): Video | null {
  const active = getActiveProgram()
  if (!active || active.items.length === 0) return null
  const index = playbackState.currentIndex % active.items.length
  return active.items[index] || null
}

function updatePlaybackState() {
  const video = getCurrentVideo()
  playbackState.currentVideo = video
  const active = getActiveProgram()
  if (active) {
    playbackState.loopMode = active.program.loop_mode
  }
}

function logPlay(videoId: string, programId: string) {
  const id = generateId('log')
  db.prepare(`
    INSERT INTO play_log (id, video_id, program_id, duration_played)
    VALUES (?, ?, ?, ?)
  `).run(id, videoId, programId, 0)
  db.prepare('UPDATE video SET play_count = play_count + 1 WHERE id = ?').run(videoId)
}

router.post('/next', async (req: Request, res: Response): Promise<void> => {
  try {
    const active = getActiveProgram()
    if (!active || active.items.length === 0) {
      res.json({ success: false, error: 'No active program or videos' })
      return
    }
    if (playbackState.currentVideo) {
      logPlay(playbackState.currentVideo.id, active.program.id)
    }
    if (playbackState.loopMode === 'random') {
      playbackState.currentIndex = Math.floor(Math.random() * active.items.length)
    } else {
      playbackState.currentIndex = (playbackState.currentIndex + 1) % active.items.length
    }
    playbackState.progress = 0
    updatePlaybackState()
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/prev', async (req: Request, res: Response): Promise<void> => {
  try {
    const active = getActiveProgram()
    if (!active || active.items.length === 0) {
      res.json({ success: false, error: 'No active program or videos' })
      return
    }
    playbackState.currentIndex = (playbackState.currentIndex - 1 + active.items.length) % active.items.length
    playbackState.progress = 0
    updatePlaybackState()
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/pause', async (req: Request, res: Response): Promise<void> => {
  try {
    playbackState.isPlaying = false
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    playbackState.isPlaying = true
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/skip', async (req: Request, res: Response): Promise<void> => {
  try {
    const active = getActiveProgram()
    if (!active || active.items.length === 0) {
      res.json({ success: false, error: 'No active program or videos' })
      return
    }
    if (playbackState.currentVideo) {
      const currentItem = db.prepare(`
        SELECT pi.* FROM program_item pi 
        WHERE pi.program_id = ? AND pi.video_id = ? 
        LIMIT 1
      `).get(active.program.id, playbackState.currentVideo.id) as any
      if (currentItem) {
        db.prepare('UPDATE program_item SET status = ?, played_at = CURRENT_TIMESTAMP WHERE id = ?').run('skipped', currentItem.id)
      }
    }
    playbackState.currentIndex = (playbackState.currentIndex + 1) % active.items.length
    playbackState.progress = 0
    updatePlaybackState()
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/insert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.body as { videoId: string }
    const videoRow = db.prepare('SELECT * FROM video WHERE id = ?').get(videoId) as any
    if (!videoRow) {
      res.json({ success: false, error: 'Video not found' })
      return
    }
    const video = mapToVideo(videoRow)
    playbackState.currentVideo = video
    playbackState.progress = 0
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/mute', async (req: Request, res: Response): Promise<void> => {
  try {
    playbackState.isMuted = !playbackState.isMuted
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/loop', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode } = req.body as { mode: 'single' | 'list' | 'random' }
    playbackState.loopMode = mode
    const active = getActiveProgram()
    if (active) {
      db.prepare('UPDATE program SET loop_mode = ? WHERE id = ?').run(mode, active.program.id)
    }
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/state', async (req: Request, res: Response): Promise<void> => {
  try {
    updatePlaybackState()
    res.json({ success: true, data: playbackState })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
