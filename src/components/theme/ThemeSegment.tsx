'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from './ThemeProvider';

const options: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Aydınlık', Icon: Sun },
  { value: 'dark', label: 'Karanlık', Icon: Moon },
  { value: 'system', label: 'Sistem', Icon: Monitor },
];

export function ThemeSegment() {
  const { mode, setMode } = useTheme();

  return (
    <div className="bg-card rounded-2xl border border-border-light p-5">
      <h3 className="font-heading font-bold text-base mb-1">Tema</h3>
      <p className="text-sm text-text-muted mb-4">Aydınlık, karanlık veya sistem tercihini takip et.</p>
      <div className="grid grid-cols-3 gap-2 p-1 rounded-full bg-surface-low">
        {options.map(({ value, label, Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                active
                  ? 'bg-card text-primary-dark shadow-sm'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
