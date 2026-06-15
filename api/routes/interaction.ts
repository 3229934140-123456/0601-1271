import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { mapToVote, mapToVoteOption, mapToEnrollmentConfig, generateId } from '../db/utils.js'
import type { Vote, EnrollmentConfig } from '../../shared/types.js'

const router = Router()
const db = getDb()

function getVoteWithOptions(voteId: string) {
  const voteRow = db.prepare('SELECT * FROM vote WHERE id = ?').get(voteId) as any
  if (!voteRow) return null
  const vote = mapToVote(voteRow)
  const optionRows = db.prepare('SELECT * FROM vote_option WHERE vote_id = ? ORDER BY id ASC').all(voteId) as any[]
  vote.options = optionRows.map(mapToVoteOption)
  return vote
}

router.get('/votes', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db.prepare('SELECT * FROM vote ORDER BY created_at DESC').all() as any[]
    const votes = rows.map((row: any) => getVoteWithOptions(row.id)).filter(Boolean)
    res.json({ success: true, data: votes })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/votes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, options, isActive, endAt } = req.body as { title: string; options: string[]; isActive?: boolean; endAt?: string }
    const id = generateId('vote')
    db.prepare(`
      INSERT INTO vote (id, title, is_active, end_at)
      VALUES (?, ?, ?, ?)
    `).run(id, title, isActive ? 1 : 0, endAt || null)
    const insertOption = db.prepare('INSERT INTO vote_option (id, vote_id, text) VALUES (?, ?, ?)')
    const transaction = db.transaction(() => {
      options.forEach((text) => {
        const optId = generateId('opt')
        insertOption.run(optId, id, text)
      })
    })
    transaction()
    const vote = getVoteWithOptions(id)
    res.json({ success: true, data: vote })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/votes/:id/vote', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { optionId } = req.body as { optionId: string }
    const vote = db.prepare('SELECT * FROM vote WHERE id = ? AND is_active = 1').get(id) as any
    if (!vote) {
      res.json({ success: false, error: 'Vote not found or not active' })
      return
    }
    const option = db.prepare('SELECT * FROM vote_option WHERE id = ? AND vote_id = ?').get(optionId, id) as any
    if (!option) {
      res.json({ success: false, error: 'Option not found' })
      return
    }
    db.prepare('UPDATE vote_option SET count = count + 1 WHERE id = ?').run(optionId)
    const updatedVote = getVoteWithOptions(id)
    res.json({ success: true, data: updatedVote })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.get('/enrollment', async (req: Request, res: Response): Promise<void> => {
  try {
    const row = db.prepare('SELECT * FROM enrollment_config ORDER BY updated_at DESC LIMIT 1').get() as any
    if (!row) {
      res.json({ success: true, data: null })
      return
    }
    const config = mapToEnrollmentConfig(row)
    res.json({ success: true, data: config })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.put('/enrollment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, wechatQr, description, buttonText } = req.body as EnrollmentConfig
    const existing = db.prepare('SELECT * FROM enrollment_config LIMIT 1').get() as any
    if (existing) {
      db.prepare(`
        UPDATE enrollment_config 
        SET phone = ?, wechat_qr = ?, description = ?, button_text = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(phone, wechatQr, description, buttonText, existing.id)
    } else {
      const id = generateId('config')
      db.prepare(`
        INSERT INTO enrollment_config (id, phone, wechat_qr, description, button_text)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, phone, wechatQr, description, buttonText)
    }
    const row = db.prepare('SELECT * FROM enrollment_config ORDER BY updated_at DESC LIMIT 1').get() as any
    res.json({ success: true, data: mapToEnrollmentConfig(row) })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId, deviceId } = req.body as { videoId: string; deviceId?: string }
    const video = db.prepare('SELECT * FROM video WHERE id = ?').get(videoId) as any
    if (!video) {
      res.json({ success: false, error: 'Video not found' })
      return
    }
    const id = generateId('like')
    db.prepare(`
      INSERT INTO like_log (id, video_id, device_id)
      VALUES (?, ?, ?)
    `).run(id, videoId, deviceId || null)
    db.prepare('UPDATE video SET like_count = like_count + 1 WHERE id = ?').run(videoId)
    const updated = db.prepare('SELECT * FROM video WHERE id = ?').get(videoId) as any
    res.json({ success: true, data: { likeCount: updated.like_count } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/scan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, videoId, deviceId } = req.body as { type: string; videoId?: string; deviceId?: string }
    const id = generateId('scan')
    db.prepare(`
      INSERT INTO scan_log (id, type, video_id, device_id)
      VALUES (?, ?, ?, ?)
    `).run(id, type, videoId || null, deviceId || null)
    res.json({ success: true, data: { scanned: true } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

router.post('/consultation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, videoId, deviceId } = req.body as { type: string; videoId?: string; deviceId?: string }
    const id = generateId('consult')
    db.prepare(`
      INSERT INTO consultation_log (id, type, video_id, device_id)
      VALUES (?, ?, ?, ?)
    `).run(id, type, videoId || null, deviceId || null)
    res.json({ success: true, data: { recorded: true } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

export default router
