import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Calendar, 
  Activity, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-textSecondary hover:bg-white/5 hover:text-white'
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </NavLink>
);

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 p-6 flex flex-col glass-card rounded-none border-y-0 border-l-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow">
            <Trophy className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SPORTS<span className="text-primary">HUB</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/tournaments" icon={Trophy} label="Tournaments" />
          <SidebarItem to="/teams" icon={Users} label="Teams" />
          <SidebarItem to="/fixtures" icon={Calendar} label="Fixtures" />
          <SidebarItem to="/live" icon={Activity} label="Live Scores" />
          <SidebarItem to="/leaderboard" icon={BarChart3} label="Leaderboards" />
          {/*<SidebarItem to="/analytics" icon={BarChart3} label="Analytics" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />*/}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img 
              src={user?.avatar || 'https://via.placeholder.com/40'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-primary/20"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-textSecondary truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
