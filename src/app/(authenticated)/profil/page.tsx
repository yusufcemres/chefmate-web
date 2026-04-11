'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { User, Mail, ChefHat, Heart, BookOpen, LogOut, Settings } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  _count?: {
    favorites: number;
    ratings: number;
    collections: number;
  };
}

export default function ProfilePage() {
  const { isAuthenticated, user, logout, init } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }
    api.get<UserProfile>('/users/me')
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <h1 className="font-heading text-3xl font-extrabold mb-8">Profilim</h1>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse h-24 rounded-2xl bg-surface-low" />
          <div className="animate-pulse h-40 rounded-2xl bg-surface-low" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* User card */}
          <div className="bg-card rounded-2xl border border-border-light p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg">{profile.displayName}</h2>
              <p className="text-sm text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {profile.email}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Üyelik: {new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Stats */}
          {profile._count && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border-light p-4 text-center">
                <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-bold text-xl">{profile._count.favorites}</p>
                <p className="text-xs text-text-muted">Favori</p>
              </div>
              <div className="bg-card rounded-2xl border border-border-light p-4 text-center">
                <ChefHat className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-bold text-xl">{profile._count.ratings}</p>
                <p className="text-xs text-text-muted">Değerlendirme</p>
              </div>
              <div className="bg-card rounded-2xl border border-border-light p-4 text-center">
                <BookOpen className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-bold text-xl">{profile._count.collections}</p>
                <p className="text-xs text-text-muted">Koleksiyon</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-card rounded-2xl border border-border-light divide-y divide-border-light">
            <button
              onClick={() => router.push('/favoriler')}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium hover:bg-surface-low transition-colors"
            >
              <Heart className="w-4 h-4 text-text-muted" /> Favori Tariflerim
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-error hover:bg-error/5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-muted">Profil bilgileri yüklenemedi.</p>
      )}
    </div>
  );
}
