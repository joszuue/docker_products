'use client';

interface StatusMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  errors?: Record<string, string[]>;
  onClose?: () => void;
}

export default function StatusMessage({
  type,
  message,
  errors,
  onClose,
}: StatusMessageProps) {
  if (!message && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: (
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: (
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[type];

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} mb-6 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {styles.icon}
          <div>
            <p className="font-medium text-sm">{message}</p>
            {errors && Object.keys(errors).length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                {Object.entries(errors).map(([field, fieldErrors]) =>
                  fieldErrors.map((err, i) => (
                    <li key={`${field}-${i}`}>{err}</li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
