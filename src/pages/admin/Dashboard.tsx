import { motion } from 'framer-motion';
import {
  PlayCircle,
  QrCode,
  MessageSquare,
  TrendingUp,
  Monitor,
  MonitorOff,
  PlusCircle,
  Upload,
  Settings,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

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
      <div className="mt-4 flex items-center gap-1 text-gold-400 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span>+12.5% 较昨日</span>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'flex items-center gap-3 px-5 py-4 rounded-xl bg-stage-800/50 backdrop-blur-sm border border-gold-500/10 hover:border-gold-500/30 transition-all group',
      color
    )}
  >
    <div className="w-10 h-10 rounded-lg bg-gold-gradient/20 flex items-center justify-center group-hover:bg-gold-gradient/30 transition-colors">
      <Icon className="w-5 h-5 text-gold-400" />
    </div>
    <span className="text-sm font-medium">{label}</span>
  </motion.button>
);

export default function Dashboard() {
  const { statistics, devices, videos } = useStore();
  const topVideos = [...videos].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
  const onlineDevices = devices.filter((d) => d.isOnline).length;
  const offlineDevices = devices.filter((d) => !d.isOnline).length;

  const playTrend = [
    { name: '周一', value: 1200 }, { name: '周二', value: 1900 },
    { name: '周三', value: 1500 }, { name: '周四', value: 2200 },
    { name: '周五', value: 2800 }, { name: '周六', value: 3500 },
    { name: '周日', value: 3100 },
  ];

  const deviceDistribution = [
    { name: '朝阳校区', online: 8, offline: 1 },
    { name: '海淀校区', online: 6, offline: 2 },
    { name: '东城校区', online: 5, offline: 0 },
  ];

  const chartStyle = {
    backgroundColor: '#12121A',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
            管理仪表盘
          </h1>
          <p className="text-gray-400 mt-1">实时监控剧场运营数据</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
          <Zap className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">系统运行正常</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={PlayCircle} label="总播放量" value={statistics.totalPlays} gradient="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-600" delay={0.1} />
        <StatCard icon={TrendingUp} label="今日播放" value={statistics.todayPlays} gradient="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple" delay={0.2} />
        <StatCard icon={QrCode} label="扫码数量" value={statistics.totalScans} gradient="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink" delay={0.3} />
        <StatCard icon={MessageSquare} label="咨询量" value={statistics.totalConsultations} gradient="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-400" />周播放趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playTrend}>
                <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={chartStyle} />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-gold-400" />设备状态
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex-1">
                <Monitor className="w-5 h-5 text-green-400" />
                <div><p className="text-2xl font-bold text-green-400">{onlineDevices}</p><p className="text-xs text-gray-400">在线设备</p></div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex-1">
                <MonitorOff className="w-5 h-5 text-red-400" />
                <div><p className="text-2xl font-bold text-red-400">{offlineDevices}</p><p className="text-xs text-gray-400">离线设备</p></div>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceDistribution}>
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar dataKey="online" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="offline" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-gold-400" />热门作品 TOP5</h3>
          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <motion.div key={video.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + index * 0.1 }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm', index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-black' : 'bg-stage-700 text-gray-400')}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-gold-400 transition-colors">{video.title}</p>
                  <p className="text-xs text-gray-500">{video.className}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold-400">{video.playCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">播放</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-gold-400" />快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={PlusCircle} label="新建节目" color="hover:text-gold-400" />
            <QuickAction icon={Upload} label="上传素材" color="hover:text-neon-cyan" />
            <QuickAction icon={Settings} label="系统设置" color="hover:text-neon-purple" />
            <QuickAction icon={MessageSquare} label="查看咨询" color="hover:text-neon-pink" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
