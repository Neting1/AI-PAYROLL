import React from 'react';
import { FileText, Download, Filter } from 'lucide-react';

const ReportsView: React.FC = () => {
  const reports = [
    { id: 1, name: 'Payroll Summary - October 2023', type: 'PDF', date: '25 Oct 2023', size: '2.4 MB' },
    { id: 2, name: 'GRA Tax Return - October 2023', type: 'CSV', date: '26 Oct 2023', size: '156 KB' },
    { id: 3, name: 'SSNIT Contributions - October 2023', type: 'PDF', date: '26 Oct 2023', size: '1.2 MB' },
    { id: 4, name: 'Payroll Summary - September 2023', type: 'PDF', date: '25 Sep 2023', size: '2.3 MB' },
    { id: 5, name: 'GRA Tax Return - September 2023', type: 'CSV', date: '26 Sep 2023', size: '145 KB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Reports Center</h1>
           <p className="text-slate-500 text-sm mt-1">Download and manage monthly payroll reports.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter Date
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Report Name</th>
              <th className="px-6 py-4">Generated On</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-800">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{report.date}</td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {report.type}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{report.size}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 justify-end w-full">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;