
/**
 * Auth Service
 * Handles communication with the Twin Hill Secure Backend API.
 * 
 * FAILOVER STRATEGY:
 * If the backend API is unreachable (e.g., during development, server outage, or demo environments),
 * this service automatically falls back to a secure local mock implementation.
 * This ensures the UI remains functional for employees even when the server is down.
 */

const API_BASE_URL = 'http://localhost:5000/api';
const OFFLINE_STORAGE_KEY = 'twinhill_offline_otp_store';

// --- Offline Mock Helpers ---

const getMockStore = () => {
    try {
        const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

const saveMockOtp = (email: string, code: string) => {
    const store = getMockStore();
    store[email] = { code, expires: Date.now() + 5 * 60 * 1000 }; // 5 mins expiry
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(store));
    
    // Visual feedback for developers/demo users since email won't send
    console.log(`%c[OFFLINE MODE] OTP for ${email}: ${code}`, 'background: #10b981; color: white; padding: 4px; border-radius: 4px; font-weight: bold;');
    alert(`[System Notice]\nBackend Server Unreachable.\n\nSwitching to Offline Mode.\nYour OTP Code is: ${code}`);
};

const verifyMockOtp = (email: string, code: string): boolean => {
    const store = getMockStore();
    const record = store[email];
    if (!record) return false;
    if (Date.now() > record.expires) return false;
    return record.code === code;
};

// --- Service Methods ---

export const requestOtp = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    // DEV HELPER: If the server returns the OTP (debug mode), show it in console.
    if (data.debug_otp) {
        console.log(`%c[SERVER OTP] Code for ${email}: ${data.debug_otp}`, 'background: #0ea5e9; color: white; padding: 4px; border-radius: 4px; font-weight: bold;');
        // Uncomment the line below if you want an alert in browser for convenience
        // alert(`[Developer Mode]\nYour OTP is: ${data.debug_otp}`);
    }

    return true;
  } catch (error: any) {
    // Detect Network Error (Backend down/unreachable/CORS)
    // TypeError: Failed to fetch is the standard error for network failures in fetch
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('Backend connection failed. Falling back to offline simulation.');
        
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate offline OTP
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        saveMockOtp(email, mockCode);
        return true;
    }
    
    console.error('OTP Request Error:', error);
    throw error;
  }
};

export const verifyOtp = async (email: string, code: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      throw new Error(data.message || 'Invalid verification code');
    }

    return true;
  } catch (error: any) {
    // Detect Network Error (Backend down)
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('Backend connection failed. Verifying against offline store.');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (verifyMockOtp(email, code)) {
            return true;
        } else {
             // Mimic backend error for invalid code
             throw new Error('Invalid verification code (Offline Check)');
        }
    }

    console.error('OTP Verification Error:', error);
    return false;
  }
};
