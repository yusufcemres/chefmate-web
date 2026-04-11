import { ChefHat } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-center">
        <ChefHat className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="text-sm text-text-muted">Yükleniyor...</p>
      </div>
    </div>
  );
}
