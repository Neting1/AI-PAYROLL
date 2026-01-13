import React, { useState } from 'react';
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, Loader2, User, Hash, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { resetUserPassword } from '../services/db';
import { requestOtp, verifyOtp } from '../services/authService';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (name: string, email: string, pass: string, empId: string) => Promise<boolean>;
}

type ViewMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('LOGIN');
  
  // Forgot Password Steps: 1 = Email, 2 = Verify Code, 3 = New Password
  const [resetStep, setResetStep] = useState<number>(1);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('infotech.peadato@gmail.com');
  const [password, setPassword] = useState('password');
  const [employeeId, setEmployeeId] = useState('');
  
  // New Password state for Reset flow
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateEmail = (email: string) => {
    // Strict email validation regex
    const re = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|ymail\.com)$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!validateEmail(email)) {
        setError('Invalid format. Only gmail.com, outlook.com, and ymail.com are accepted.');
        setIsLoading(false);
        return;
    }

    try {
      if (viewMode === 'LOGIN') {
        setTimeout(async () => {
            const success = await onLogin(email, password);
            if (!success) {
                setError('Invalid credentials. Please check your email and password.');
                setIsLoading(false);
            }
        }, 800);

      } else if (viewMode === 'REGISTER') {
        if (!name || !employeeId) {
            setError('All fields are required.');
            setIsLoading(false);
            return;
        }
        
        setTimeout(async () => {
            try {
                const success = await onRegister(name, email, password, employeeId);
                if (success) {
                    setSuccessMsg('Account created successfully! Please log in.');
                    setViewMode('LOGIN'); 
                    setPassword('');
                } else {
                     setError('Registration failed. Email might be in use.');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred during registration.');
            }
            setIsLoading(false);
        }, 800);

      } else if (viewMode === 'FORGOT_PASSWORD') {
        
        // STEP 1: Request OTP from API Backend
        if (resetStep === 1) {
            try {
                await requestOtp(email);
                setResetStep(2);
                setSuccessMsg(`Verification code sent to ${email}`);
            } catch (err: any) {
                setError(err.message || 'Failed to send verification code. Please try again.');
            }
            setIsLoading(false);
            return;
        }

        // STEP 2: Verify OTP with API Backend
        if (resetStep === 2) {
            try {
                const isValid = await verifyOtp(email, otpInput);
                if (isValid) {
                    setResetStep(3);
                    setSuccessMsg('Code verified. Set your new password.');
                } else {
                     setError('Invalid or expired verification code.');
                }
            } catch (err: any) {
                setError(err.message || 'Verification failed.');
            }
            setIsLoading(false);
            return;
        }

        // STEP 3: Set New Password
        if (resetStep === 3) {
            if (!newPassword || newPassword.length < 6) {
                setError('Password must be at least 6 characters long.');
                setIsLoading(false);
                return;
            }
            setTimeout(() => {
                const success = resetUserPassword(email, newPassword);
                if (success) {
                    setSuccessMsg('Password reset successfully! You can now log in.');
                    setViewMode('LOGIN');
                    setPassword(''); 
                    setNewPassword('');
                    setResetStep(1); 
                    setOtpInput('');
                } else {
                    setError('Error resetting password. User not found.');
                }
                setIsLoading(false);
            }, 1200);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleSwitchMode = (mode: ViewMode) => {
    setViewMode(mode);
    setError('');
    setSuccessMsg('');
    setResetStep(1);
    setOtpInput('');
    setNewPassword('');
    
    if (mode === 'REGISTER') {
        setEmail('');
        setPassword('');
    } else if (mode === 'LOGIN') {
        setPassword('');
    }
  };

  const getHeaderTitle = () => {
      if (viewMode === 'FORGOT_PASSWORD') {
          if (resetStep === 1) return 'Reset Password';
          if (resetStep === 2) return 'Verify Identity';
          if (resetStep === 3) return 'New Credentials';
      }
      switch(viewMode) {
          case 'LOGIN': return 'Payroll Management System';
          case 'REGISTER': return 'Create Your Account';
          default: return 'Payroll System';
      }
  };

  const getButtonText = () => {
    if (viewMode === 'FORGOT_PASSWORD') {
        if (resetStep === 1) return 'Send Verification Code';
        if (resetStep === 2) return 'Verify Code';
        if (resetStep === 3) return 'Reset Password';
    }
    switch(viewMode) {
        case 'LOGIN': return 'Sign In';
        case 'REGISTER': return 'Create Account';
        default: return 'Submit';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center transition-all duration-300 relative">
          {viewMode !== 'LOGIN' && (
              <button 
                onClick={() => handleSwitchMode('LOGIN')}
                className="absolute left-4 top-4 text-emerald-100 hover:text-white transition-colors"
                title="Back to Login"
              >
                  <ArrowLeft className="w-6 h-6" />
              </button>
          )}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            {viewMode === 'FORGOT_PASSWORD' ? (
                 resetStep === 2 ? <ShieldCheck className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />
            ) : (
                 <Briefcase className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Twin Hill Enterprise</h1>
          <p className="text-emerald-100 mt-2 text-sm">{getHeaderTitle()}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-sm text-green-700 animate-in fade-in slide-in-from-top-2">
                 <Briefcase className="w-4 h-4 shrink-0" />
                 {successMsg}
              </div>
            )}

            {/* REGISTER FIELDS */}
            {viewMode === 'REGISTER' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                            placeholder="John Doe"
                            required
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID / Staff ID</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input 
                            type="text" 
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                            placeholder="EMP001"
                            required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 ml-1">Use 'ADMIN' prefix for admin privileges</p>
                    </div>
                </>
            )}

            {/* SHARED EMAIL FIELD (Disabled during OTP/Reset steps) */}
            {!(viewMode === 'FORGOT_PASSWORD' && resetStep > 1) && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {viewMode === 'FORGOT_PASSWORD' ? 'Enter Email Address' : 'Email Address'}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                        placeholder="user@gmail.com"
                        required
                        readOnly={viewMode === 'FORGOT_PASSWORD' && resetStep > 1}
                        />
                    </div>
                    {viewMode !== 'FORGOT_PASSWORD' && (
                        <p className="text-[10px] text-slate-400 mt-1 ml-1">Allowed: gmail.com, outlook.com, ymail.com</p>
                    )}
                </div>
            )}

            {/* FORGOT PASSWORD: STEP 2 - OTP */}
            {viewMode === 'FORGOT_PASSWORD' && resetStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                     <div className="text-center">
                        <p className="text-sm text-slate-600">Enter the 6-digit code sent to <span className="font-semibold">{email}</span></p>
                     </div>
                     
                     <div className="relative">
                        <ShieldCheck className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input 
                        type="text" 
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 text-center"
                        placeholder="000000"
                        required
                        />
                     </div>
                </div>
            )}

            {/* FORGOT PASSWORD: STEP 3 - NEW PASSWORD */}
            {viewMode === 'FORGOT_PASSWORD' && resetStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Enter new password"
                        required
                        />
                    </div>
                </div>
            )}

            {/* NORMAL PASSWORD FIELD (Login/Register) */}
            {viewMode !== 'FORGOT_PASSWORD' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                </div>
            )}

            {viewMode === 'LOGIN' && (
                <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-slate-500">Remember me</span>
                </label>
                <button 
                    type="button"
                    onClick={() => handleSwitchMode('FORGOT_PASSWORD')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium outline-none"
                >
                    Forgot password?
                </button>
                </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {getButtonText()}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {viewMode !== 'FORGOT_PASSWORD' && (
             <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    {viewMode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => handleSwitchMode(viewMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                        className="text-emerald-600 font-semibold hover:underline outline-none"
                    >
                        {viewMode === 'LOGIN' ? "Sign up" : "Log in"}
                    </button>
                </p>
             </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Twin Hill Enterprise. All rights reserved.
      </p>
    </div>
  );
};

export default Login;