import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToProgram, mapToProgramItem, mapToVideo, generateId } from '../db/utils.js'
import type { Program } from '../../shared/types.js'

const router = Router()
const db = getDb()

function getProgramWithItems(programId: string) {
  const programRow = db.prepare('SELECT * FROM program WHERE id = ?').get(programId) as any
  if (!programRow) return null
  const program = mapToProgram(programRow)
  const itemRows = db.prepare(`
    SELECT pi.*, v.*, c.name as class_name 
    FROM program_item pi 
    LEFT JOIN video v ON pi.video_id = v.id 
    LEFT JOIN dance_class c ON v.class_id = c.id 
    WHERE pi.program_id = ? 
    ORDER BY pi.sort_order ASC
  `).all(programId) as any[]
  program.items = itemRows.map((row: any) => {
    const item = mapToProgramItem(row)
    item.video = mapToVideo(row)
    return item
  })
  return program
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare('SELECT * FROM program ORDER BY created_at DESC').all() as any[]
    const programs = rows.map((row: any) => getProgramWithItems(row.id)).filter(Boolean)
    res.json({ success: true, data: programs })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const row = db.prepare('SELECT * FROM program WHERE is_active = 1 LIMIT 1').get() as any
    if (!row) {
      res.json({ success: true, data: null })
      return
    }
    const program = getProgramWithItems(row.id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, campusId, loopMode, isActive } = req.body as Omit<Program, 'id' | 'items'>
    const id = generateId('program')
    if (isActive) {
      db.prepare('UPDATE program SET is_active = 0 WHERE is_active = 1').run()
    }
    db.prepare(`
      INSERT INTO program (id, name, campus_id, loop_mode, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, campusId, loopMode || 'list', isActive ? 1 : 0)
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = db.prepare('SELECT * FROM program WHERE id = ?').get(id) as any
    if (!existing) {
      res.json({ success: false, error: 'Program not found' })
      return
    }
    const { name, campusId, loopMode, isActive } = req.body as any
    const newName = name ?? existing.name
    const newCampusId = campusId ?? existing.campus_id
    const newLoopMode = loopMode ?? existing.loop_mode
    const newIsActive = isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active
    if (newIsActive) {
      db.prepare('UPDATE program SET is_active = 0 WHERE is_active = 1 AND id != ?').run(id)
    }
    db.prepare(`
      UPDATE program 
      SET name = ?, campus_id = ?, loop_mode = ?, is_active = ?
      WHERE id = ?
    `).run(newName, newCampusId, newLoopMode, newIsActive, id)
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { items } = req.body as { items: { id: string; sortOrder: number }[] }
    const updateStmt = db.prepare('UPDATE program_item SET sort_order = ? WHERE id = ? AND program_id = ?')
    const transaction = db.transaction(() => {
      items.forEach((item) => {
        updateStmt.run(item.sortOrder, item.id, id)
      })
    })
    transaction()
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/:id/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { videoId, scheduledDuration } = req.body as { videoId: string; scheduledDuration?: number }
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max FROM program_item WHERE program_id = ?').get(id) as { max: number }
    const itemId = generateId('item')
    db.prepare(`
      INSERT INTO program_item (id, program_id, video_id, sort_order, scheduled_duration)
      VALUES (?, ?, ?, ?, ?)
    `).run(itemId, id, videoId, maxOrder.max + 1, scheduledDuration || 0)
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.delete('/:id/items/:itemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, itemId } = req.params
    const result = db.prepare('DELETE FROM program_item WHERE id = ? AND program_id = ?').run(itemId, id)
    if (result.changes === 0) {
      res.json({ success: false, error: 'Program item not found' })
      return
    }
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id/items/:itemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, itemId } = req.params
    const { scheduledDuration } = req.body as { scheduledDuration?: number }
    const item = db.prepare('SELECT * FROM program_item WHERE id = ? AND program_id = ?').get(itemId, id) as any
    if (!item) {
      res.json({ success: false, error: 'Program item not found' })
      return
    }
    db.prepare(`
      UPDATE program_item 
      SET scheduled_duration = COALESCE(?, scheduled_duration)
      WHERE id = ? AND program_id = ?
    `).run(scheduledDuration !== undefined ? scheduledDuration : null, itemId, id)
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/:id/items/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { videoIds } = req.body as { videoIds: string[] }
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max FROM program_item WHERE program_id = ?').get(id) as { max: number }
    const insertStmt = db.prepare(`
      INSERT INTO program_item (id, program_id, video_id, sort_order, scheduled_duration)
      VALUES (?, ?, ?, ?, ?)
    `)
    const transaction = db.transaction(() => {
      videoIds.forEach((videoId, index) => {
        const itemId = generateId('item')
        const video = db.prepare('SELECT duration FROM video WHERE id = ?').get(videoId) as any
        insertStmt.run(itemId, id, videoId, maxOrder.max + index + 1, video?.duration || 0)
      })
    })
    transaction()
    const program = getProgramWithItems(id)
    res.json({ success: true, data: program })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/:id/activate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const program = db.prepare('SELECT * FROM program WHERE id = ?').get(id) as any
    if (!program) {
      res.json({ success: false, error: 'Program not found' })
      return
    }
    db.prepare('UPDATE program SET is_active = 0 WHERE is_active = 1').run()
    db.prepare('UPDATE program SET is_active = 1 WHERE id = ?').run(id)
    const activatedProgram = getProgramWithItems(id)
    res.json({ success: true, data: activatedProgram })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
