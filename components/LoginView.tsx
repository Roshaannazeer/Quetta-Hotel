
import React, { useState } from 'react';
import { User } from '../types.ts';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Clean inputs: Remove spaces and standardize case for username
    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    // 1. Check for the master 'adilkhan' account (Permissive case for password)
    const isMasterUser = inputUser === 'adilkhan' && inputPass.toLowerCase() === 'adilkhan';
    
    // 2. Check for other users in the database
    const dbUser = users.find(u => u.username === inputUser);
    
    if (isMasterUser) {
      // If user is 'adilkhan', prioritize the specific user object or create one if missing
      const adilObj = dbUser || { 
        id: 'u1', 
        name: 'Adil Khan', 
        role: 'ADMIN' as const, 
        username: 'adilkhan', 
        password: 'adilkhan' 
      };
      onLoginSuccess(adilObj);
    } else if (dbUser && inputPass === (dbUser.password || '123')) {
      // Standard login for other staff members
      onLoginSuccess(dbUser);
    } else {
      setError('INVALID CREDENTIALS. ACCESS DENIED.');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Centered Lock Icon */}
        <div className="w-32 h-32 bg-[#1e293b] rounded-full flex items-center justify-center mb-8 shadow-2xl border border-slate-800">
          <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Header Text */}
        <div className="text-center mb-10">
          <h1 className="text-white text-4xl font-black italic uppercase tracking-wider mb-2">System Login</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-80">Authorized Personnel Only</p>
        </div>

        {/* Main Form Box */}
        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Operator ID</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#1e293b] border-2 border-slate-700 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
              placeholder="Enter Username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Security Code</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-4 text-white focus:border-blue-500 outline-none transition-all font-mono text-lg"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-[#2d1a1a] border border-[#7f1d1d] p-4 rounded-lg flex items-center justify-center gap-3 animate-pulse shadow-lg">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <span className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-5 rounded-xl shadow-xl shadow-blue-900/40 transition-all uppercase tracking-widest italic text-xl mt-4"
          >
            Initialize Session
          </button>
        </form>

        <div className="mt-12 text-center opacity-30">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
            ADIL TECH SOLUTIONS • ENCRYPTED TERMINAL
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
