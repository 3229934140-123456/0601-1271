import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToVideo, generateId } from '../db/utils.js'
import type { Video } from '../../shared/types.js'

const router = Router()
const db = getDb()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, classId } = req.query
    let sql = `
      SELECT v.*, c.name as class_name 
      FROM video v 
      LEFT JOIN dance_class c ON v.class_id = c.id 
      WHERE 1=1
    `
    const params: string[] = []
    if (status) {
      sql += ' AND v.status = ?'
      params.push(status as string)
    }
    if (classId) {
      sql += ' AND v.class_id = ?'
      params.push(classId as string)
    }
    sql += ' ORDER BY v.created_at DESC'
    const rows = db.prepare(sql).all(...params) as any[]
    const videos = rows.map(mapToVideo)
    res.json({ success: true, data: videos })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const row = db.prepare(`
      SELECT v.*, c.name as class_name 
      FROM video v 
      LEFT JOIN dance_class c ON v.class_id = c.id 
      WHERE v.id = ?
    `).get(id) as any
    if (!row) {
      res.json({ success: false, error: 'Video not found' })
      return
    }
    const video = mapToVideo(row)
    res.json({ success: true, data: video })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, theme, orientation, coverUrl, videoUrl, bgmId } = req.body as Partial<Video>
    db.prepare(`
      UPDATE video 
      SET title = ?, theme = ?, orientation = ?, cover_url = ?, video_url = ?, bgm_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, theme, orientation, coverUrl, videoUrl, bgmId, id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    db.prepare('UPDATE video SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('approved', id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    db.prepare('UPDATE video SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('rejected', id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/block', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    db.prepare('UPDATE video SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('blocked', id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/unblock', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    db.prepare('UPDATE video SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('approved', id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/authorize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const current = db.prepare('SELECT portrait_authorized FROM video WHERE id = ?').get(id) as any
    const newValue = current.portrait_authorized === 1 ? 0 : 1
    db.prepare('UPDATE video SET portrait_authorized = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newValue, id)
    const row = db.prepare('SELECT * FROM video WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, classId, theme, duration, orientation, coverUrl, videoUrl, bgmId } = req.body as {
      title: string
      classId: string
      theme: string
      duration: number
      orientation: 'portrait' | 'landscape'
      coverUrl: string
      videoUrl: string
      bgmId?: string
    }
    const id = generateId('video')
    db.prepare(`
      INSERT INTO video (id, title, class_id, theme, duration, orientation, cover_url, video_url, bgm_id, status, portrait_authorized)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
    `).run(id, title, classId, theme, duration, orientation, coverUrl, videoUrl, bgmId || null)
    const row = db.prepare(`
      SELECT v.*, c.name as class_name 
      FROM video v 
      LEFT JOIN dance_class c ON v.class_id = c.id 
      WHERE v.id = ?
    `).get(id) as any
    res.json({ success: true, data: mapToVideo(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = db.prepare('DELETE FROM video WHERE id = ?').run(id)
    if (result.changes === 0) {
      res.json({ success: false, error: 'Video not found' })
      return
    }
    res.json({ success: true, data: { deleted: true } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
