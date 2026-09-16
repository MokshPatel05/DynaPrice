import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NeoButton } from './NeoButton';
import { CountdownTimer } from './CountdownTimer';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  isBackendOnline: boolean;
  secondsLeft: number;
  totalSeconds: number;
  onSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBackendOnline,
  secondsLeft,
  totalSeconds,
  onSimulate,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-neo-yellow border-b-4 border-black shadow-neo-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo / App name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black flex items-center justify-center border-2 border-black">
            <span className="text-neo-yellow font-black text-sm select-none">DP</span>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black leading-none">
              DynaPrice
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 leading-none">
              ML Dynamic Pricing Demo
            </p>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Backend status pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-black text-xs uppercase tracking-wide ${
              isBackendOnline ? 'bg-neo-green text-white' : 'bg-neo-red text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-white' : 'bg-white'
              } ${isBackendOnline ? 'animate-pulse' : ''}`}
            />
            {isBackendOnline ? 'Live' : 'Backend Offline'}
          </div>

          {/* Countdown */}
          <CountdownTimer secondsLeft={secondsLeft} />

          {/* Simulate button */}
          <NeoButton variant="secondary" size="md" onClick={onSimulate} id="simulate-btn">
            ⚡ Simulate Shoppers
          </NeoButton>
          
          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-4 border-l-2 border-black ml-2">
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline-block">
              {user?.name || 'User'}
            </span>
            <NeoButton variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </NeoButton>
          </div>
        </div>
      </div>
    </header>
  );
};
