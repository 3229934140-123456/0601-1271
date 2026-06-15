import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../../data')
const dbPath = path.join(dataDir, 'dance_studio.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const createTables = `
CREATE TABLE IF NOT EXISTS campus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  name TEXT NOT NULL,
  campus_id TEXT REFERENCES campus(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dance_class (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT,
  student_count INTEGER DEFAULT 0,
  teacher TEXT,
  campus_id TEXT REFERENCES campus(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT,
  duration INTEGER NOT NULL,
  url TEXT NOT NULL,
  volume REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  class_id TEXT REFERENCES dance_class(id),
  theme TEXT,
  duration INTEGER NOT NULL,
  orientation TEXT NOT NULL CHECK (orientation IN ('portrait', 'landscape')),
  cover_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  bgm_id TEXT REFERENCES music(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  portrait_authorized INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  uploaded_by TEXT REFERENCES user(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS program (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campus_id TEXT REFERENCES campus(id),
  loop_mode TEXT NOT NULL DEFAULT 'list' CHECK (loop_mode IN ('single', 'list', 'random')),
  is_active INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS program_item (
  id TEXT PRIMARY KEY,
  program_id TEXT REFERENCES program(id) ON DELETE CASCADE,
  video_id TEXT REFERENCES video(id),
  sort_order INTEGER NOT NULL,
  scheduled_duration INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'played', 'skipped')),
  played_at TEXT
);

CREATE TABLE IF NOT EXISTS device (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campus_id TEXT REFERENCES campus(id),
  is_online INTEGER DEFAULT 0,
  last_active TEXT,
  current_program_id TEXT REFERENCES program(id),
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  end_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote_option (
  id TEXT PRIMARY KEY,
  vote_id TEXT REFERENCES vote(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollment_config (
  id TEXT PRIMARY KEY,
  phone TEXT,
  wechat_qr TEXT,
  description TEXT,
  button_text TEXT DEFAULT '立即咨询',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_log (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  video_id TEXT REFERENCES video(id),
  device_id TEXT REFERENCES device(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultation_log (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  video_id TEXT REFERENCES video(id),
  device_id TEXT REFERENCES device(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS like_log (
  id TEXT PRIMARY KEY,
  video_id TEXT REFERENCES video(id),
  device_id TEXT REFERENCES device(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS play_log (
  id TEXT PRIMARY KEY,
  video_id TEXT REFERENCES video(id),
  program_id TEXT REFERENCES program(id),
  device_id TEXT REFERENCES device(id),
  duration_played INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report (
  id TEXT PRIMARY KEY,
  campus_id TEXT REFERENCES campus(id),
  campus_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_plays INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  generated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`

db.exec(createTables)

const insertInitialData = db.transaction(() => {
  const campusCount = db.prepare('SELECT COUNT(*) as count FROM campus').get() as { count: number }
  if (campusCount.count === 0) {
    db.exec(`
      INSERT INTO campus (id, name, address, phone) VALUES 
      ('campus_001', '朝阳校区', '北京市朝阳区舞蹈大厦A座', '400-888-0001'),
      ('campus_002', '海淀校区', '北京市海淀区文化中心B1层', '400-888-0002');

      INSERT INTO user (id, username, password, role, name, campus_id) VALUES 
      ('user_001', 'admin', 'admin123', 'admin', '张老师', 'campus_001'),
      ('user_002', 'teacher1', '123456', 'teacher', '李老师', 'campus_001');

      INSERT INTO dance_class (id, name, level, student_count, teacher, campus_id) VALUES 
      ('class_001', '少儿芭蕾启蒙班', '初级', 12, '王老师', 'campus_001'),
      ('class_002', '中国舞基础班', '初级', 15, '李老师', 'campus_001'),
      ('class_003', '爵士舞进阶班', '中级', 10, '赵老师', 'campus_001'),
      ('class_004', '街舞高级班', '高级', 8, '孙老师', 'campus_002'),
      ('class_005', '拉丁舞精英班', '高级', 12, '周老师', 'campus_002');

      INSERT INTO music (id, name, artist, duration, url, volume) VALUES 
      ('music_001', '天鹅湖', '柴可夫斯基', 180, '/music/swan-lake.mp3', 0.8),
      ('music_002', '茉莉花', '中国民歌', 210, '/music/mo-li-hua.mp3', 0.9),
      ('music_003', 'Uptown Funk', 'Bruno Mars', 270, '/music/uptown-funk.mp3', 0.7);

      INSERT INTO video (id, title, class_id, theme, duration, orientation, cover_url, video_url, bgm_id, status, portrait_authorized, play_count, like_count, uploaded_by) VALUES 
      ('video_001', '《天鹅湖》选段', 'class_001', '芭蕾舞', 180, 'portrait', '/covers/video1.jpg', '/videos/video1.mp4', 'music_001', 'approved', 1, 156, 42, 'user_002'),
      ('video_002', '《茉莉花》中国舞', 'class_002', '中国舞', 210, 'landscape', '/covers/video2.jpg', '/videos/video2.mp4', 'music_002', 'approved', 1, 203, 67, 'user_002'),
      ('video_003', '《Uptown Funk》爵士舞', 'class_003', '爵士舞', 270, 'portrait', '/covers/video3.jpg', '/videos/video3.mp4', 'music_003', 'pending', 0, 89, 23, 'user_002'),
      ('video_004', '《本草纲目》街舞', 'class_004', '街舞', 240, 'landscape', '/covers/video4.jpg', '/videos/video4.mp4', NULL, 'approved', 1, 312, 89, 'user_002'),
      ('video_005', '拉丁舞伦巴表演', 'class_005', '拉丁舞', 195, 'portrait', '/covers/video5.jpg', '/videos/video5.mp4', NULL, 'rejected', 0, 45, 12, 'user_002');

      INSERT INTO program (id, name, campus_id, loop_mode, is_active) VALUES 
      ('program_001', '朝阳校区日间播放', 'campus_001', 'list', 1),
      ('program_002', '海淀校区周末专场', 'campus_002', 'random', 0);

      INSERT INTO program_item (id, program_id, video_id, sort_order, scheduled_duration, status) VALUES 
      ('item_001', 'program_001', 'video_001', 1, 180, 'played'),
      ('item_002', 'program_001', 'video_002', 2, 210, 'playing'),
      ('item_003', 'program_001', 'video_004', 3, 240, 'pending'),
      ('item_004', 'program_002', 'video_001', 1, 180, 'pending'),
      ('item_005', 'program_002', 'video_003', 2, 270, 'pending');

      INSERT INTO enrollment_config (id, phone, wechat_qr, description, button_text) VALUES 
      ('config_001', '400-888-0001', '', '扫码添加老师微信，获取免费试听课机会！', '立即咨询报名');

      INSERT INTO device (id, name, campus_id, is_online, last_active, ip_address) VALUES 
      ('device_001', '大厅电视-朝阳', 'campus_001', 1, datetime('now'), '192.168.1.100'),
      ('device_002', '前台电视-朝阳', 'campus_001', 1, datetime('now'), '192.168.1.101'),
      ('device_003', '大厅电视-海淀', 'campus_002', 0, datetime('now', '-1 hour'), '192.168.2.100');

      INSERT INTO vote (id, title, end_at) VALUES 
      ('vote_001', '本月光影之星评选', datetime('now', '+7 days'));

      INSERT INTO vote_option (id, vote_id, text, count) VALUES 
      ('opt_001', 'vote_001', '《天鹅湖》选段 - 少儿芭蕾班', 28),
      ('opt_002', 'vote_001', '《茉莉花》中国舞 - 基础班', 35),
      ('opt_003', 'vote_001', '《Uptown Funk》爵士舞 - 进阶班', 42),
      ('opt_004', 'vote_001', '《本草纲目》街舞 - 高级班', 51);

      INSERT INTO play_log (id, video_id, program_id, device_id, duration_played) VALUES 
      ('log_001', 'video_001', 'program_001', 'device_001', 180),
      ('log_002', 'video_002', 'program_001', 'device_001', 210),
      ('log_003', 'video_004', 'program_001', 'device_002', 240);

      INSERT INTO like_log (id, video_id, device_id) VALUES 
      ('like_001', 'video_001', 'device_001'),
      ('like_002', 'video_002', 'device_001'),
      ('like_003', 'video_004', 'device_002');

      INSERT INTO scan_log (id, type, video_id, device_id) VALUES 
      ('scan_001', 'wechat', 'video_001', 'device_001'),
      ('scan_002', 'remote', 'video_002', 'device_001');

      INSERT INTO consultation_log (id, type, video_id, device_id) VALUES 
      ('consult_001', 'phone', 'video_001', 'device_001'),
      ('consult_002', 'wechat', 'video_004', 'device_002');

      INSERT INTO report (id, campus_id, campus_name, start_date, end_date, total_plays, total_likes, total_scans, total_consultations) VALUES 
      ('report_001', 'campus_001', '朝阳校区', date('now', '-30 days'), date('now'), 856, 234, 156, 78),
      ('report_002', 'campus_002', '海淀校区', date('now', '-30 days'), date('now'), 423, 128, 89, 45);
    `)
  }
})

insertInitialData()

console.log('Database initialized successfully!')
db.close()
