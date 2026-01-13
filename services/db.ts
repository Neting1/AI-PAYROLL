
import { User, PayrollRecord, UserRole } from '../types';

export interface DBUser extends User {
  email: string;
  password?: string; 
  employeeId?: string;
}

const API_URL = 'http://localhost:5000/api';
const OFFLINE_USERS_KEY = 'twinhill_users';
const OFFLINE_PAYROLL_KEY = 'twinhill_payroll';

// Helper to simulate network delay for realism in offline mode
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- LocalStorage Helpers (Fallback) ---

const getLocalUsers = (): DBUser[] => {
    try {
        const data = localStorage.getItem(OFFLINE_USERS_KEY);
        if (data) return JSON.parse(data);
    } catch (e) { console.error('Error parsing local users', e); }
    
    // Default Admin if empty
    const defaultAdmin: DBUser = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@twinhill.com',
        password: 'admin',
        role: UserRole.ADMIN,
        employeeId: 'ADMIN01',
        position: 'IT Administrator',
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0d9488&color=fff'
    };
    
    localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
};

const getLocalPayroll = (): PayrollRecord[] => {
    try {
        const data = localStorage.getItem(OFFLINE_PAYROLL_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
};

// --- Service Methods ---

export const initDB = () => {
    // Ensure default data exists in offline mode
    getLocalUsers();
};

export const getDBUsers = async (): Promise<DBUser[]> => {
  try {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (e) {
    console.warn('[DB] Backend connection failed. Switching to Offline Mode (LocalStorage).');
    return getLocalUsers();
  }
};

export const getDBPayroll = async (): Promise<PayrollRecord[]> => {
  try {
    const res = await fetch(`${API_URL}/payroll`);
    if (!res.ok) throw new Error('Failed to fetch payroll');
    return await res.json();
  } catch (e) {
    console.warn('[DB] Backend connection failed. Switching to Offline Mode (LocalStorage).');
    return getLocalPayroll();
  }
};

export const saveDBPayroll = async (records: PayrollRecord[]): Promise<PayrollRecord[]> => {
  try {
    const res = await fetch(`${API_URL}/payroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    });
    if (!res.ok) throw new Error('Failed to save payroll');
    return await res.json();
  } catch (e) {
    console.warn('[DB] Backend offline. Saving to LocalStorage.');
    await delay(500);
    const current = getLocalPayroll();
    // Prepend new records
    const updated = [...records, ...current];
    localStorage.setItem(OFFLINE_PAYROLL_KEY, JSON.stringify(updated));
    return updated;
  }
};

export const registerUser = async (name: string, email: string, pass: string, employeeId: string): Promise<boolean> => {
  const role = employeeId.toUpperCase().startsWith('ADMIN') ? UserRole.ADMIN : UserRole.EMPLOYEE;
  
  const newUser: DBUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    name,
    email,
    password: pass,
    role,
    employeeId: employeeId.toUpperCase(),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
    position: 'Staff Member'
  };

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return true;
  } catch (e: any) {
    // If it's a real validation error from server, rethrow.
    // If it's a fetch error, fallback.
    if (e.message !== 'Failed to fetch' && !e.message.includes('NetworkError') && e.name !== 'TypeError') {
         // It might be a logical error from server (e.g. duplicate email)
         // However, if the server is unreachable, we can't distinguish well without status codes.
         // fetch throws TypeError on network failure.
    }

    if (e.name === 'TypeError' || e.message.includes('Failed to fetch')) {
        console.warn('[DB] Backend offline. Registering locally.');
        await delay(800);
        const users = getLocalUsers();
        if (users.find(u => u.email === email || u.employeeId === employeeId)) {
            throw new Error('User already exists (Offline check)');
        }
        users.push(newUser);
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
        return true;
    }
    throw e;
  }
};

export const loginUser = async (email: string, pass: string): Promise<DBUser | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });
    
    // If server responds with 401, we want to return null (invalid creds), NOT fallback.
    if (res.status === 401) return null;
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    if (data.success) return data.user;
    return null;
  } catch (e: any) {
    // Only fallback on Network Error
    if (e.name === 'TypeError' || e.message.includes('Failed to fetch')) {
        console.warn('[DB] Backend offline. Logging in locally.');
        await delay(600);
        const users = getLocalUsers();
        const user = users.find(u => u.email === email && u.password === pass);
        return user || null;
    }
    return null;
  }
};

export const resetUserPassword = async (email: string, newPass: string): Promise<boolean> => {
    try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword: newPass })
        });
        const data = await res.json();
        return data.success;
    } catch (e: any) {
        if (e.name === 'TypeError' || e.message.includes('Failed to fetch')) {
            console.warn('[DB] Backend offline. Resetting locally.');
            const users = getLocalUsers();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex > -1) {
                users[userIndex].password = newPass;
                localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
                return true;
            }
        }
        return false;
    }
};

export const deleteUser = async (userId: string): Promise<DBUser[]> => {
    try {
        const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Delete failed");
        return await res.json();
    } catch (e: any) {
        if (e.name === 'TypeError' || e.message.includes('Failed to fetch')) {
            console.warn('[DB] Backend offline. Deleting locally.');
            const users = getLocalUsers().filter(u => u.id !== userId);
            localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
            return users;
        }
        return [];
    }
};

export const deletePayrollRecord = async (id: string): Promise<PayrollRecord[]> => {
    try {
        const res = await fetch(`${API_URL}/payroll/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Delete failed");
        return await res.json();
    } catch (e: any) {
        if (e.name === 'TypeError' || e.message.includes('Failed to fetch')) {
            console.warn('[DB] Backend offline. Deleting locally.');
            const records = getLocalPayroll().filter(r => r.id !== id);
            localStorage.setItem(OFFLINE_PAYROLL_KEY, JSON.stringify(records));
            return records;
        }
        return [];
    }
};
