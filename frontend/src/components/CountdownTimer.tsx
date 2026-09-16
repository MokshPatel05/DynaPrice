import React from 'react';

interface CountdownTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  secondsLeft,
  totalSeconds,
}) => {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const label = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 bg-white border-2 border-black px-3 py-1.5 shadow-neo-sm">
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Next Update</span>
        <span className="text-sm font-black text-black leading-tight">in {label}</span>
      </div>
    </div>
  );
};
