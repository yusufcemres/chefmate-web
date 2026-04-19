'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from './ThemeProvider';

const options: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Aydınlık', Icon: Sun },
  { value: 'dark', label: 'Karanlık', Icon: Moon },
  { value: 'system', label: 'Sistem', Icon: Monitor },
];

export function ThemeToggle() {
  const { mode, isDark, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const ActiveIcon = isDark ? Moon : Sun;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-surface-low transition-colors"
        aria-label="Tema seç"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ActiveIcon className="w-5 h-5 text-text-secondary" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-2xl border border-border-light/40 bg-card shadow-lg overflow-hidden z-50"
        >
          {options.map(({ value, label, Icon }) => {
            const active = mode === value;
            return (
              <button
                key={value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setMode(value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  active ? 'bg-surface-low text-primary-dark font-semibold' : 'text-text hover:bg-surface-low'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
