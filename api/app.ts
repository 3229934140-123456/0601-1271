/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import videoRoutes from './routes/videos.js'
import classRoutes from './routes/classes.js'
import musicRoutes from './routes/music.js'
import programRoutes from './routes/programs.js'
import playbackRoutes from './routes/playback.js'
import deviceRoutes from './routes/devices.js'
import statisticsRoutes from './routes/statistics.js'
import interactionRoutes from './routes/interaction.js'
import reportRoutes from './routes/reports.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/music', musicRoutes)
app.use('/api/programs', programRoutes)
app.use('/api/playback', playbackRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api', interactionRoutes)
app.use('/api/reports', reportRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
