'use client';

import { useState } from 'react';
import { findSubstitutions, type Substitution } from '@/data/ingredient-substitutions';
import { Repeat, X } from 'lucide-react';

export function IngredientSubstitutions({ ingredientName }: { ingredientName: string }) {
  const [show, setShow] = useState(false);
  const subs = findSubstitutions(ingredientName);

  if (!subs) return null;

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="ml-auto flex-shrink-0 p-1 rounded-full hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
        title="İkame önerileri"
      >
        <Repeat className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="w-full mt-1.5 ml-4 bg-surface-low rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">İkame Önerileri</span>
            <button onClick={() => setShow(false)} className="p-0.5 rounded hover:bg-surface-high"><X className="w-3 h-3" /></button>
          </div>
          {subs.map((sub, i) => (
            <div key={i} className="text-xs">
              <span className="font-semibold text-primary">{sub.name}</span>
              <span className="text-text-muted ml-1.5">({sub.ratio})</span>
              {sub.note && <span className="text-text-muted ml-1">— {sub.note}</span>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
