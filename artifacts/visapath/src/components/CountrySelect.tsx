import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { Country } from '@/data/countries';

type Props = {
  value: string;
  onChange: (v: string) => void;
  countries: Country[];
  placeholder?: string;
};

export default function CountrySelect({ value, onChange, countries, placeholder = 'Search and select a country…' }: Props) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const selected = countries.find(c => c.value === value);

  const filtered = search.trim().length > 0
    ? countries.filter(c => c.label.toLowerCase().includes(search.toLowerCase())).slice(0, 40)
    : countries.slice(0, 60);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
          open
            ? 'border-neon-pink bg-white/80 shadow-[0_0_0_3px_rgba(244,34,114,0.08)]'
            : value
              ? 'border-indigo-bloom/30 bg-white/70 hover:border-indigo-bloom/50'
              : 'border-indigo-bloom/20 bg-white/60 hover:border-indigo-bloom/40'
        }`}
      >
        <span className={`text-base font-medium truncate ${value ? 'text-[#1a0f2e]' : 'text-[#4b3b6b]/40'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
              className="w-5 h-5 rounded-full bg-indigo-bloom/10 flex items-center justify-center hover:bg-neon-pink/20 transition-colors"
            >
              <Icon icon="lucide:x" className="text-indigo-bloom/60 text-[10px]" />
            </button>
          )}
          <Icon icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'} className="text-indigo-bloom/40 text-sm" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-indigo-bloom/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: 280 }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-bloom/10 bg-white/80">
            <Icon icon="lucide:search" className="text-indigo-bloom/40 text-sm flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search…"
              className="flex-1 bg-transparent outline-none text-sm text-[#1a0f2e] placeholder:text-indigo-bloom/30"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <Icon icon="lucide:x" className="text-indigo-bloom/30 text-xs" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-4 py-4 text-sm text-indigo-950/40 italic text-center">No countries found</div>
            )}
            {filtered.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => { onChange(c.value); setOpen(false); setSearch(''); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                  value === c.value
                    ? 'bg-neon-pink/8 text-neon-pink font-semibold'
                    : 'text-[#1a0f2e] hover:bg-indigo-bloom/5'
                }`}
              >
                {value === c.value && <Icon icon="lucide:check" className="text-neon-pink text-xs flex-shrink-0" />}
                <span>{c.label}</span>
              </button>
            ))}
            {search.trim().length === 0 && countries.length > 60 && (
              <div className="px-4 py-2 text-[10px] text-indigo-bloom/30 font-mono text-center border-t border-indigo-bloom/8">
                Type to search all {countries.length} countries
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
