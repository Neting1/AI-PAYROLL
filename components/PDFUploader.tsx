
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { processPayrollDocument } from '../services/payrollService';
import { PayrollRecord } from '../types';
import { DBUser } from '../services/db';

interface PDFUploaderProps {
  onUploadComplete: (newRecords: PayrollRecord[]) => void;
  onCancel: () => void;
  users: DBUser[];
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadComplete, onCancel, users }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out admins from the selection list, typically payroll is for employees
  const employeeList = users.filter(u => u.role !== 'ADMIN' || u.employeeId?.startsWith('ADMIN') === false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }
    setFile(file);
    setStatus('IDLE');
  };

  const handleProcess = async () => {
    if (!file || !selectedUserId) return;
    
    const targetUser = users.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    try {
      setStatus('PROCESSING');
      // Execute processing
      const records = await processPayrollDocument(file, targetUser);
      setStatus('SUCCESS');
      
      // Brief pause to show success state before closing
      setTimeout(() => {
          onUploadComplete(records);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Upload Payroll Document</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Processing Complete</h4>
              <p className="text-slate-500 mt-2">Payslip has been generated and stored securely.</p>
            </div>
          ) : (
            <>
              {/* Employee Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <select 
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 appearance-none"
                    disabled={status === 'PROCESSING'}
                  >
                    <option value="">-- Choose an employee --</option>
                    {employeeList.length > 0 ? (
                      employeeList.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.employeeId})
                        </option>
                      ))
                    ) : (
                      <option disabled>No employees found</option>
                    )}
                  </select>
                </div>
                {employeeList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    System Notice: Please register employee accounts before uploading payroll data.
                  </p>
                )}
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-emerald-600 mb-3" />
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-400 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag PDF</p>
                  </>
                )}
              </div>

              {status === 'PROCESSING' && (
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2 text-slate-600">
                        <span>Encrypted Processing...</span>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full"></div>
                    </div>
                </div>
              )}
              
              {status === 'ERROR' && (
                 <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Error processing file. Please ensure it is a valid PDF.
                 </div>
              )}

              {status !== 'PROCESSING' && (
                 <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleProcess}
                        disabled={!file || !selectedUserId}
                        className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors shadow-lg shadow-emerald-200 ${
                            !file || !selectedUserId ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        Upload & Process
                    </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
