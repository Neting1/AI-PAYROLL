import React from 'react';
import { PayrollRecord, User } from '../types';
import { Download, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmployeeDashboardProps {
  user: User;
  records: PayrollRecord[];
  onViewPayslip: (record: PayrollRecord) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, records, onViewPayslip }) => {
  // Sort records by date (assuming simple chronological order logic for demo)
  // In a real app, parse date strings
  const sortedRecords = [...records].slice(0, 6); 
  const latest = sortedRecords[0];

  const chartData = [...records].reverse().map(r => ({
    name: r.payPeriod.split(' ')[0], // Month name
    net: r.netSalary,
    gross: r.grossSalary
  }));

  if (!latest) {
    return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-100 p-6 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800">No Payroll Records Found</h3>
            <p className="text-slate-500 mt-2">Your payslips will appear here once payroll is processed.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Welcome Section */}
       <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 text-sm mt-1">Here is your latest pay summary for <span className="font-semibold text-slate-700">{latest.payPeriod}</span>.</p>
          </div>
          <button 
            onClick={() => onViewPayslip(latest)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg shadow-emerald-200"
          >
            <Download className="w-4 h-4" />
            Download Latest Payslip
          </button>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white shadow-lg shadow-emerald-200">
             <div className="flex items-center gap-3 mb-2 opacity-90">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Net Pay</span>
             </div>
             <div className="text-3xl font-bold">GH₵ {latest.netSalary.toLocaleString()}</div>
             <div className="mt-4 text-xs bg-white/20 inline-block px-2 py-1 rounded">
                Paid on 25th {latest.payPeriod.split(' ')[0]}
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2 text-slate-500">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Gross Income</span>
             </div>
             <div className="text-2xl font-bold text-slate-800">GH₵ {latest.grossSalary.toLocaleString()}</div>
             <p className="text-xs text-slate-400 mt-2">Includes Basic + Allowances</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2 text-slate-500">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Tax Paid (YTD)</span>
             </div>
             {/* Mock YTD calculation */}
             <div className="text-2xl font-bold text-slate-800">GH₵ {(records.reduce((acc, r) => acc + r.paye, 0)).toLocaleString()}</div>
             <p className="text-xs text-slate-400 mt-2">Total GRA Deductions</p>
          </div>
       </div>

       {/* Charts & History */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <h3 className="font-semibold text-slate-800 mb-6">Income History</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                       contentStyle={{border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} name="Net Pay" />
                    <Line type="monotone" dataKey="gross" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gross Pay" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Recent List */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Payslip History</h3>
             </div>
             <div className="divide-y divide-slate-100">
                {records.map(record => (
                   <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div>
                         <p className="font-medium text-slate-700">{record.payPeriod}</p>
                         <p className="text-xs text-slate-400">GH₵ {record.netSalary.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => onViewPayslip(record)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                         <Download className="w-4 h-4" />
                      </button>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};
export default EmployeeDashboard;