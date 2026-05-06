import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div 
          key={notification.id}
          className="fixed bottom-8 right-8 z-[9999] animate-notification-slide"
        >
          <div className={`relative overflow-hidden min-w-[340px] p-6 rounded-[24px] backdrop-blur-2xl bg-white/80 border border-white/40 shadow-[0_25px_80px_rgba(0,0,0,0.12)] group transition-all duration-300`}>
            {/* Ambient Glow Background */}
            <div className={`absolute -inset-1 opacity-10 group-hover:opacity-20 transition-opacity duration-700 blur-2xl bg-gradient-to-r ${
              notification.type === 'error' ? 'from-red-500 via-orange-400 to-red-600' : 'from-soxenly-green via-leaf-400 to-soxenly-green'
            } animate-gradient-slow`}></div>
            
            <div className="relative flex items-center">
              <div className="pr-4">
                <h4 className="font-display text-[11px] font-extrabold uppercase tracking-[0.25em] text-neutral-400 mb-1 leading-none">
                  {notification.type === 'error' ? 'Alert Status' : 'System Update'}
                </h4>
                <p className={`font-sans text-[13px] font-semibold leading-relaxed tracking-tight ${notification.type === 'error' ? 'text-red-700' : 'text-neutral-900'}`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="ml-auto p-1 text-neutral-300 hover:text-neutral-900 transition-all hover:rotate-90 duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Premium Animated Border Line */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-100/30">
              <div className={`h-full transition-all duration-[5000ms] ease-linear w-0 animate-progress-line ${
                notification.type === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-soxenly-green shadow-[0_0_10px_#1B4332]'
              }`}></div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        @keyframes notification-slide {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes progress-line {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-notification-slide { animation: notification-slide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-progress-line { animation: progress-line 5s linear forwards; }
        .animate-gradient-slow { background-size: 200% 200%; animation: gradient-slow 8s ease infinite; }
      `}} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
