'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
        <p className="text-text-muted mb-6">Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
        <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
          <RotateCcw className="w-4 h-4" /> Tekrar Dene
        </button>
      </div>
    </div>
  );
}
