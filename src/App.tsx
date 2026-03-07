import { useState } from 'react';
import Chat from './components/Chat';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleStart = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-[#130922] flex flex-col items-center justify-center z-50 scanlines">
        <button 
          onClick={handleStart}
          className="px-8 py-4 bg-[#e028e0] hover:bg-[#e028e0]/80 text-white font-bold tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(224,40,224,0.5)] hover:shadow-[0_0_30px_rgba(224,40,224,0.8)] animate-pulse"
        >
          Initialize System
        </button>
        <p className="mt-6 text-[#20e0e0]/60 font-mono text-xs uppercase tracking-widest">
          Requires Fullscreen (F11)
        </p>
      </div>
    );
  }

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <Chat />
      )}
    </>
  );
}
