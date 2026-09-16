import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: string; // top border accent color class e.g. 'border-t-neo-yellow'
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  className = '',
  accent,
}) => {
  return (
    <div
      className={`
        bg-white border-[3px] border-black shadow-neo
        ${accent ? `border-t-[4px] ${accent}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
