import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Building2,
  PlayCircle,
  ThumbsUp,
  QrCode,
  MessageSquare,
  BarChart3,
  X,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { CampusReport } from '../../../shared/types';
import { mockCampuses } from '@/data/mockData';

const chartStyle = {
  backgroundColor: '#12121A',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '8px',
};

const PIE_COLORS = ['#D4AF37', '#FF006E', '#06B6D4', '#A855F7'];
const BAR_COLORS = ['#D4AF37', '#E6C665', '#B8941F', '#06B6D4', '#A855F7', '#FF006E', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: { bg: string; border: string; text: string } }) => (
  <div className={`p-4 rounded-xl border ${color.bg} ${color.border}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${color.text}`} />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${color.text}`}>{value.toLocaleString()}</p>
  </div>
);

export default function ReportCenter() {
  const { reports, generateReport, fetchReports } = useStore();
  const [detailReport, setDetailReport] = useState<CampusReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [formData, setFormData] = useState({
    campusId: 'campus_001',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const report = await generateReport(formData.campusId, formData.startDate, formData.endDate);
      setDetailReport(report);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 2000);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (report: CampusReport) => {
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.campusName}_${report.startDate}_${report.endDate}_报告.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pieData = detailReport ? [
    { name: '播放', value: detailReport.totalPlays, color: '#D4AF37' },
    { name: '点赞', value: detailReport.totalLikes, color: '#FF006E' },
    { name: '扫码', value: detailReport.totalScans, color: '#06B6D4' },
    { name: '咨询', value: detailReport.totalConsultations, color: '#A855F7' },
  ] : [];

  const popularData = detailReport?.popularVideos.slice(0, 10).map((v, i) => ({
    name: v.title.length > 8 ? v.title.substring(0, 8) + '...' : v.title,
    fullName: v.title,
    播放量: v.playCount,
    color: BAR_COLORS[i % BAR_COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">报告中心</h1>
          <p className="text-gray-400 mt-1">生成和导出校区运营报告</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-400" />生成报告</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" />选择校区</label>
              <select value={formData.campusId} onChange={(e) => setFormData({ ...formData, campusId: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors">
                {mockCampuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />开始日期</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />结束日期</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" />
            </div>
            <button onClick={handleGenerateReport} disabled={generating} className={cn('w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all', generating ? 'bg-gray-600 cursor-not-allowed' : generated ? 'bg-green-500 text-white' : 'bg-gold-gradient text-stage-900 hover:opacity-90')}>
              {generating ? (
                <><div className="w-5 h-5 border-2 border-stage-900 border-t-transparent rounded-full animate-spin" />生成中...</>
              ) : generated ? (
                <><CheckCircle className="w-5 h-5" />已生成</>
              ) : (
                <><FileText className="w-5 h-5" />生成报告</>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-gold-400" />已生成报告</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gold-500/10">
                  <th className="pb-3 font-medium">校区</th>
                  <th className="pb-3 font-medium">日期范围</th>
                  <th className="pb-3 font-medium">总播放</th>
                  <th className="pb-3 font-medium">总点赞</th>
                  <th className="pb-3 font-medium">总扫码</th>
                  <th className="pb-3 font-medium">总咨询</th>
                  <th className="pb-3 font-medium">生成时间</th>
                  <th className="pb-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无报告，点击左侧生成新报告</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <motion.tr key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gold-gradient/20 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gold-400" />
                          </div>
                          <span className="font-medium text-sm">{report.campusName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-400">{formatDate(report.startDate)} ~ {formatDate(report.endDate)}</td>
                      <td className="py-3 text-sm font-medium text-gold-400">{report.totalPlays.toLocaleString()}</td>
                      <td className="py-3 text-sm font-medium text-neon-pink">{report.totalLikes.toLocaleString()}</td>
                      <td className="py-3 text-sm font-medium text-neon-cyan">{report.totalScans.toLocaleString()}</td>
                      <td className="py-3 text-sm font-medium text-purple-400">{report.totalConsultations.toLocaleString()}</td>
                      <td className="py-3 text-xs text-gray-500">{formatDate(report.generatedAt)}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailReport(report)} className="p-1.5 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-colors" title="查看详情">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleExport(report)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors" title="导出">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {detailReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDetailReport(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] bg-stage-800 border border-gold-500/30 rounded-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setDetailReport(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold-gradient/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">{detailReport.campusName} - 运营报告</h3>
                  <p className="text-sm text-gray-400">{formatDate(detailReport.startDate)} 至 {formatDate(detailReport.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={PlayCircle} label="总播放量" value={detailReport.totalPlays} color={{ bg: 'bg-gold-500/10', border: 'border-gold-500/20', text: 'text-gold-400' }} />
                <StatCard icon={ThumbsUp} label="总点赞数" value={detailReport.totalLikes} color={{ bg: 'bg-neon-pink/10', border: 'border-neon-pink/20', text: 'text-neon-pink' }} />
                <StatCard icon={QrCode} label="总扫码数" value={detailReport.totalScans} color={{ bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20', text: 'text-neon-cyan' }} />
                <StatCard icon={MessageSquare} label="总咨询数" value={detailReport.totalConsultations} color={{ bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' }} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" />数据分布</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={chartStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4" />热门作品 TOP10</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={popularData}>
                        <XAxis dataKey="name" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={chartStyle} formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]} />
                        <Bar dataKey="播放量" radius={[4, 4, 0, 0]}>
                          {popularData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4" />热门作品列表</h4>
                <div className="space-y-2">
                  {detailReport.popularVideos.slice(0, 10).map((video, index) => (
                    <div key={video.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', index < 3 ? 'bg-gold-gradient text-stage-900' : 'bg-white/10 text-gray-400')}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <p className="text-xs text-gray-500">{video.className}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gold-400 font-medium">{video.playCount} 播放</span>
                        <span className="text-neon-pink font-medium">{video.likeCount} 点赞</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleExport(detailReport)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-all">
                  <Download className="w-4 h-4" />导出报告
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
