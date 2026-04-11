import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <ChefHat className="w-20 h-20 text-text-muted/20 mx-auto mb-4" />
        <h1 className="font-heading text-4xl font-extrabold mb-2">404</h1>
        <p className="text-lg text-text-muted mb-6">Aradığınız sayfa bulunamadı.</p>
        <Link href="/" className="inline-flex px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dark transition-all">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
