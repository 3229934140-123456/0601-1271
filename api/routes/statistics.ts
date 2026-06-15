import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import type { Statistics } from '../../shared/types.js'

const router = Router()
const db = getDb()

router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalPlays = db.prepare('SELECT COALESCE(SUM(play_count), 0) as total FROM video').get() as { total: number }
    const todayPlays = db.prepare(`
      SELECT COUNT(*) as total FROM play_log 
      WHERE DATE(created_at) = DATE('now')
    `).get() as { total: number }
    const totalScans = db.prepare('SELECT COUNT(*) as total FROM scan_log').get() as { total: number }
    const totalConsultations = db.prepare('SELECT COUNT(*) as total FROM consultation_log').get() as { total: number }
    const totalLikes = db.prepare('SELECT COALESCE(SUM(like_count), 0) as total FROM video').get() as { total: number }
    const topVideos = db.prepare(`
      SELECT v.id, v.title, v.play_count 
      FROM video v 
      WHERE v.status = 'approved'
      ORDER BY v.play_count DESC 
      LIMIT 10
    `).all() as { videoId: string; title: string; playCount: number }[]
    const onlineCount = db.prepare('SELECT COUNT(*) as total FROM device WHERE is_online = 1').get() as { total: number }
    const offlineCount = db.prepare('SELECT COUNT(*) as total FROM device WHERE is_online = 0').get() as { total: number }
    const stats: Statistics = {
      totalPlays: totalPlays.total,
      todayPlays: todayPlays.total,
      totalScans: totalScans.total,
      totalConsultations: totalConsultations.total,
      totalLikes: totalLikes.total,
      topVideos: topVideos.map((v: any) => ({
        videoId: v.id,
        title: v.title,
        playCount: v.play_count,
      })),
      deviceStatus: {
        online: onlineCount.total,
        offline: offlineCount.total,
      },
    }
    res.json({ success: true, data: stats })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/campus/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const campus = db.prepare('SELECT * FROM campus WHERE id = ?').get(id) as any
    if (!campus) {
      res.json({ success: false, error: 'Campus not found' })
      return
    }
    const totalPlays = db.prepare(`
      SELECT COALESCE(SUM(v.play_count), 0) as total 
      FROM video v
      LEFT JOIN dance_class dc ON v.class_id = dc.id
      WHERE dc.campus_id = ?
    `).get(id) as { total: number }
    const todayPlays = db.prepare(`
      SELECT COUNT(*) as total FROM play_log pl
      LEFT JOIN program p ON pl.program_id = p.id
      WHERE p.campus_id = ? AND DATE(pl.created_at) = DATE('now')
    `).get(id) as { total: number }
    const totalScans = db.prepare(`
      SELECT COUNT(*) as total FROM scan_log sl
      LEFT JOIN device d ON sl.device_id = d.id
      WHERE d.campus_id = ?
    `).get(id) as { total: number }
    const totalLikes = db.prepare(`
      SELECT COALESCE(SUM(v.like_count), 0) as total 
      FROM video v
      LEFT JOIN dance_class dc ON v.class_id = dc.id
      WHERE dc.campus_id = ?
    `).get(id) as { total: number }
    const topVideos = db.prepare(`
      SELECT v.id, v.title, v.play_count 
      FROM video v
      LEFT JOIN dance_class dc ON v.class_id = dc.id
      WHERE dc.campus_id = ? AND v.status = 'approved'
      ORDER BY v.play_count DESC 
      LIMIT 10
    `).all(id) as any[]
    const onlineCount = db.prepare('SELECT COUNT(*) as total FROM device WHERE campus_id = ? AND is_online = 1').get(id) as { total: number }
    const offlineCount = db.prepare('SELECT COUNT(*) as total FROM device WHERE campus_id = ? AND is_online = 0').get(id) as { total: number }
    const stats = {
      campusId: id,
      campusName: campus.name,
      totalPlays: totalPlays.total,
      todayPlays: todayPlays.total,
      totalScans: totalScans.total,
      totalLikes: totalLikes.total,
      topVideos: topVideos.map((v: any) => ({
        videoId: v.id,
        title: v.title,
        playCount: v.play_count,
      })),
      deviceStatus: {
        online: onlineCount.total,
        offline: offlineCount.total,
      },
    }
    res.json({ success: true, data: stats })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
