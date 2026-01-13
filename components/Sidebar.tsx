import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  PieChart,
  Briefcase,
  UserCircle
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, onLogout }) => {
  
  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: FileText },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'My Payslips', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  const menuItems = userRole === UserRole.ADMIN ? adminItems : employeeItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex">
      {/* Brand */}
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <div className="flex items-center gap-2 text-emerald-600">
          <Briefcase className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-slate-800">Twin Hill</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-slate-400 font-medium uppercase mb-1">System Status</p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-600 font-semibold">Online & Secure</span>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
        <div className="mt-4 text-[10px] text-slate-300 text-center">
            Designed by Ing. Oduro Thompson
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;