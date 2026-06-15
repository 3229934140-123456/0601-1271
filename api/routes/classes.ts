import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToDanceClass, generateId } from '../db/utils.js'
import type { DanceClass } from '../../shared/types.js'

const router = Router()
const db = getDb()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare(`
      SELECT dc.*, c.name as campus_name 
      FROM dance_class dc 
      LEFT JOIN campus c ON dc.campus_id = c.id 
      ORDER BY dc.created_at DESC
    `).all() as any[]
    const classes = rows.map(mapToDanceClass)
    res.json({ success: true, data: classes })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, level, studentCount, teacher, campusId } = req.body as Omit<DanceClass, 'id' | 'campusName'>
    const id = generateId('class')
    db.prepare(`
      INSERT INTO dance_class (id, name, level, student_count, teacher, campus_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, level, studentCount || 0, teacher, campusId)
    const row = db.prepare(`
      SELECT dc.*, c.name as campus_name 
      FROM dance_class dc 
      LEFT JOIN campus c ON dc.campus_id = c.id 
      WHERE dc.id = ?
    `).get(id) as any
    res.json({ success: true, data: mapToDanceClass(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = db.prepare('SELECT * FROM dance_class WHERE id = ?').get(id) as any
    if (!existing) {
      res.json({ success: false, error: 'Class not found' })
      return
    }
    const { name = existing.name, level = existing.level, studentCount = existing.student_count, teacher = existing.teacher, campusId = existing.campus_id } = req.body as any
    db.prepare(`
      UPDATE dance_class 
      SET name = ?, level = ?, student_count = ?, teacher = ?, campus_id = ?
      WHERE id = ?
    `).run(name, level, studentCount || 0, teacher, campusId, id)
    const row = db.prepare(`
      SELECT dc.*, c.name as campus_name 
      FROM dance_class dc 
      LEFT JOIN campus c ON dc.campus_id = c.id 
      WHERE dc.id = ?
    `).get(id) as any
    res.json({ success: true, data: mapToDanceClass(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = db.prepare('DELETE FROM dance_class WHERE id = ?').run(id)
    if (result.changes === 0) {
      res.json({ success: false, error: 'Class not found' })
      return
    }
    res.json({ success: true, data: { deleted: true } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
