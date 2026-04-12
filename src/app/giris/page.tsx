'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md bg-surface-container-low rounded-3xl border border-border-light/40 p-10 editorial-shadow">
        <div className="text-center mb-10">
          <ChefHat className="w-12 h-12 text-primary-dark mx-auto mb-4" />
          <span className="block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-3">
            ChefMate
          </span>
          <h1 className="font-heading text-4xl font-extrabold tracking-tighter leading-tight">Tekrar Hoşgeldin</h1>
          <p className="text-sm text-text-secondary mt-2">Mutfağına geri dön.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm font-medium">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-card border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="örnek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
                placeholder="Şifreniz"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary-container text-text font-heading font-extrabold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Hesabın yok mu?{' '}
          <Link href="/kayit" className="text-primary-dark font-bold hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}
