import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, GripVertical, Edit2, Trash2, Plus, X, GraduationCap, Play,
  Check, Users, Save, ArrowUp, ArrowDown, FastForward, Building2,
  Shuffle, Repeat, Repeat1, Video as VideoIcon, CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import type { DanceClass, Video, ProgramItem } from '../../../shared/types';
import { cn } from '@/lib/utils';
import { mockCampuses } from '@/data/mockData';

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export default function ProgramManage() {
  const {
    program, videos, classes, updateProgramInfo, updateProgramItemOrder,
    addVideosToProgram, removeFromProgram, updateProgramItem, setActiveProgram,
    createClass, updateClass, deleteClass, insertVideo,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(program.name);
  const [selectedCampus, setSelectedCampus] = useState(program.campusId);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DanceClass | null>(null);
  const [classForm, setClassForm] = useState({ name: '', level: '初级', teacher: '', studentCount: 0 });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const approvedVideos = videos.filter(v => v.status === 'approved');
  const totalDur = program.items.reduce((s, i) => s + i.scheduledDuration, 0);

  const saveName = () => { if (nameInput.trim()) updateProgramInfo({ name: nameInput.trim() }); setEditingName(false); };
  const changeCampus = (id: string) => { setSelectedCampus(id); updateProgramInfo({ campusId: id }); };
  const changeLoop = (m: 'single' | 'list' | 'random') => updateProgramInfo({ loopMode: m });

  const handleDragStart = (id: string) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverItem(id); };
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
      const items = [...program.items];
      const from = items.findIndex(i => i.id === draggedItem);
      const to = items.findIndex(i => i.id === dragOverItem);
      const [r] = items.splice(from, 1); items.splice(to, 0, r);
      updateProgramItemOrder(items.map((it, i) => ({ id: it.id, sortOrder: i })));
    }
    setDraggedItem(null); setDragOverItem(null);
  };

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const items = [...program.items];
    const ni = dir === 'up' ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= items.length) return;
    [items[idx], items[ni]] = [items[ni], items[idx]];
    updateProgramItemOrder(items.map((it, i) => ({ id: it.id, sortOrder: i })));
  };

  const openEditItem = (item: ProgramItem) => { setEditItemId(item.id); setEditDuration(item.scheduledDuration); };
  const saveEditItem = () => { if (editItemId) updateProgramItem(editItemId, { scheduledDuration: editDuration }); setEditItemId(null); };

  const openClassModal = (cls?: DanceClass) => {
    if (cls) { setEditingClass(cls); setClassForm({ name: cls.name, level: cls.level, teacher: cls.teacher, studentCount: cls.studentCount }); }
    else { setEditingClass(null); setClassForm({ name: '', level: '初级', teacher: '', studentCount: 0 }); }
    setClassModalOpen(true);
  };

  const saveClass = () => {
    editingClass ? updateClass(editingClass.id, classForm) : createClass(classForm.name, classForm.level, classForm.teacher, classForm.studentCount);
    setClassModalOpen(false);
  };
  const delClass = (id: string) => { if (confirm('确定删除该班级吗？')) deleteClass(id); };

  const toggleVideo = (id: string) => setSelectedVideos(p => p.includes(id) ? p.filter(v => v !== id) : [...p, id]);
  const addVideos = () => { if (selectedVideos.length) { addVideosToProgram(selectedVideos); setSelectedVideos([]); setAddModalOpen(false); } };

  const StatusBadge = ({ s }: { s: ProgramItem['status'] }) => {
    if (s === 'playing') return <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gold-gradient text-stage-900 text-xs font-bold"><Play className="w-3 h-3" />播放中</span>;
    if (s === 'played') return <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">已播放</span>;
    return <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 text-xs">待播放</span>;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">节目单管理</h1>
          <p className="text-gray-400 mt-1">编排播放节目，管理播放顺序</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openClassModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-gold-500/20 hover:bg-white/10 transition-colors">
            <GraduationCap className="w-4 h-4" />管理班级
          </button>
          <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />添加节目
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">节目单名称</label>
            {editingName ? (
              <div className="flex gap-2">
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="flex-1 px-3 py-2 rounded-lg bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm" autoFocus />
                <button onClick={saveName} className="p-2 rounded-lg bg-gold-500/20 text-gold-400"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setEditingName(false); setNameInput(program.name); }} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10" onClick={() => setEditingName(true)}>
                <span className="font-medium flex-1">{program.name}</span>
                <Edit2 className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1"><Building2 className="w-4 h-4" />校区</label>
            <select value={selectedCampus} onChange={e => changeCampus(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none text-sm">
              {mockCampuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">循环模式</label>
            <div className="flex gap-1 p-1 rounded-lg bg-stage-700">
              {(['single', 'list', 'random'] as const).map(m => (
                <button key={m} onClick={() => changeLoop(m)}
                  className={cn('flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs transition-all', program.loopMode === m ? 'bg-gold-gradient text-stage-900 font-medium' : 'text-gray-400 hover:text-white')}>
                  {m === 'single' && <><Repeat1 className="w-4 h-4" />单曲</>}
                  {m === 'list' && <><Repeat className="w-4 h-4" />列表</>}
                  {m === 'random' && <><Shuffle className="w-4 h-4" />随机</>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">操作</label>
            <button onClick={() => setActiveProgram(program.id)}
              className={cn('w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                program.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold-gradient text-stage-900 hover:opacity-90')}>
              {program.isActive ? <><CheckCircle2 className="w-4 h-4" />当前播放中</> : <><Play className="w-4 h-4" />设为当前播放</>}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gold-500/10">
          <div className="flex items-center gap-2 text-sm text-gray-400"><Users className="w-4 h-4" /><span>{program.items.length} 个节目</span></div>
          <div className="flex items-center gap-2 text-sm text-gray-400"><Clock className="w-4 h-4" /><span>总时长 {fmtDur(totalDur)}</span></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-gold-400" />节目时间轴</h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gold-500/20" />
          <div className="space-y-3">
            {program.items.map((item, idx) => (
              <motion.div key={item.id} draggable
                onDragStart={() => handleDragStart(item.id)} onDragOver={e => handleDragOver(e, item.id)} onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}
                className={cn('relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-move',
                  draggedItem === item.id ? 'opacity-50' : '',
                  dragOverItem === item.id && draggedItem !== item.id ? 'border-gold-400 bg-gold-500/10' : 'border-transparent bg-white/5 hover:bg-white/10',
                  item.status === 'playing' ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-stage-800' : '')}>
                <div className="relative z-10 w-16 text-right"><p className="text-gold-400 font-mono font-bold text-lg">{idx + 1}</p></div>
                <div className="absolute left-8 w-3 h-3 rounded-full bg-gold-gradient border-4 border-stage-800" />
                <GripVertical className="w-5 h-5 text-gray-500 hover:text-gold-400 transition-colors" />
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-stage-700 flex-shrink-0 relative">
                  <VideoIcon className="absolute inset-0 m-auto w-6 h-6 text-gold-400/30" />
                </div>

                {editItemId === item.id ? (
                  <div className="flex-1 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">时长:</span>
                      <input type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))} className="w-20 px-2 py-1 rounded bg-stage-700 border border-gold-500/20 text-sm" />
                      <span className="text-xs text-gray-400">秒</span>
                    </div>
                    <button onClick={saveEditItem} className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditItemId(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><StatusBadge s={item.status} /><p className="font-medium">{item.video.title}</p></div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{item.video.className}</span>
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" />{item.video.theme}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-mono font-medium">{fmtDur(item.scheduledDuration)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className={cn('p-1.5 rounded-lg transition-colors', idx === 0 ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-white/10 text-gray-400')}><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveItem(idx, 'down')} disabled={idx === program.items.length - 1} className={cn('p-1.5 rounded-lg transition-colors', idx === program.items.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-white/10 text-gray-400')}><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => openEditItem(item)} className="p-1.5 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-colors" title="编辑"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => insertVideo(item.videoId)} className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors" title="插播"><FastForward className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('确定删除该节目吗？')) removeFromProgram(item.id); }} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="删除"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
            {program.items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无节目，点击上方"添加节目"按钮添加</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {addModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-2xl max-h-[80vh] bg-stage-800 border border-gold-500/30 rounded-2xl p-6 flex flex-col">
              <button onClick={() => { setAddModalOpen(false); setSelectedVideos([]); }} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">添加节目</h3>
              <p className="text-sm text-gray-400 mb-4">从视频库选择视频添加到节目单（可多选）</p>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {approvedVideos.map(v => (
                  <div key={v.id} onClick={() => toggleVideo(v.id)}
                    className={cn('flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all', selectedVideos.includes(v.id) ? 'bg-gold-gradient/10 border border-gold-400/50' : 'bg-white/5 border border-transparent hover:bg-white/10')}>
                    <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0', selectedVideos.includes(v.id) ? 'bg-gold-gradient border-gold-400' : 'border-gray-500')}>
                      {selectedVideos.includes(v.id) && <Check className="w-3 h-3 text-stage-900" />}
                    </div>
                    <div className="w-16 h-10 rounded overflow-hidden bg-stage-700 flex-shrink-0 relative"><VideoIcon className="absolute inset-0 m-auto w-4 h-4 text-gold-400/30" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{v.title}</p>
                      <p className="text-xs text-gray-500">{v.className} · {fmtDur(v.duration)}</p>
                    </div>
                  </div>
                ))}
                {approvedVideos.length === 0 && (
                  <div className="text-center py-8 text-gray-500"><VideoIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">暂无已审核视频</p></div>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                <span className="text-sm text-gray-400">已选择 {selectedVideos.length} 个视频</span>
                <div className="flex gap-3">
                  <button onClick={() => { setAddModalOpen(false); setSelectedVideos([]); }} className="px-4 py-2 rounded-xl border border-gold-500/20 hover:bg-white/5 transition-colors">取消</button>
                  <button onClick={addVideos} disabled={selectedVideos.length === 0} className={cn('px-4 py-2 rounded-xl font-semibold transition-all', selectedVideos.length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold-gradient text-stage-900 hover:opacity-90')}>添加到节目单</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {classModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-stage-800 border border-gold-500/30 rounded-2xl p-6">
              <button onClick={() => setClassModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-6">{editingClass ? '编辑班级' : '新增班级'}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm text-gray-400 mb-2">班级名称</label><input value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="例如：少儿启蒙班" /></div>
                <div><label className="block text-sm text-gray-400 mb-2">级别</label><select value={classForm.level} onChange={e => setClassForm({ ...classForm, level: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"><option>初级</option><option>中级</option><option>高级</option><option>专业</option></select></div>
                <div><label className="block text-sm text-gray-400 mb-2">授课教师</label><input value={classForm.teacher} onChange={e => setClassForm({ ...classForm, teacher: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="教师姓名" /></div>
                <div><label className="block text-sm text-gray-400 mb-2">学生人数</label><input type="number" value={classForm.studentCount} onChange={e => setClassForm({ ...classForm, studentCount: Number(e.target.value) })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" /></div>
              </div>
              {editingClass && <button onClick={() => { delClass(editingClass.id); setClassModalOpen(false); }} className="w-full mt-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm">删除班级</button>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setClassModalOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-gold-500/20 hover:bg-white/5 transition-colors">取消</button>
                <button onClick={saveClass} className="flex-1 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity">{editingClass ? '保存修改' : '创建班级'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
