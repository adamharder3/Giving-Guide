import './index.css';
import React, { useState, useMemo, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from 'react-router-dom';
import { authAPI, charityAPI, favoritesAPI } from './api';

// Backend URL for images
const BACKEND_URL = 'http://localhost:4000';

// ---------------- TopBar ----------------
function TopBar({ onSearch, user, onLogout }) {
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
      {user ? (
        <div className="flex items-center gap-2">
          {user.role === 'charity' && (
            <button
              onClick={() => navigate('/add-charity')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              + Add Charity
            </button>
          )}
          <span className="text-sm text-gray-600">
            {user.username} {user.role === 'charity' && '(Charity)'}
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          👤
        </button>
      )}
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
  const imageUrl = charity.filename 
    ? `${BACKEND_URL}/src/data/uploads/${charity.filename}`
    : 'https://via.placeholder.com/120x120.png?text=No+Image';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <Link
        to={`/charity/${charity.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="flex flex-col items-center">
          <img
            src={imageUrl}
            alt={charity.name}
            className="w-24 h-24 rounded-lg mb-3 object-cover border"
          />
          <h2 className="font-semibold text-lg">{charity.name}</h2>
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {charity.tags && charity.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-xs bg-indigo-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{charity.location}</p>
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
            if (charity.website) {
              window.open(charity.website, '_blank');
            }
          }}
          className="px-3 py-1 rounded-full border text-sm"
        >
          Visit Site
        </button>
      </div>
    </div>
  );
}

// ---------------- CharityDetail ----------------
function CharityDetail({ charities, user, favorites, onToggleFavorite }) {
  const { id } = useParams();
  const charity = charities.find((c) => c.id === Number(id));
  const isFavorite = favorites.some((f) => f.id === charity?.id);

  if (!charity)
    return <div className="p-8 text-center text-gray-500">Charity not found.</div>;

  const imageUrl = charity.filename 
    ? `${BACKEND_URL}/src/data/uploads/${charity.filename}`
    : 'https://via.placeholder.com/120x120.png?text=No+Image';

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm mt-8 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{charity.name}</h1>
        {user && (
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavorite(charity)}
              className={`px-3 py-1 border rounded-full text-sm ${
                isFavorite ? 'bg-indigo-600 text-white' : 'bg-white'
              }`}
            >
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            {charity.website && (
              <button 
                onClick={() => window.open(charity.website, '_blank')}
                className="px-3 py-1 border rounded-full text-sm"
              >
                Visit Site
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={imageUrl}
          alt={charity.name}
          className="w-24 h-24 rounded-lg border object-cover"
        />
        <div>
          <p><strong>Tags:</strong> {charity.tags?.join(', ') || 'None'}</p>
          <p><strong>Location:</strong> {charity.location || 'N/A'}</p>
          {charity.website && (
            <p>
              <strong>Website:</strong>{' '}
              <a href={charity.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                {charity.website}
              </a>
            </p>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">About</h3>
      <p className="text-sm text-gray-700 mb-4">
        {charity.description || 'No description available.'}
      </p>

      <div className="mt-6">
        <Link to="/" className="text-indigo-600 underline text-sm">
          ← Back to main page
        </Link>
      </div>
    </div>
  );
}

// ---------------- Main Page ----------------
function MainPage({ charities, favorites, onToggleFavorite, user, query }) {
  const [activeFilters, setActiveFilters] = useState([]);

  // Extract all unique tags from charities
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    charities.forEach(c => {
      if (c.tags) {
        c.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [charities]);

  const toggleFilter = (f) => {
    setActiveFilters((curr) =>
      curr.includes(f) ? curr.filter((c) => c !== f) : [...curr, f]
    );
  };

  const filtered = useMemo(() => {
    let list = charities;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (activeFilters.length) {
      list = list.filter((c) => 
        c.tags?.some(tag => activeFilters.includes(tag))
      );
    }
    return list;
  }, [query, activeFilters, charities]);

  return (
    <div className="max-w-screen-xl mx-auto grid grid-cols-12 gap-6 py-8 px-4">
      <div className="col-span-3 bg-transparent border-r">
        <SidebarFilters
          filters={allTags}
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
              onToggleFavorite={onToggleFavorite}
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
          {!user && (
            <div className="text-gray-500 text-sm">
              Please log in to save favorites.
            </div>
          )}
          {user && favorites.length === 0 && (
            <div className="text-gray-500">
              No favorites yet — click "Favorite" on a card.
            </div>
          )}
          {favorites.map((f) => {
            const imageUrl = f.filename 
              ? `${BACKEND_URL}/src/data/uploads/${f.filename}`
              : 'https://via.placeholder.com/120x120.png?text=No+Image';
            
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={f.name}
                  className="w-12 h-12 rounded-md border object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">
                    {f.tags?.slice(0, 2).join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => onToggleFavorite(f)}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

// ---------------- Login Page ----------------
function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.login(username, password);
      onLoginSuccess(result);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Don't have an account?{' '}
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
function SignUpPage({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.register(username, password, role, secret);
      onSignupSuccess(result);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
          >
            <option value="user">Regular User</option>
            <option value="charity">Charity Account</option>
          </select>
          {role === 'charity' && (
            <input
              type="text"
              placeholder="Charity Registration Code"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
function AddCharityPage({ user, onCharityAdded }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not a charity account
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'charity') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate
    if (!name.trim()) {
      setError('Charity name is required');
      setLoading(false);
      return;
    }
    if (!tags.trim()) {
      setError('At least one tag is required');
      setLoading(false);
      return;
    }
    if (!image) {
      setError('Image is required');
      setLoading(false);
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('tags', tags.trim());
      formData.append('description', description.trim());
      formData.append('website', website.trim());
      formData.append('location', location.trim());
      formData.append('image', image);

      // Submit
      const result = await charityAPI.create(formData);
      
      // Success!
      alert('Charity created successfully!');
      onCharityAdded(); // Reload charities
      navigate('/'); // Go back to main page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'charity') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Add New Charity</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Charity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hope Foundation"
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Education, Youth, Community (comma-separated)"
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your charity's mission and impact..."
              rows={4}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcharity.org"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Ann Arbor, USA"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Charity Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, or GIF. Max 5MB.
            </p>
            {image && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Charity'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ---------------- App ----------------
export default function App() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [charities, setCharities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check session
      const sessionData = await authAPI.getSession();
      if (sessionData.loggedIn) {
        setUser({ username: sessionData.username, role: sessionData.role });
      }

      // Load charities
      const charitiesData = await charityAPI.getAll();
      setCharities(charitiesData);

      // Load favorites if logged in
      if (sessionData.loggedIn) {
        try {
          const favoritesData = await favoritesAPI.getAll();
          setFavorites(favoritesData);
        } catch (err) {
          console.error('Failed to load favorites:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (result) => {
    setUser({ username: result.username, role: result.role });
    loadData(); // Reload to get favorites
  };

  const handleSignupSuccess = (result) => {
    setUser({ username: result.username, role: result.role });
    loadData();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setFavorites([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleToggleFavorite = async (charity) => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }

    const isFavorite = favorites.some((f) => f.id === charity.id);

    try {
      if (isFavorite) {
        await favoritesAPI.remove(charity.id);
        setFavorites((curr) => curr.filter((f) => f.id !== charity.id));
      } else {
        await favoritesAPI.add(charity.id);
        setFavorites((curr) => [...curr, charity]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorites: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <TopBar onSearch={setQuery} user={user} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={
              <MainPage
                charities={charities}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                user={user}
                query={query}
              />
            }
          />
          <Route
            path="/charity/:id"
            element={
              <CharityDetail
                charities={charities}
                user={user}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/add-charity"
            element={
              <AddCharityPage
                user={user}
                onCharityAdded={loadData}
              />
            }
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/signup"
            element={<SignUpPage onSignupSuccess={handleSignupSuccess} />}
          />
        </Routes>
      </div>
    </Router>
  );
}