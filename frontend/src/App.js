import './index.css';
import React, { useState, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from 'react-router-dom';

// ---------------- Sample Data ----------------
const sampleCharities = [
  {
    id: 1,
    name: 'Hope & Harvest',
    cause: 'Education',
    location: 'Seattle, WA',
    website: 'hopeharvest.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Hope',
    about:
      'Hope & Harvest empowers underprivileged youth through access to education, mentorship, and skill development.',
    programs: [
      'Scholarship support',
      'Mentorship for at-risk students',
      'Community education initiatives'
    ]
  },
  {
    id: 2,
    name: 'Clean Trust',
    cause: 'Water',
    location: 'Denver, CO',
    website: 'cleanwatertrust.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Water',
    about:
      'Clean Water Trust provides sustainable clean water solutions to rural communities worldwide.',
    programs: [
      'Water purification systems',
      'Community sanitation education',
      'Disaster relief water aid'
    ]
  },
  {
    id: 3,
    name: 'Sunrise Shelter',
    cause: 'Housing & Homelessness',
    location: 'Austin, TX',
    website: 'sunriseshelter.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Shelter',
    about:
      'Sunrise Shelter provides safe transitional housing and support services for families experiencing homelessness.',
    programs: [
      'Emergency housing',
      'Job-readiness training',
      'Addiction recovery support'
    ]
  },
  {
    id: 4,
    name: 'Food Circle',
    cause: 'Hunger',
    location: 'San Francisco, CA',
    website: 'foodcircle.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Food',
    about:
      'Food Circle combats food insecurity through meal programs and community kitchens.',
    programs: [
      'Daily free meal service',
      'Food waste reduction programs',
      'Nutrition education workshops'
    ]
  },
  {
    id: 5,
    name: 'GreenRoots',
    cause: 'Environment',
    location: 'Portland, OR',
    website: 'greenroots.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Green',
    about:
      'GreenRoots promotes sustainable environmental practices through education and reforestation efforts.',
    programs: [
      'Tree planting initiatives',
      'Recycling drives',
      'Community environmental education'
    ]
  },
  {
    id: 6,
    name: 'YouthTech',
    cause: 'Youth',
    location: 'Boston, MA',
    website: 'youthtech.org',
    status: 'Verified',
    img: 'https://via.placeholder.com/120x120.png?text=Tech',
    about:
      'YouthTech empowers teens with coding and STEM education programs for future-ready skills.',
    programs: [
      'Free coding bootcamps',
      'Tech mentorship programs',
      'Internships with local startups'
    ]
  }
];

const FILTERS = [
  'Education',
  'Water',
  'Housing & Homelessness',
  'Hunger',
  'Environment',
  'Youth'
];

// ---------------- TopBar ----------------
function TopBar({ onSearch }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-white shadow-sm">
      <div
        onClick={() => navigate('/')}
        className="rounded-lg border p-2 text-lg font-semibold cursor-pointer"
      >
        Giving Guide
      </div>
      <div className="flex-1">
        <input
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search charities, causes..."
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <button
        onClick={() => navigate('/login')}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
      >
        👤
      </button>
    </header>
  );
}

// ---------------- SidebarFilters ----------------
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

// ---------------- CharityCard ----------------
function CharityCard({ charity, onToggleFavorite, isFavorite }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <Link
        to={`/charity/${charity.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="flex flex-col items-center">
          <img
            src={charity.img}
            alt={charity.name}
            className="w-24 h-24 rounded-lg mb-3 object-cover border"
          />
          <h2 className="font-semibold text-lg">{charity.name}</h2>
          <p className="text-sm text-gray-500">{charity.cause}</p>
          <p className="text-xs text-gray-400 mt-1">{charity.location}</p>
          <p className="text-xs text-green-600 font-medium mt-1">Status: {charity.status}</p>
        </div>
      </Link>
      <div className="flex justify-center gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleFavorite(charity);
          }}
          className={`px-3 py-1 rounded-full border text-sm ${
            isFavorite ? 'bg-indigo-600 text-white' : 'bg-white'
          }`}
        >
          {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            alert('Donation flow coming soon!');
          }}
          className="px-3 py-1 rounded-full border text-sm"
        >
          Donate
        </button>
      </div>
    </div>
  );
}

// ---------------- CharityDetail ----------------
function CharityDetail() {
  const { id } = useParams();
  const charity = sampleCharities.find((c) => c.id === Number(id));

  if (!charity)
    return <div className="p-8 text-center text-gray-500">Charity not found.</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm mt-8 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{charity.name}</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-full text-sm">Favorite</button>
          <button className="px-3 py-1 border rounded-full text-sm">Donate</button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={charity.img}
          alt={charity.name}
          className="w-24 h-24 rounded-lg border object-cover"
        />
        <div>
          <p><strong>Category:</strong> {charity.cause}</p>
          <p><strong>Location:</strong> {charity.location}</p>
          <p><strong>Website:</strong> <a href={`https://${charity.website}`} className="text-indigo-600 underline">{charity.website}</a></p>
          <p><strong>Status:</strong> {charity.status}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">About</h3>
      <p className="text-sm text-gray-700 mb-4">{charity.about}</p>

      <h3 className="text-lg font-semibold mb-2">Programs & Impact</h3>
      <ul className="list-disc pl-5 text-sm text-gray-700">
        {charity.programs.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <div className="mt-6">
        <Link to="/" className="text-indigo-600 underline text-sm">
          ← Back to main page
        </Link>
      </div>
    </div>
  );
}

// ---------------- Main Page ----------------
function MainPage() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const toggleFilter = (f) => {
    setActiveFilters((curr) =>
      curr.includes(f) ? curr.filter((c) => c !== f) : [...curr, f]
    );
  };

  const toggleFavorite = (item) => {
    setFavorites((curr) =>
      curr.some((c) => c.id === item.id)
        ? curr.filter((c) => c.id !== item.id)
        : [...curr, item]
    );
  };

  const filtered = useMemo(() => {
    let list = sampleCharities;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.cause.toLowerCase().includes(q)
      );
    }
    if (activeFilters.length) {
      list = list.filter((c) => activeFilters.includes(c.cause));
    }
    return list;
  }, [query, activeFilters]);

  return (
    <div className="max-w-screen-xl mx-auto grid grid-cols-12 gap-6 py-8 px-4">
      <div className="col-span-3 bg-transparent border-r">
        <SidebarFilters
          filters={FILTERS}
          active={activeFilters}
          toggle={toggleFilter}
        />
      </div>

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
          {filtered.length === 0 && (
            <div className="col-span-3 text-center text-gray-500">
              No charities found.
            </div>
          )}
        </div>
      </main>

      <aside className="col-span-3 px-6 border-l">
        <h3 className="text-2xl font-bold mb-4">Favorites</h3>
        <div className="space-y-3">
          {favorites.length === 0 && (
            <div className="text-gray-500">
              No favorites yet — click "Favorite" on a card.
            </div>
          )}
          {favorites.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
            >
              <img
                src={f.img}
                alt={f.name}
                className="w-12 h-12 rounded-md border object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-500">{f.cause}</div>
              </div>
              <button
                onClick={() => toggleFavorite(f)}
                className="text-sm text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ---------------- Login Page ----------------
function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert('Logged in! (demo only)');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------- Signup Page ----------------
function SignUpPage() {
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    alert('Account created! (demo only)');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Create Account
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------- App ----------------
export default function App() {
  const [query, setQuery] = useState('');
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <TopBar onSearch={setQuery} />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/charity/:id" element={<CharityDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </Router>
  );
}
