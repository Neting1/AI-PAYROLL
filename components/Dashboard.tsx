import React from 'react';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  FileInput, 
  TrendingUp,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { KPIStats, ChartData, PayrollRecord } from '../types';
import { CHART_DATA_HISTORY, CHART_DATA_REQUESTS } from '../constants';

interface DashboardProps {
  stats: KPIStats;
  recentPayroll: PayrollRecord[];
  onUploadClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, recentPayroll, onUploadClick }) => {
  return (
    <div className="space-y-6">
      {/* Header with Upload CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of Twin Hill Enterprise payroll status.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={onUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-md shadow-emerald-200"
          >
            <FileInput className="w-4 h-4" />
            Upload New Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Employees" 
          value={stats.totalEmployees.toString()} 
          change="+2 this month" 
          icon={Users} 
          color="blue" 
        />
        <KPICard 
          title="Average Salary" 
          value={`GH₵ ${stats.averageSalary.toLocaleString()}`} 
          change="+5.2% vs last month" 
          icon={DollarSign} 
          color="emerald" 
        />
        <KPICard 
          title="Total Outstanding" 
          value={`GH₵ ${stats.totalOutstanding.toLocaleString()}`} 
          change="Due in 5 days" 
          icon={AlertCircle} 
          color="amber" 
        />
        <KPICard 
          title="New Requests" 
          value={stats.totalRequests.toString()} 
          change="Requires attention" 
          icon={FileInput} 
          color="purple" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Payroll History</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Last 6 Months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Requests Trend</h3>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA_REQUESTS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Payroll Entries</h3>
          <button className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4 text-right">Gross Pay</th>
                <th className="px-6 py-4 text-right">Tax (GRA)</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayroll.slice(0, 5).map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{record.employeeName}</td>
                  <td className="px-6 py-4 text-slate-500">{record.position}</td>
                  <td className="px-6 py-4 text-right font-medium">GH₵ {record.grossSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-500">- GH₵ {record.paye.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">GH₵ {record.netSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Cards
const KPICard = ({ title, value, change, icon: Icon, color }: any) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className="text-emerald-600 font-medium">{change.includes('+') || change.includes('vs') ? change : ''}</span>
        <span className="text-slate-400 ml-1">{!change.includes('+') && !change.includes('vs') ? change : ''}</span>
      </div>
    </div>
  );
};

export default Dashboard;