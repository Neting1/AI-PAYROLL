
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PDFUploader from './components/PDFUploader';
import Payslip from './components/Payslip';
import EmployeeDashboard from './components/EmployeeDashboard';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import { KPIStats, PayrollRecord, UserRole } from './types';
import { 
  loginUser, 
  registerUser, 
  getDBPayroll, 
  saveDBPayroll, 
  getDBUsers, 
  deleteUser, 
  deletePayrollRecord,
  DBUser 
} from './services/db';
import { Bell, Search, Menu, ChevronDown, Repeat, Trash2, UserCircle, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [stats, setStats] = useState<KPIStats>({
    totalEmployees: 0,
    averageSalary: 0,
    totalOutstanding: 0,
    totalRequests: 0
  });

  // Load Data via API
  const refreshData = async () => {
    try {
        const pData = await getDBPayroll();
        const uData = await getDBUsers();
        setPayrollData(pData);
        setUsers(uData);
    } catch (e) {
        console.error("Failed to load data from server");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Calculate stats
  useEffect(() => {
    const totalEmp = new Set(payrollData.map(p => p.employeeId)).size;
    const totalGross = payrollData.reduce((acc, curr) => parseFloat(curr.grossSalary.toString()) + acc, 0);
    const avgSal = totalEmp > 0 ? Math.floor(totalGross / payrollData.length) : 0;
    const outstanding = payrollData
      .filter(p => p.status !== 'PAID')
      .reduce((acc, curr) => parseFloat(curr.netSalary.toString()) + acc, 0);

    setStats(prev => ({
      ...prev,
      totalEmployees: totalEmp,
      averageSalary: avgSal,
      totalOutstanding: outstanding
    }));
  }, [payrollData]);

  // Handle Updates
  const handleUploadComplete = async (newRecords: PayrollRecord[]) => {
    // API logic: we save only new records to DB, then fetch updated list
    await saveDBPayroll(newRecords);
    await refreshData();
    setShowUploader(false);
  };

  const handleDeletePayrollRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll record? This action is audited.')) {
      const updatedList = await deletePayrollRecord(id);
      setPayrollData(updatedList);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
        alert("Action Denied: You cannot delete your own account.");
        return;
    }

    if (window.confirm('Are you sure you want to delete this user account?')) {
        const updatedUsers = await deleteUser(userId);
        setUsers(updatedUsers);
    }
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = await loginUser(email, pass);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      setIsAuthenticated(true);
      refreshData(); // Ensure fresh data on login
      return true;
    }
    return false;
  };

  const handleRegister = async (name: string, email: string, pass: string, empId: string): Promise<boolean> => {
    try {
        await registerUser(name, email, pass, empId);
        await refreshData();
        return true;
    } catch (e) {
        throw e;
    }
  };

  const handleLogout = () => {
    if(window.confirm('Confirm logout?')) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('dashboard');
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;

    // EMPLOYEE VIEWS
    if (currentUser.role === UserRole.EMPLOYEE) {
       const myRecords = payrollData.filter(p => p.employeeId === currentUser.employeeId);

       switch (currentView) {
         case 'dashboard':
           return <EmployeeDashboard user={currentUser} records={myRecords} onViewPayslip={setSelectedPayslip} />;
         case 'history':
           return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">My Payslip History</h1>
                {myRecords.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
                        <p className="text-slate-500">No payslip records found linked to Employee ID: <span className="font-mono font-bold text-slate-700">{currentUser.employeeId}</span></p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Period</th>
                                    <th className="px-6 py-4 text-right">Gross Pay</th>
                                    <th className="px-6 py-4 text-right">Tax Paid</th>
                                    <th className="px-6 py-4 text-right">Net Pay</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {myRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{record.payPeriod}</td>
                                        <td className="px-6 py-4 text-right">GH₵ {Number(record.grossSalary).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-red-500">GH₵ {Number(record.paye).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">GH₵ {Number(record.netSalary).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                            onClick={() => setSelectedPayslip(record)}
                                            className="text-emerald-600 hover:underline font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
           );
         case 'profile':
            return (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-slate-100 shadow-sm mt-10">
                    <div className="flex flex-col items-center">
                        <img src={currentUser.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-50 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800">{currentUser.name}</h2>
                        <p className="text-slate-500">{currentUser.position || 'Staff Member'}</p>
                        <div className="mt-6 w-full space-y-4">
                            <div className="flex justify-between p-3 bg-slate-50 rounded">
                                <span className="text-slate-500">Employee ID</span>
                                <span className="font-medium text-slate-800">{currentUser.employeeId}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded">
                                <span className="text-slate-500">Role</span>
                                <span className="font-medium text-slate-800">{currentUser.role}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded">
                                <span className="text-slate-500">Email</span>
                                <span className="font-medium text-slate-800">{currentUser.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
         default:
           return <div>Page not found</div>;
       }
    }

    // ADMIN VIEWS
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            recentPayroll={payrollData} 
            onUploadClick={() => setShowUploader(true)} 
          />
        );
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'employees':
        // User Management View
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Employee Accounts</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage registered user access and details.</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Employee ID</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.position || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                            user.role === UserRole.ADMIN 
                                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{user.employeeId}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                user.id === currentUser.id
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                            }`}
                                            disabled={user.id === currentUser.id}
                                            title={user.id === currentUser.id ? "Cannot delete yourself" : "Delete Account"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No users found.</div>
                    )}
                </div>
            </div>
        );

      case 'payroll':
        return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-slate-800 capitalize">Payroll Records</h1>
               <button 
                onClick={() => setShowUploader(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
               >
                 Add Record
               </button>
             </div>
             <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4 text-right">Taxable Income</th>
                            <th className="px-6 py-4 text-right">Net Salary</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payrollData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No payroll records found. Click "Add Record" to upload a PDF.
                                </td>
                            </tr>
                        ) : (
                            payrollData.map(record => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {record.employeeName}
                                        <div className="text-xs text-slate-400 font-normal">{record.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4">{record.department}</td>
                                    <td className="px-6 py-4 text-right">GH₵ {Number(record.taxableIncome).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">GH₵ {Number(record.netSalary).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                            onClick={() => setSelectedPayslip(record)}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium text-xs border border-emerald-200 hover:bg-emerald-50 px-3 py-1 rounded transition-colors"
                                            >
                                                View Payslip
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePayrollRecord(record.id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
           </div>
        );
      default:
        return <div>Module under construction</div>;
    }
  };

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        userRole={currentUser.role}
        onLogout={handleLogout} 
      />

      <main className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-20 px-8 flex items-center justify-between">
            <div className="md:hidden">
                <Menu className="w-6 h-6 text-slate-500" />
            </div>
            
            <div className="hidden md:flex items-center w-96 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search employees or records..." 
                    className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 text-slate-700"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                </div>
                
                <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3 cursor-pointer group">
                    <img 
                        src={currentUser.avatarUrl} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover" 
                    />
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{currentUser.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </div>
            </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {renderContent()}
        </div>
      </main>

      {showUploader && (
        <PDFUploader 
            onUploadComplete={handleUploadComplete} 
            onCancel={() => setShowUploader(false)} 
            users={users} 
        />
      )}

      {selectedPayslip && (
        <Payslip 
            record={selectedPayslip} 
            onClose={() => setSelectedPayslip(null)} 
        />
      )}
    </div>
  );
};

export default App;
