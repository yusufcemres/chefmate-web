'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Users, Plus, Trash2, Mail, Loader2, Home, X, UserPlus, Crown } from 'lucide-react';
import clsx from 'clsx';

interface Household {
  id: string;
  name: string;
  members: HouseholdMember[];
  createdAt: string;
}

interface HouseholdMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  user: { displayName: string; email: string };
}

export default function HouseholdPage() {
  const { isAuthenticated, user, init } = useAuthStore();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => { init(); }, [init]);

  const fetchHouseholds = useCallback(async () => {
    try {
      const data = await api.get<Household[]>('/households');
      setHouseholds(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchHouseholds();
    else setLoading(false);
  }, [isAuthenticated, fetchHouseholds]);

  const createHousehold = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post('/households', { name: newName.trim() });
      setShowCreate(false);
      setNewName('');
      await fetchHouseholds();
    } catch {}
    setCreating(false);
  };

  const deleteHousehold = async (id: string) => {
    try {
      await api.delete(`/households/${id}`);
      setHouseholds(prev => prev.filter(h => h.id !== id));
    } catch {}
  };

  const inviteMember = async (householdId: string) => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/households/${householdId}/members`, { email: inviteEmail.trim() });
      setInviteEmail('');
      setShowInvite(null);
      await fetchHouseholds();
    } catch (e: any) {
      alert(e.message || 'Davet gönderilemedi');
    }
    setInviting(false);
  };

  const removeMember = async (householdId: string, memberId: string) => {
    try {
      await api.delete(`/households/${householdId}/members/${memberId}`);
      await fetchHouseholds();
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Hanem</h1>
          <p className="text-text-muted mt-1">Aile veya ev arkadaşlarınızla mutfağı paylaşın</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
          <Plus className="w-4 h-4" /> Hane Oluştur
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Yeni Hane</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-full hover:bg-surface-low"><X className="w-5 h-5" /></button>
            </div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Hane adı (örn: Ev, Yurt)" className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" onKeyDown={e => e.key === 'Enter' && createHousehold()} />
            <button onClick={createHousehold} disabled={!newName.trim() || creating} className="w-full py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4" />} Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Üye Davet Et</h2>
              <button onClick={() => setShowInvite(null)} className="p-1 rounded-full hover:bg-surface-low"><X className="w-5 h-5" /></button>
            </div>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="E-posta adresi" type="email" className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" onKeyDown={e => e.key === 'Enter' && inviteMember(showInvite)} />
            <button onClick={() => inviteMember(showInvite)} disabled={!inviteEmail.trim() || inviting} className="w-full py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Davet Et
            </button>
          </div>
        </div>
      )}

      {/* Households */}
      {households.length > 0 ? (
        <div className="space-y-4">
          {households.map(h => (
            <div key={h.id} className="bg-card rounded-2xl border border-border-light overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border-light">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-bold">{h.name}</h2>
                  <span className="text-xs text-text-muted">{h.members.length} üye</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowInvite(h.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-low text-xs font-medium hover:bg-surface-high transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Davet Et
                  </button>
                  <button onClick={() => deleteHousehold(h.id)} className="p-1.5 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border-light">
                {h.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                      {member.user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{member.user.displayName}</span>
                      {member.role === 'OWNER' && <Crown className="w-3.5 h-3.5 text-warning inline ml-1.5" />}
                      <p className="text-xs text-text-muted truncate">{member.user.email}</p>
                    </div>
                    {member.role !== 'OWNER' && member.userId !== user?.id && (
                      <button onClick={() => removeMember(h.id, member.id)} className="p-1 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Henüz Haneniz Yok</h2>
          <p className="text-text-muted mb-6">Bir hane oluşturup aile veya ev arkadaşlarınızı davet edin. Stoğu birlikte yönetin!</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
            <Home className="w-4 h-4" /> İlk Hanemi Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
