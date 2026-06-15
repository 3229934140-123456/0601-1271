import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  GripVertical,
  Edit2,
  Trash2,
  Plus,
  X,
  GraduationCap,
  Play,
  Pause,
  Users,
  Music,
  Save,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import type { DanceClass } from '../../../shared/types';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTime = (index: number, baseHour = 9) => {
  const hour = Math.floor(baseHour + index * 0.5);
  const minute = (index % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export default function ProgramManage() {
  const { program, classes, updateProgramItemOrder, createClass, updateClass, deleteClass } = useStore();
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DanceClass | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({ name: '', level: '初级', teacher: '', studentCount: 0 });
  const [editItem, setEditItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ className: '', theme: '', duration: 180 });

  const handleDragStart = (id: string) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverItem(id); };
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
      const items = [...program.items];
      const fromIdx = items.findIndex(i => i.id === draggedItem);
      const toIdx = items.findIndex(i => i.id === dragOverItem);
      const [removed] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, removed);
      const updates = items.map((item, idx) => ({ id: item.id, sortOrder: idx }));
      updateProgramItemOrder(updates);
    }
    setDraggedItem(null); setDragOverItem(null);
  };

  const openClassModal = (cls?: DanceClass) => {
    if (cls) {
      setEditingClass(cls);
      setClassForm({ name: cls.name, level: cls.level, teacher: cls.teacher, studentCount: cls.studentCount });
    } else {
      setEditingClass(null);
      setClassForm({ name: '', level: '初级', teacher: '', studentCount: 0 });
    }
    setClassModalOpen(true);
  };

  const handleSaveClass = () => {
    if (editingClass) {
      updateClass(editingClass.id, classForm);
    } else {
      createClass(classForm.name, classForm.level, classForm.teacher, classForm.studentCount);
    }
    setClassModalOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('确定删除该班级吗？')) deleteClass(id);
  };

  const openEditItem = (itemId: string) => {
    const item = program.items.find(i => i.id === itemId);
    if (item) {
      setEditItem(itemId);
      setEditForm({ className: item.video.className, theme: item.video.theme, duration: item.scheduledDuration });
    }
  };

  const handleSaveEdit = () => {
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">节目单管理</h1>
          <p className="text-gray-400 mt-1">拖拽排序节目，管理播放顺序</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openClassModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />管理班级
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-gold-400" />班级列表</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cls.name}</p>
                  <p className="text-xs text-gray-500">{cls.level} · {cls.teacher}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openClassModal(cls)} className="p-1.5 rounded-lg hover:bg-gold-500/20 text-gold-400"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteClass(cls.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 bg-stage-800/50 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-gold-400" />{program.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400"><Users className="w-4 h-4" /><span>{program.items.length} 个节目</span></div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gold-500/20" />
            <div className="space-y-2">
              {program.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    'relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-move',
                    draggedItem === item.id ? 'opacity-50' : '',
                    dragOverItem === item.id && draggedItem !== item.id ? 'border-gold-400 bg-gold-500/10' : 'border-transparent bg-white/5 hover:bg-white/10',
                    item.status === 'playing' ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-stage-800' : ''
                  )}
                >
                  <div className="relative z-10 w-16 text-right">
                    <p className="text-gold-400 font-mono font-bold">{formatTime(index)}</p>
                  </div>
                  <div className="absolute left-8 w-3 h-3 rounded-full bg-gold-gradient border-4 border-stage-800" />
                  <GripVertical className="w-5 h-5 text-gray-500 hover:text-gold-400 transition-colors" />

                  {editItem === item.id ? (
                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                      <select value={editForm.className} onChange={(e) => setEditForm({ ...editForm, className: e.target.value })} className="px-3 py-1.5 rounded-lg bg-stage-700 border border-gold-500/20 text-sm">
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input value={editForm.theme} onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })} placeholder="主题" className="px-3 py-1.5 rounded-lg bg-stage-700 border border-gold-500/20 text-sm w-32" />
                      <div className="flex items-center gap-1">
                        <input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })} className="w-20 px-3 py-1.5 rounded-lg bg-stage-700 border border-gold-500/20 text-sm" />
                        <span className="text-xs text-gray-400">秒</span>
                      </div>
                      <button onClick={handleSaveEdit} className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.status === 'playing' && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gold-gradient text-stage-900 text-xs font-bold"><Play className="w-3 h-3" />播放中</span>}
                          {item.status === 'played' && <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">已播放</span>}
                          <p className="font-medium">{item.video.title}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{item.video.className}</span>
                          <span className="flex items-center gap-1"><Music className="w-3 h-3" />{item.video.theme}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gold-400 font-mono">{formatDuration(item.scheduledDuration)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => openEditItem(item.id)} className="p-2 rounded-lg hover:bg-gold-500/20 text-gold-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          {item.status === 'playing' ? (
                            <button className="p-2 rounded-lg bg-gold-gradient text-stage-900"><Pause className="w-4 h-4" /></button>
                          ) : (
                            <button className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"><Play className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {classModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-stage-800 border border-gold-500/30 rounded-2xl p-6">
              <button onClick={() => setClassModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-6">{editingClass ? '编辑班级' : '新增班级'}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm text-gray-400 mb-2">班级名称</label><input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="例如：少儿启蒙班" /></div>
                <div><label className="block text-sm text-gray-400 mb-2">级别</label><select value={classForm.level} onChange={(e) => setClassForm({ ...classForm, level: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors"><option>初级</option><option>中级</option><option>高级</option><option>专业</option></select></div>
                <div><label className="block text-sm text-gray-400 mb-2">授课教师</label><input value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" placeholder="教师姓名" /></div>
                <div><label className="block text-sm text-gray-400 mb-2">学生人数</label><input type="number" value={classForm.studentCount} onChange={(e) => setClassForm({ ...classForm, studentCount: Number(e.target.value) })} className="w-full px-4 py-2 rounded-xl bg-stage-700 border border-gold-500/20 focus:border-gold-400 focus:outline-none transition-colors" /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setClassModalOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-gold-500/20 hover:bg-white/5 transition-colors">取消</button>
                <button onClick={handleSaveClass} className="flex-1 px-4 py-2 rounded-xl bg-gold-gradient text-stage-900 font-semibold hover:opacity-90 transition-opacity">{editingClass ? '保存修改' : '创建班级'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
