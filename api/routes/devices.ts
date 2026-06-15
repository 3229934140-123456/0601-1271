import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToDevice } from '../db/utils.js'

const router = Router()
const db = getDb()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare(`
      SELECT d.*, c.name as campus_name 
      FROM device d 
      LEFT JOIN campus c ON d.campus_id = c.id 
      ORDER BY d.created_at DESC
    `).all() as any[]
    const devices = rows.map(mapToDevice)
    res.json({ success: true, data: devices })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.patch('/:id/heartbeat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { currentProgramId, ipAddress } = req.body as { currentProgramId?: string; ipAddress?: string }
    const existing = db.prepare('SELECT * FROM device WHERE id = ?').get(id) as any
    if (!existing) {
      res.json({ success: false, error: 'Device not found' })
      return
    }
    db.prepare(`
      UPDATE device 
      SET is_online = 1, last_active = datetime('now'), current_program_id = ?, ip_address = ?
      WHERE id = ?
    `).run(currentProgramId || existing.current_program_id, ipAddress || existing.ip_address, id)
    const row = db.prepare('SELECT * FROM device WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToDevice(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
