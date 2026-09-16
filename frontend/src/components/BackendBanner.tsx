import React, { useState } from 'react';
interface BackendBannerProps {
  isOnline: boolean;
}

export const BackendBanner: React.FC<BackendBannerProps> = ({ isOnline }) => {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when backend comes back online
  React.useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <div
      role="alert"
      className="bg-neo-red border-b-4 border-black text-white flex items-center justify-between px-4 py-2"
    >
      <div className="flex items-center gap-2 font-bold text-sm">
        <span className="text-lg">⚠️</span>
        <span>
          <strong>Backend offline</strong> — price updates are paused. Start the{' '}
          <code className="bg-black/30 px-1 rounded">{import.meta.env.VITE_BACKEND}</code> server at{' '}
          <code className="bg-black/30 px-1 rounded">{import.meta.env.VITE_API_URL}</code> to
          resume.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 text-white font-black text-lg leading-none hover:opacity-70 transition-opacity"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
};
