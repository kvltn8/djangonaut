import { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'info') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const toast = { info: (m) => push(m), error: (m) => push(m, 'error'), success: (m) => push(m, 'success') };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 items-center px-4 w-full pointer-events-none" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto px-5 py-3 text-body-md shadow-soft max-w-md ${t.tone === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-surface'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
