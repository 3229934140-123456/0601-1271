import { motion } from 'framer-motion';
import {
  PlayCircle,
  QrCode,
  MessageSquare,
  TrendingUp,
  Monitor,
  MonitorOff,
  BarChart3,
  LineChart,
  Clock,
  Globe,
  Zap,
  ThumbsUp,
} from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const chartStyle = {
  backgroundColor: '#12121A',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '8px',
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  gradient: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6 hover:border-gold-500/40 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
            className={cn('text-3xl font-bold font-display', gradient)}
          >
            {value.toLocaleString()}
          </motion.p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gold-gradient/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gold-400" />
        </div>
      </div>
    </div>
  </motion.div>
);

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
};

export default function DataStatistics() {
  const { statistics, devices, videos } = useStore();
  const topVideos = [...videos].sort((a, b) => b.playCount - a.playCount).slice(0, 10);

  const playTrend = [
    { name: '周一', 播放: 1200, 点赞: 320 },
    { name: '周二', 播放: 1900, 点赞: 450 },
    { name: '周三', 播放: 1500, 点赞: 380 },
    { name: '周四', 播放: 2200, 点赞: 520 },
    { name: '周五', 播放: 2800, 点赞: 680 },
    { name: '周六', 播放: 3500, 点赞: 890 },
    { name: '周日', 播放: 3100, 点赞: 750 },
  ];

  const scanConsultTrend = [
    { name: '周一', 扫码: 45, 咨询: 12 },
    { name: '周二', 扫码: 58, 咨询: 18 },
    { name: '周三', 扫码: 52, 咨询: 15 },
    { name: '周四', 扫码: 68, 咨询: 22 },
    { name: '周五', 扫码: 82, 咨询: 28 },
    { name: '周六', 扫码: 95, 咨询: 35 },
    { name: '周日', 扫码: 78, 咨询: 25 },
  ];

  const top10Data = topVideos.map((v, i) => ({
    name: v.title.length > 8 ? v.title.substring(0, 8) + '...' : v.title,
    fullName: v.title,
    播放量: v.playCount,
    color: i < 3 ? '#D4AF37' : '#06B6D4',
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">数据统计</h1>
          <p className="text-gray-400 mt-1">全面了解剧场运营数据</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
          <Zap className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">实时更新中</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={PlayCircle} label="总播放量" value={statistics.totalPlays} gradient="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-600" delay={0.1} />
        <StatCard icon={ThumbsUp} label="总点赞数" value={statistics.totalLikes} gradient="bg-clip-text text-transparent bg-gradient-to-r from-neon-pink to-neon-purple" delay={0.2} />
        <StatCard icon={QrCode} label="扫码数量" value={statistics.totalScans} gradient="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan" delay={0.3} />
        <StatCard icon={MessageSquare} label="咨询数量" value={statistics.totalConsultations} gradient="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><LineChart className="w-5 h-5 text-gold-400" />周播放趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={playTrend}>
                <defs>
                  <linearGradient id="colorPlay" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorLike" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF006E" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF006E" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={chartStyle} />
                <Legend />
                <Line type="monotone" dataKey="播放" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="点赞" stroke="#FF006E" strokeWidth={2} dot={{ fill: '#FF006E', r: 4 }} activeDot={{ r: 6 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold-400" />热门作品 TOP10</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Data} layout="vertical">
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={10} width={90} />
                <Tooltip contentStyle={chartStyle} formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]} />
                <Bar dataKey="播放量" radius={[0, 4, 4, 0]}>
                  {top10Data.map((entry, index) => (
                    <motion.rect key={`cell-${index}`} fill={entry.color} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: index * 0.1 }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-gold-400" />扫码/咨询趋势对比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanConsultTrend}>
                <defs>
                  <linearGradient id="colorScan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} /><stop offset="95%" stopColor="#06B6D4" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} /><stop offset="95%" stopColor="#A855F7" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={chartStyle} />
                <Legend />
                <Area type="monotone" dataKey="扫码" stroke="#06B6D4" strokeWidth={2} fill="url(#colorScan)" />
                <Area type="monotone" dataKey="咨询" stroke="#A855F7" strokeWidth={2} fill="url(#colorConsult)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Monitor className="w-5 h-5 text-gold-400" />设备在线状态</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />在线</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />离线</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {devices.map((device, index) => (
              <motion.div key={device.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + index * 0.1 }} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', device.isOnline ? 'bg-green-500/20' : 'bg-red-500/20')}>
                  {device.isOnline ? <Monitor className="w-5 h-5 text-green-400" /> : <MonitorOff className="w-5 h-5 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{device.name}</p>
                    <span className={cn('w-2 h-2 rounded-full', device.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{device.ipAddress}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(device.lastActive)}</span>
                  </div>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', device.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                  {device.isOnline ? '在线' : '离线'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
