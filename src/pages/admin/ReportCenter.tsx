import { useState } from 'react';
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
  TrendingUp,
  BarChart3,
  X,
  CheckCircle,
  ChevronRight,
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

const PIE_COLORS = ['#D4AF37', '#FF006E', '#06B6D4', '#A855F7', '#22c55e'];

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function ReportCenter() {
  const { reports, generateReport } = useStore();
  const [selectedReport, setSelectedReport] = useState<CampusReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [formData, setFormData] = useState({
    campusId: 'campus_001',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
  });

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      const report = generateReport(formData.campusId, formData.startDate, formData.endDate);
      setSelectedReport(report);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 2000);
    }, 1000);
  };

  const handleExport = (report: CampusReport) => {
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.campusName}_${report.startDate}_${report.endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pieData = selectedReport ? [
    { name: '播放', value: selectedReport.totalPlays, color: '#D4AF37' },
    { name: '点赞', value: selectedReport.totalLikes, color: '#FF006E' },
    { name: '扫码', value: selectedReport.totalScans, color: '#06B6D4' },
  ] : [];

  const popularData = selectedReport?.popularVideos.map((v, i) => ({
    name: v.title.length > 6 ? v.title.substring(0, 6) + '...' : v.title,
    fullName: v.title,
    播放量: v.playCount,
    color: PIE_COLORS[i % PIE_COLORS.length],
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无报告，点击左侧生成新报告</p>
              </div>
            ) : (
              reports.map((report, index) => (
                <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={cn('flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer', selectedReport?.id === report.id ? 'bg-gold-gradient/10 border-gold-400/30' : 'bg-white/5 border-transparent hover:bg-white/10')} onClick={() => setSelectedReport(report)}>
                  <div className="w-10 h-10 rounded-xl bg-gold-gradient/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{report.campusName}</p>
                    <p className="text-xs text-gray-500">{formatDate(report.startDate)} - {formatDate(report.endDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gold-400">{report.totalPlays.toLocaleString()} 播放</p>
                    <p className="text-xs text-gray-500">{formatDate(report.generatedAt)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleExport(report); }} className="p-2 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-all" title="导出报告">
                    <Download className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold-400" />报告详情 - {selectedReport.campusName}</h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gold-gradient/10 border border-gold-400/20">
                <div className="flex items-center gap-2 mb-2"><PlayCircle className="w-4 h-4 text-gold-400" /><span className="text-sm text-gray-400">总播放</span></div>
                <p className="text-2xl font-bold text-gold-400">{selectedReport.totalPlays.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-neon-pink/10 border border-neon-pink/20">
                <div className="flex items-center gap-2 mb-2"><ThumbsUp className="w-4 h-4 text-neon-pink" /><span className="text-sm text-gray-400">总点赞</span></div>
                <p className="text-2xl font-bold text-neon-pink">{selectedReport.totalLikes.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                <div className="flex items-center gap-2 mb-2"><QrCode className="w-4 h-4 text-neon-cyan" /><span className="text-sm text-gray-400">总扫码</span></div>
                <p className="text-2xl font-bold text-neon-cyan">{selectedReport.totalScans.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
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
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" />热门作品</h4>
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

            <div className="mt-6 flex justify-end">
              <button onClick={() => handleExport(selectedReport)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-all">
                <Download className="w-4 h-4" />导出报告
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
