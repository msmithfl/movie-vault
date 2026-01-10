import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TiStarOutline, TiStarHalfOutline, TiStarFullOutline } from "react-icons/ti";
import BarcodeScanner from './BarcodeScanner';

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  formats: string[];
  collections: string[];
  condition: string;
  rating: number;
  review: string;
  year: number;
  genres: string[];
  posterPath: string;
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  createdAt?: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  genre_ids: number[];
}

function AddMovie() {
  const navigate = useNavigate();
  const [entryMode, setEntryMode] = useState<'choice' | 'manual' | 'search'>('choice');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBMovie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const [formData, setFormData] = useState<Movie>({
    title: '',
    upcNumber: '',
    formats: [],
    collections: [],
    condition: 'New',
    rating: 0,
    review: '',
    year: new Date().getFullYear(),
    genres: [],
    posterPath: '',
    hdDriveNumber: 0,
    shelfNumber: 0,
    shelfSection: '',
    isOnPlex: false
  });
  
  const [collections, setCollections] = useState<{id: number, name: string}[]>([]);
  const [shelfSections, setShelfSections] = useState<{id: number, name: string}[]>([]);
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [showShelfSectionInput, setShowShelfSectionInput] = useState(false);
  const [newCollection, setNewCollection] = useState('');
  const [newShelfSection, setNewShelfSection] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showMobileOnlyMessage, setShowMobileOnlyMessage] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const API_URL = `${API_BASE}/api/movies`;
  const COLLECTIONS_URL = `${API_BASE}/api/collections`;
  const SHELF_SECTIONS_URL = `${API_BASE}/api/shelfsections`;
  const TMDB_API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN;
  
  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };
  
  // TMDB genre mapping
  const GENRE_MAP: { [key: number]: string } = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };
  
  useEffect(() => {
    // Load collections and shelf sections from API
    const fetchData = async () => {
      try {
        const [collectionsRes, shelfSectionsRes] = await Promise.all([
          fetch(COLLECTIONS_URL),
          fetch(SHELF_SECTIONS_URL)
        ]);
        
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(collectionsData);
        }
        
        if (shelfSectionsRes.ok) {
          const shelfSectionsData = await shelfSectionsRes.json();
          setShelfSections(shelfSectionsData);
        }
      } catch (error) {
        console.error('Error loading collections and shelf sections:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Navigate back to library page after successful add
        navigate('/library');
      }
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };
  
  const addCollection = async () => {
    if (newCollection && !collections.find(c => c.name === newCollection)) {
      try {
        const response = await fetch(COLLECTIONS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCollection }),
        });
        
        if (response.ok) {
          const newCollectionData = await response.json();
          setCollections([...collections, newCollectionData].sort((a, b) => a.name.localeCompare(b.name)));
          setFormData({ ...formData, collections: [...formData.collections, newCollection] });
          setNewCollection('');
          setShowCollectionInput(false);
        }
      } catch (error) {
        console.error('Error adding collection:', error);
      }
    }
  };
  
  const addShelfSection = async () => {
    if (newShelfSection && !shelfSections.find(s => s.name === newShelfSection)) {
      try {
        const response = await fetch(SHELF_SECTIONS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newShelfSection }),
        });
        
        if (response.ok) {
          const newShelfSectionData = await response.json();
          setShelfSections([...shelfSections, newShelfSectionData].sort((a, b) => a.name.localeCompare(b.name)));
          setFormData({ ...formData, shelfSection: newShelfSection });
          setNewShelfSection('');
          setShowShelfSectionInput(false);
        }
      } catch (error) {
        console.error('Error adding shelf section:', error);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Wait 300ms after user stops typing
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            value
          )}&include_adult=false&language=en-US&page=1`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_API_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        setSuggestions(data.results?.slice(0, 5) || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    // Map genre IDs to genre names
    const genres = movie.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean);
    
    // Extract year from release date
    const year = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : new Date().getFullYear();
    
    // Construct poster URL
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';

    // Update form data with TMDB info
    setFormData({
      ...formData,
      title: movie.title,
      year,
      genres,
      posterPath
    });

    // Switch to manual entry mode
    setEntryMode('manual');
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBarcodeDetected = (code: string) => {
    setFormData({ ...formData, upcNumber: code });
    setShowScanner(false);
  };

  const handleScanClick = () => {
    if (isMobile()) {
      setShowScanner(true);
    } else {
      setShowMobileOnlyMessage(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/library')}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors cursor-pointer"
        >
          ← Back to Library
        </button>
      </div>

      {entryMode === 'choice' && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Add New Movie</h2>
          <p className="text-gray-400 text-center mb-8">How would you like to add this movie?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setEntryMode('search')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-8 transition-all duration-200 transform hover:scale-105 text-center cursor-pointer"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Find By Title</h3>
              <p className="text-gray-400 text-sm">Search for movie information online</p>
            </button>

            <button
              onClick={() => setEntryMode('manual')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-8 transition-all duration-200 transform hover:scale-105 text-center cursor-pointer"
            >
              <div className="text-5xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
              <p className="text-gray-400 text-sm">Enter all details manually</p>
            </button>
          </div>
        </div>
      )}

      {entryMode === 'search' && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => setEntryMode('choice')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              ← Back to Choice
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-6">Find By Title</h2>
          
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for a movie..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
                {suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-12 h-18 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{movie.title}</p>
                        <p className="text-gray-400 text-sm">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {search.length > 0 && suggestions.length === 0 && showSuggestions && (
            <div className="text-center py-12">
              <p className="text-gray-400">No movies found. Try a different search.</p>
            </div>
          )}

          {search.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Start typing to search for a movie...</p>
            </div>
          )}
        </div>
      )}

      {entryMode === 'manual' && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => setEntryMode('choice')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              ← Back to Choice
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-6">Manual Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Movie Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter movie title"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="upc" className="block text-sm font-medium text-gray-300 mb-2">
                UPC Number *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="upc"
                  value={formData.upcNumber}
                  onChange={(e) => setFormData({ ...formData, upcNumber: e.target.value })}
                  required
                  placeholder="Enter UPC barcode number"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                />
                <button
                  type="button"
                  onClick={handleScanClick}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition cursor-pointer flex items-center justify-center"
                  title="Scan barcode"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                min="1900"
                max="2100"
                placeholder="Release year"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formats *
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {formData.formats.map((fmt, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                  >
                    {fmt}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, formats: formData.formats.filter((_, i) => i !== index) })}
                      className="hover:text-red-300 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !formData.formats.includes(e.target.value)) {
                    setFormData({ ...formData, formats: [...formData.formats, e.target.value] });
                  }
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
              >
                <option value="">Add format...</option>
                <option value="4K" disabled={formData.formats.includes('4K')}>4K Ultra HD</option>
                <option value="Blu-ray" disabled={formData.formats.includes('Blu-ray')}>Blu-ray</option>
                <option value="DVD" disabled={formData.formats.includes('DVD')}>DVD</option>
                <option value="VHS" disabled={formData.formats.includes('VHS')}>VHS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genres
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {formData.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, genres: formData.genres.filter((_, i) => i !== index) })}
                      className="hover:text-red-300 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !formData.genres.includes(e.target.value)) {
                    setFormData({ ...formData, genres: [...formData.genres, e.target.value] });
                  }
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
              >
                <option value="">Add genre...</option>
                <option value="Action" disabled={formData.genres.includes('Action')}>Action</option>
                <option value="Adventure" disabled={formData.genres.includes('Adventure')}>Adventure</option>
                <option value="Animation" disabled={formData.genres.includes('Animation')}>Animation</option>
                <option value="Comedy" disabled={formData.genres.includes('Comedy')}>Comedy</option>
                <option value="Crime" disabled={formData.genres.includes('Crime')}>Crime</option>
                <option value="Documentary" disabled={formData.genres.includes('Documentary')}>Documentary</option>
                <option value="Drama" disabled={formData.genres.includes('Drama')}>Drama</option>
                <option value="Family" disabled={formData.genres.includes('Family')}>Family</option>
                <option value="Fantasy" disabled={formData.genres.includes('Fantasy')}>Fantasy</option>
                <option value="History" disabled={formData.genres.includes('History')}>History</option>
                <option value="Horror" disabled={formData.genres.includes('Horror')}>Horror</option>
                <option value="Music" disabled={formData.genres.includes('Music')}>Music</option>
                <option value="Mystery" disabled={formData.genres.includes('Mystery')}>Mystery</option>
                <option value="Romance" disabled={formData.genres.includes('Romance')}>Romance</option>
                <option value="Sci-Fi" disabled={formData.genres.includes('Sci-Fi')}>Sci-Fi</option>
                <option value="Thriller" disabled={formData.genres.includes('Thriller')}>Thriller</option>
                <option value="TV Movie" disabled={formData.genres.includes('TV Movie')}>TV Movie</option>
                <option value="War" disabled={formData.genres.includes('War')}>War</option>
                <option value="Western" disabled={formData.genres.includes('Western')}>Western</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-2">
                Condition *
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Skips">Skips</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Collections
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {formData.collections.map((col, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                  >
                    {col}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, collections: formData.collections.filter((_, i) => i !== index) })}
                      className="hover:text-red-300 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !formData.collections.includes(e.target.value)) {
                      setFormData({ ...formData, collections: [...formData.collections, e.target.value] });
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value="">Add collection...</option>
                  {collections.filter(col => !formData.collections.includes(col.name)).map(col => (
                    <option key={col.id} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCollectionInput(!showCollectionInput)}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition cursor-pointer"
                >
                  +
                </button>
              </div>
              {showCollectionInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    placeholder="New collection name"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={addCollection}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCollectionInput(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating (0-5)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFullStar = formData.rating >= star;
                  const isHalfStar = formData.rating === star - 0.5;
                  
                  return (
                    <div
                      key={star}
                      className="relative cursor-pointer group"
                      style={{ width: '32px', height: '32px' }}
                    >
                      {/* Left half clickable area */}
                      <div
                        className="absolute left-0 top-0 w-1/2 h-full z-10"
                        onClick={() => setFormData({ ...formData, rating: star - 0.5 })}
                        title={`${star - 0.5} stars`}
                      />
                      {/* Right half clickable area */}
                      <div
                        className="absolute right-0 top-0 w-1/2 h-full z-10"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        title={`${star} stars`}
                      />
                      {/* Star icon */}
                      {isFullStar ? (
                        <TiStarFullOutline className="w-8 h-8 text-yellow-400 absolute top-0 left-0" />
                      ) : isHalfStar ? (
                        <TiStarHalfOutline className="w-8 h-8 text-yellow-400 absolute top-0 left-0" />
                      ) : (
                        <TiStarOutline className="w-8 h-8 text-gray-500 group-hover:text-yellow-200 absolute top-0 left-0" />
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 0 })}
                  className="ml-2 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.rating > 0 ? `${formData.rating} stars` : 'Not rated'}
              </p>
            </div>

            <div>
              <label htmlFor="shelfNumber" className="block text-sm font-medium text-gray-300 mb-2">
                Shelf Number
              </label>
              <input
                type="number"
                id="shelfNumber"
                value={formData.shelfNumber}
                onChange={(e) => setFormData({ ...formData, shelfNumber: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shelf Section
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.shelfSection}
                  onChange={(e) => setFormData({ ...formData, shelfSection: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value="">None</option>
                  {shelfSections.map(section => (
                    <option key={section.id} value={section.name}>{section.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowShelfSectionInput(!showShelfSectionInput)}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition cursor-pointer"
                >
                  +
                </button>
              </div>
              {showShelfSectionInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newShelfSection}
                    onChange={(e) => setNewShelfSection(e.target.value)}
                    placeholder="New shelf section name"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={addShelfSection}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShelfSectionInput(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="hdDriveNumber" className="block text-sm font-medium text-gray-300 mb-2">
                HDD Number
              </label>
              <input
                type="number"
                id="hdDriveNumber"
                value={formData.hdDriveNumber}
                onChange={(e) => setFormData({ ...formData, hdDriveNumber: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOnPlex}
                  onChange={(e) => setFormData({ ...formData, isOnPlex: e.target.checked })}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded focus:outline-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-300">Available on Plex</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="posterPath" className="block text-sm font-medium text-gray-300 mb-2">
              Poster Image URL
            </label>
            <input
              type="text"
              id="posterPath"
              value={formData.posterPath}
              onChange={(e) => setFormData({ ...formData, posterPath: e.target.value })}
              placeholder="https://example.com/poster.jpg"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-2">
              Review / Notes
            </label>
            <textarea
              id="review"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              rows={4}
              placeholder="Add your review or notes about this movie..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
            >
              Add to Collection
            </button>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showMobileOnlyMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Mobile Only Feature</h3>
              <button
                onClick={() => setShowMobileOnlyMessage(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              The UPC barcode scanner is only available on mobile devices. Please use a smartphone or tablet to scan barcodes.
            </p>
            <button
              onClick={() => setShowMobileOnlyMessage(false)}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddMovie
