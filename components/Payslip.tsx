import React from 'react';
import { PayrollRecord } from '../types';
import { Download, X } from 'lucide-react';

interface PayslipProps {
  record: PayrollRecord;
  onClose: () => void;
}

const Payslip: React.FC<PayslipProps> = ({ record, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-3xl shadow-2xl rounded-sm print:shadow-none print:w-full">
        {/* Toolbar - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 print:hidden rounded-t-sm">
          <h3 className="font-semibold text-slate-700">Payslip Preview</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download / Print PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="p-8 md:p-12 print:p-0" id="payslip-content">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Twin Hill Enterprise</h1>
              <p className="text-sm text-slate-500 mt-1">Accra, Ghana</p>
              <p className="text-sm text-slate-500">info@twinhill.com | +233 20 000 0000</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-slate-300 uppercase tracking-widest">Payslip</h2>
              <p className="text-emerald-600 font-bold mt-2">{record.payPeriod}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-lg print:bg-transparent print:p-0">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Employee Name</p>
              <p className="font-bold text-slate-800 text-lg">{record.employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Employee ID</p>
              <p className="font-mono text-slate-700">{record.employeeId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Department</p>
              <p className="text-slate-700">{record.department}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Position</p>
              <p className="text-slate-700">{record.position}</p>
            </div>
          </div>

          {/* Calculations Table */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Earnings */}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-4">Earnings</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-medium text-slate-800">GH₵ {record.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Allowances</span>
                  <span className="font-medium text-slate-800">GH₵ {record.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                  <span className="font-bold text-slate-700">Total Gross Pay</span>
                  <span className="font-bold text-slate-900">GH₵ {record.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-700 uppercase border-b border-red-200 pb-2 mb-4">Deductions</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">SSNIT (5.5%)</span>
                  <span className="font-medium text-slate-800">GH₵ {record.ssnitEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Income Tax (PAYE)</span>
                  <span className="font-medium text-slate-800">GH₵ {record.paye.toLocaleString()}</span>
                </div>
                {record.deductions > 0 && (
                   <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Other Deductions</span>
                    <span className="font-medium text-slate-800">GH₵ {record.deductions.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                  <span className="font-bold text-slate-700">Total Deductions</span>
                  <span className="font-bold text-slate-900">GH₵ {(record.ssnitEmployee + record.paye + record.deductions).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Highlight */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 flex justify-between items-center print:border-slate-300 print:bg-white">
            <div>
              <p className="text-emerald-800 text-sm font-medium uppercase">Net Salary Payable</p>
              <p className="text-xs text-emerald-600">Transfer to Bank</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-emerald-700">GH₵ {record.netSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">This is a system generated payslip and does not require a signature.</p>
            <p className="text-[10px] text-slate-300 mt-1">Generated by Twin Hill Enterprise Payroll System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payslip;