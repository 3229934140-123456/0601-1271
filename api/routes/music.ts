import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToMusic, generateId } from '../db/utils.js'
import type { Music } from '../../shared/types.js'

const router = Router()
const db = getDb()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare('SELECT * FROM music ORDER BY created_at DESC').all() as any[]
    const musicList = rows.map(mapToMusic)
    res.json({ success: true, data: musicList })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const row = db.prepare('SELECT * FROM music WHERE id = ?').get(id) as any
    if (!row) {
      res.json({ success: false, error: 'Music not found' })
      return
    }
    const music = mapToMusic(row)
    res.json({ success: true, data: music })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, artist, duration, url, volume } = req.body as Omit<Music, 'id'>
    const id = generateId('music')
    db.prepare(`
      INSERT INTO music (id, name, artist, duration, url, volume)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, artist || '', duration, url, volume || 1.0)
    const row = db.prepare('SELECT * FROM music WHERE id = ?').get(id) as any
    res.json({ success: true, data: mapToMusic(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, artist, duration, url, volume } = req.body as Omit<Music, 'id'>
    db.prepare(`
      UPDATE music 
      SET name = ?, artist = ?, duration = ?, url = ?, volume = ?
      WHERE id = ?
    `).run(name, artist || '', duration, url, volume || 1.0, id)
    const row = db.prepare('SELECT * FROM music WHERE id = ?').get(id) as any
    if (!row) {
      res.json({ success: false, error: 'Music not found' })
      return
    }
    res.json({ success: true, data: mapToMusic(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = db.prepare('DELETE FROM music WHERE id = ?').run(id)
    if (result.changes === 0) {
      res.json({ success: false, error: 'Music not found' })
      return
    }
    res.json({ success: true, data: { deleted: true } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
