import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Vote,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RotateCcw,
  Phone,
  QrCode,
  FileText,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const chartStyle = {
  backgroundColor: '#12121A',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '8px',
};

const barColors = ['#D4AF37', '#E6C665', '#B8941F', '#06B6D4', '#A855F7', '#FF006E'];

export default function InteractionManage() {
  const {
    vote,
    enrollmentConfig,
    fetchVote,
    fetchEnrollmentConfig,
    updateVote,
    addVoteOption,
    updateVoteOption,
    removeVoteOption,
    resetVote,
    updateEnrollmentConfig,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'vote' | 'enrollment'>('vote');
  const [newOption, setNewOption] = useState('');
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(vote.title);
  const [endAtInput, setEndAtInput] = useState(vote.endAt.split('T')[0]);
  const [enrollmentForm, setEnrollmentForm] = useState(enrollmentConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchVote();
    fetchEnrollmentConfig();
  }, [fetchVote, fetchEnrollmentConfig]);

  useEffect(() => {
    setTitleInput(vote.title);
    setEndAtInput(vote.endAt.split('T')[0]);
  }, [vote.title, vote.endAt]);

  useEffect(() => {
    setEnrollmentForm(enrollmentConfig);
  }, [enrollmentConfig]);

  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.count, 0);
  const voteData = vote.options.map((opt, index) => ({
    name: opt.text.length > 12 ? opt.text.substring(0, 12) + '...' : opt.text,
    fullName: opt.text,
    count: opt.count,
    percentage: totalVotes > 0 ? ((opt.count / totalVotes) * 100).toFixed(1) : '0',
    color: barColors[index % barColors.length],
  }));

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      updateVote({ title: titleInput.trim() });
    }
    setEditingTitle(false);
  };

  const handleEndAtChange = (date: string) => {
    setEndAtInput(date);
    updateVote({ endAt: new Date(date).toISOString() });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      addVoteOption(newOption.trim());
      setNewOption('');
    }
  };

  const handleDeleteOption = (optionId: string) => {
    if (confirm('确定删除该选项吗？')) {
      removeVoteOption(optionId);
    }
  };

  const handleStartEdit = (optionId: string, text: string) => {
    setEditingOption(optionId);
    setEditText(text);
  };

  const handleSaveEdit = () => {
    if (editingOption && editText.trim()) {
      updateVoteOption(editingOption, editText.trim());
    }
    setEditingOption(null);
    setEditText('');
  };

  const handleResetVote = () => {
    if (confirm('确定重置所有投票数据吗？')) {
      resetVote();
    }
  };

  const handleSaveEnrollment = async () => {
    await updateEnrollmentConfig(enrollmentForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">互动管理</h1>
          <p className="text-gray-400 mt-1">管理投票活动和报名配置</p>
        </div>
      </motion.div>

      <div className="flex gap-2 bg-stage-800/50 p-1 rounded-xl border border-gold-500/10 w-fit">
        <button onClick={() => setActiveTab('vote')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all', activeTab === 'vote' ? 'bg-gold-gradient text-stage-900 font-medium' : 'text-gray-400 hover:text-white')}>
          <Vote className="w-4 h-4" />投票管理
        </button>
        <button onClick={() => setActiveTab('enrollment')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all', activeTab === 'enrollment' ? 'bg-gold-gradient text-stage-900 font-medium' : 'text-gray-400 hover:text-white')}>
          <MessageSquare className="w-4 h-4" />报名配置
        </button>
      </div>

      {activeTab === 'vote' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <div className="flex gap-2">
                    <input
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-lg font-bold"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    />
                    <button onClick={handleSaveTitle} className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400"><Save className="w-4 h-4" /></button>
                    <button onClick={() => { setEditingTitle(false); setTitleInput(vote.title); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold" onClick={() => setEditingTitle(true)}>{vote.title}</h3>
                    <button onClick={() => setEditingTitle(true)} className="p-1 rounded hover:bg-white/10 text-gray-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', vote.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                  {vote.isActive ? '进行中' : '已结束'}
                </span>
                <button onClick={handleResetVote} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all" title="重置投票">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gold-400" />
                <span className="text-sm text-gray-400">截止时间：</span>
                <input
                  type="date"
                  value={endAtInput}
                  onChange={(e) => handleEndAtChange(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm flex-1 max-w-xs"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="输入新选项..."
                  className="flex-1 px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                />
                <button onClick={handleAddOption} className="px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-medium hover:opacity-90 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vote.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: barColors[index % barColors.length] + '33', color: barColors[index % barColors.length] }}>
                      {index + 1}
                    </div>
                    {editingOption === option.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-3 py-1 rounded-lg bg-stage-700 border border-gold-500/30 text-sm focus:outline-none focus:border-gold-400" autoFocus />
                        <button onClick={handleSaveEdit} className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditingOption(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <p className="flex-1 text-sm">{option.text}</p>
                        <span className="text-sm font-bold text-gold-400">{option.count} 票</span>
                        <button onClick={() => handleStartEdit(option.id, option.text)} className="p-1.5 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteOption(option.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gold-gradient/10 border border-gold-400/20">
              <span className="text-sm text-gray-300">总投票数</span>
              <span className="text-2xl font-bold text-gold-400">{totalVotes}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold-400" />投票结果</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voteData} layout="vertical">
                  <XAxis type="number" stroke="#666" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={120} />
                  <Tooltip contentStyle={chartStyle} formatter={(value: number, name: string, props: { payload: { fullName: string; percentage: string } }) => [`${value} 票 (${props.payload.percentage}%)`, props.payload.fullName]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {voteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {voteData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400 flex-1 truncate">{item.fullName}</span>
                  <span className="text-xs font-medium text-gold-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'enrollment' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gold-400" />报名咨询配置</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Phone className="w-4 h-4" />咨询电话</label>
              <input value={enrollmentForm.phone} onChange={(e) => setEnrollmentForm({ ...enrollmentForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="请输入咨询电话" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><QrCode className="w-4 h-4" />微信二维码URL</label>
              <input value={enrollmentForm.wechatQr} onChange={(e) => setEnrollmentForm({ ...enrollmentForm, wechatQr: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="请输入微信二维码图片链接" />
              {enrollmentForm.wechatQr && (
                <div className="mt-3 p-3 bg-white rounded-xl inline-block">
                  <img src={enrollmentForm.wechatQr} alt="微信二维码" className="w-32 h-32 object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />描述文案</label>
              <textarea value={enrollmentForm.description} onChange={(e) => setEnrollmentForm({ ...enrollmentForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors resize-none" placeholder="请输入描述文案" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" />按钮文字</label>
              <input value={enrollmentForm.buttonText} onChange={(e) => setEnrollmentForm({ ...enrollmentForm, buttonText: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="请输入按钮文字" />
            </div>
            <button onClick={handleSaveEnrollment} className={cn('w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all', saved ? 'bg-green-500 text-white' : 'bg-gold-gradient text-stage-900 hover:opacity-90')}>
              {saved ? <><CheckCircle className="w-5 h-5" />已保存</> : <><Save className="w-5 h-5" />保存配置</>}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
