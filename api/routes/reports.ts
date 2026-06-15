import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToCampusReport, mapToVideo, generateId } from '../db/utils.js'

const router = Router()
const db = getDb()

function getReportWithVideos(reportId: string) {
  const reportRow = db.prepare('SELECT * FROM report WHERE id = ?').get(reportId) as any
  if (!reportRow) return null
  const report = mapToCampusReport(reportRow)
  const videoRows = db.prepare(`
    SELECT v.*, c.name as class_name 
    FROM video v
    LEFT JOIN dance_class dc ON v.class_id = dc.id
    LEFT JOIN campus ca ON dc.campus_id = ca.id
    LEFT JOIN play_log pl ON v.id = pl.video_id
    WHERE ca.id = ? AND pl.created_at BETWEEN ? AND ?
    GROUP BY v.id
    ORDER BY COUNT(pl.id) DESC
    LIMIT 10
  `).all(report.campusId, report.startDate, report.endDate) as any[]
  report.popularVideos = videoRows.map(mapToVideo)
  return report
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare('SELECT * FROM report ORDER BY generated_at DESC').all() as any[]
    const reports = rows.map((row: any) => getReportWithVideos(row.id)).filter(Boolean)
    res.json({ success: true, data: reports })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { campusId, startDate, endDate } = req.body as { campusId: string; startDate: string; endDate: string }
    const campus = db.prepare('SELECT * FROM campus WHERE id = ?').get(campusId) as any
    if (!campus) {
      res.json({ success: false, error: 'Campus not found' })
      return
    }
    const totalPlays = db.prepare(`
      SELECT COUNT(*) as total FROM play_log pl
      LEFT JOIN program p ON pl.program_id = p.id
      WHERE p.campus_id = ? AND pl.created_at BETWEEN ? AND ?
    `).get(campusId, startDate, endDate) as { total: number }
    const totalLikes = db.prepare(`
      SELECT COUNT(*) as total FROM like_log ll
      LEFT JOIN video v ON ll.video_id = v.id
      LEFT JOIN dance_class dc ON v.class_id = dc.id
      WHERE dc.campus_id = ? AND ll.created_at BETWEEN ? AND ?
    `).get(campusId, startDate, endDate) as { total: number }
    const totalScans = db.prepare(`
      SELECT COUNT(*) as total FROM scan_log sl
      LEFT JOIN device d ON sl.device_id = d.id
      WHERE d.campus_id = ? AND sl.created_at BETWEEN ? AND ?
    `).get(campusId, startDate, endDate) as { total: number }
    const id = generateId('report')
    db.prepare(`
      INSERT INTO report (id, campus_id, campus_name, start_date, end_date, total_plays, total_likes, total_scans)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, campusId, campus.name, startDate, endDate, totalPlays.total, totalLikes.total, totalScans.total)
    const report = getReportWithVideos(id)
    res.json({ success: true, data: report })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const report = getReportWithVideos(id)
    if (!report) {
      res.json({ success: false, error: 'Report not found' })
      return
    }
    res.json({ success: true, data: report })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
