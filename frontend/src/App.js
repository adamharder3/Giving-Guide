import './index.css'
import React, { useState, useMemo } from 'react';

const sampleCharities = [
  { id: 1, name: 'Hope & Harvest', cause: 'Education', img: null },
  { id: 2, name: 'Clean Water Trust', cause: 'Water', img: null },
  { id: 3, name: 'Sunrise Shelter', cause: 'Housing', img: null },
  { id: 4, name: 'Food Circle', cause: 'Hunger', img: null },
  { id: 5, name: 'GreenRoots', cause: 'Environment', img: null },
  { id: 6, name: 'YouthTech', cause: 'Youth', img: null },
];

const FILTERS = ['Education', 'Water', 'Housing', 'Hunger', 'Environment', 'Youth'];

function TopBar({ onSearch }) {
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-lg border p-2 text-lg font-semibold">Logo</div>
      </div>

      <div className="flex-1">
        <div className="relative mx-auto max-w-3xl">
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search charities, causes..."
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">👤</button>
      </div>
    </header>
  );
}

function SidebarFilters({ filters, active, toggle }) {
  return (
    <aside className="px-6 py-6">
      <h3 className="text-2xl font-bold mb-4">Filters</h3>
      <div className="space-y-3">
        {filters.map((f) => (
          <label key={f} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={active.includes(f)}
              onChange={() => toggle(f)}
              className="w-4 h-4"
            />
            <span className="text-lg">{f}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}

function CharityCard({ charity, onToggleFavorite, isFavorite }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
      <div className="w-36 h-36 rounded-xl border-2 border-dashed flex items-center justify-center mb-3 bg-gray-50">
        {/* placeholder image area */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H21V21H3V3Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 17L8.5 10L13 14L17 9L21 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="font-semibold text-lg">{charity.name}</div>
      <div className="text-sm text-gray-500">{charity.cause}</div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onToggleFavorite(charity)}
          className={`px-3 py-1 rounded-full border ${isFavorite ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
        <button className="px-3 py-1 rounded-full border bg-white">Donate</button>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const toggleFilter = (f) => {
    setActiveFilters((curr) => (curr.includes(f) ? curr.filter((c) => c !== f) : [...curr, f]));
  };

  const toggleFavorite = (item) => {
    setFavorites((curr) => (curr.some((c) => c.id === item.id) ? curr.filter((c) => c.id !== item.id) : [...curr, item]));
  };

  const filtered = useMemo(() => {
    let list = sampleCharities;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.cause.toLowerCase().includes(q));
    }
    if (activeFilters.length) {
      list = list.filter((c) => activeFilters.includes(c.cause));
    }
    return list;
  }, [query, activeFilters]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TopBar onSearch={setQuery} />

      <div className="max-w-screen-xl mx-auto grid grid-cols-12 gap-6 py-8 px-4">
        {/* Left column: Filters */}
        <div className="col-span-3 bg-transparent border-r">
          <SidebarFilters filters={FILTERS} active={activeFilters} toggle={toggleFilter} />
        </div>

        {/* Main grid */}
        <main className="col-span-6 px-6">
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((c) => (
              <CharityCard
                key={c.id}
                charity={c}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.some((f) => f.id === c.id)}
              />
            ))}

            {/* If no results */}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center text-gray-500">No charities found. Try different filters or search terms.</div>
            )}
          </div>
        </main>

        {/* Right column: Favorites */}
        <aside className="col-span-3 px-6 border-l">
          <h3 className="text-2xl font-bold mb-4">Favorites</h3>
          <div className="space-y-3">
            {favorites.length === 0 && <div className="text-gray-500">No favorites yet — click "Favorite" on a card.</div>}
            {favorites.map((f) => (
              <div key={f.id} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-md bg-gray-50 border flex items-center justify-center">IMG</div>
                <div className="flex-1">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.cause}</div>
                </div>
                <button onClick={() => toggleFavorite(f)} className="text-sm text-red-500">Remove</button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
