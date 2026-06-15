import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ListVideo,
  FolderOpen,
  ClipboardCheck,
  PlayCircle,
  MessageSquare,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Monitor,
  ChevronRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/useStore';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'program', label: '节目单', icon: ListVideo, path: '/admin/program' },
  { id: 'material', label: '素材库', icon: FolderOpen, path: '/admin/materials' },
  { id: 'review', label: '审核中心', icon: ClipboardCheck, path: '/admin/review', badge: 3 },
  { id: 'playback', label: '播放控制', icon: PlayCircle, path: '/admin/playback' },
  { id: 'interaction', label: '互动管理', icon: MessageSquare, path: '/admin/interaction' },
  { id: 'statistics', label: '数据统计', icon: BarChart3, path: '/admin/statistics' },
  { id: 'reports', label: '报告中心', icon: FileText, path: '/admin/reports' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToTV = () => {
    navigate('/tv');
  };

  return (
    <div className="min-h-screen bg-stage-950 flex text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative h-screen bg-stage-900/80 backdrop-blur-xl border-r border-gold-500/20"
          >
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
            <div className="relative h-full flex flex-col p-4">
              <div className="flex items-center gap-3 h-16 px-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-stage-900" />
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                    剧场管理
                  </h1>
                  <p className="text-xs text-gray-500">Stage Management</p>
                </div>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                          isActive
                            ? 'bg-gold-gradient/20 text-gold-400 shadow-lg shadow-gold-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeMenu"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gold-gradient rounded-r-full"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                        <Icon className="w-5 h-5 relative z-10" />
                        <span className="flex-1 text-sm font-medium relative z-10">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-neon-pink rounded-full text-white">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-gold-500/10 space-y-2">
                <button
                  onClick={handleBackToTV}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-medium">返回电视端</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">退出登录</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-stage-900/50 backdrop-blur-xl border-b border-gold-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-gold-500/20" />
            <div>
              <h2 className="text-sm text-gray-400">欢迎回来</h2>
              <p className="font-display font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                {user?.name || '管理员'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-gold-500/10">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                <User className="w-4 h-4 text-stage-900" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? '超级管理员' : '教师'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-stage-gradient bg-grid-pattern bg-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
