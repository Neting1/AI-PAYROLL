import React from 'react';
import { Save } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage company details and tax configurations.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Company Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input type="text" defaultValue="Twin Hill Enterprise" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax Identification Number (TIN)</label>
                    <input type="text" defaultValue="P0012345678" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
                    <input type="text" defaultValue="12 Independence Avenue, Accra, Ghana" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </div>

        {/* Statutory Configurations */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Statutory Configurations (Ghana)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SSNIT Employee (%)</label>
                    <div className="relative">
                        <input type="number" defaultValue="5.5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" readOnly />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Tier 1 & 2 Contribution</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SSNIT Employer (%)</label>
                    <div className="relative">
                        <input type="number" defaultValue="13.0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" readOnly />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                    </div>
                     <p className="text-[10px] text-slate-400 mt-1">Employer Contribution</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GRA Tax Method</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option>Graduated Rates (Standard)</option>
                        <option>Flat Rate</option>
                    </select>
                </div>
            </div>
            
            <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-800 mb-3">GRA Monthly Tax Bands (2023/24)</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 grid grid-cols-2 gap-2 font-mono">
                    <div className="flex justify-between"><span>First GH₵ 490</span> <span>0%</span></div>
                    <div className="flex justify-between"><span>Next GH₵ 110</span> <span>5%</span></div>
                    <div className="flex justify-between"><span>Next GH₵ 130</span> <span>10%</span></div>
                    <div className="flex justify-between"><span>Next GH₵ 3,000</span> <span>17.5%</span></div>
                    <div className="flex justify-between"><span>Next GH₵ 16,395</span> <span>25%</span></div>
                    <div className="flex justify-between"><span>Next GH₵ 29,875</span> <span>30%</span></div>
                    <div className="flex justify-between"><span>Exceeding GH₵ 50,000</span> <span>35%</span></div>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
             <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-md">
                <Save className="w-4 h-4" />
                Save Changes
             </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;