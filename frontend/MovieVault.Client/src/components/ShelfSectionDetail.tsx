import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

interface ShelfSection {
  id: number;
  name: string;
  createdAt: string;
}

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  formats: string[];
  collections: string[];
  condition: string;
  rating: number;
  review: string;
  posterPath: string;
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  createdAt?: string;
}

function ShelfSectionDetail() {
  const { sectionName } = useParams<{ sectionName: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [section, setSection] = useState<ShelfSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const MOVIES_URL = `${API_BASE}/api/movies`;
  const SECTIONS_URL = `${API_BASE}/api/shelfsections`;

  useEffect(() => {
    fetchMovies();
  }, [sectionName]);

  const fetchMovies = async () => {
    try {
      const [moviesRes, sectionsRes] = await Promise.all([
        fetch(MOVIES_URL),
        fetch(SECTIONS_URL)
      ]);
      
      if (moviesRes.ok) {
        const data = await moviesRes.json();
        const filtered = data.filter((movie: Movie) => 
          movie.shelfSection && movie.shelfSection === sectionName
        );
        setMovies(filtered);
      }
      
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        const foundSection = sectionsData.find((s: ShelfSection) => s.name === sectionName);
        setSection(foundSection || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedName(sectionName || '');
  };

  const handleSaveEdit = async () => {
    if (!section || !editedName.trim()) return;

    try {
      const response = await fetch(`${SECTIONS_URL}/${section.id}?newName=${encodeURIComponent(editedName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate(`/shelfsections/${encodeURIComponent(editedName)}`);
      }
    } catch (error) {
      console.error('Error updating shelf section:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!section) return;

    try {
      const response = await fetch(`${SECTIONS_URL}/${section.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigate('/shelfsections');
      }
    } catch (error) {
      console.error('Error deleting shelf section:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/shelfsections')}
          className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2 cursor-pointer"
        >
          ← Back to Shelf Sections
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-2xl font-bold"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold mb-2">{sectionName}</h1>
            )}
            <p className="text-gray-400">{movies.length} {movies.length === 1 ? 'movie' : 'movies'} in this shelf section</p>
          </div>
          {!isEditing && section && (
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition flex items-center gap-2 cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition flex items-center gap-2 cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg mb-6">
            No movies in this shelf section yet.
          </p>
          <Link
            to="/add"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
          >
            Add a Movie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 transform hover:scale-105 flex gap-4 p-4"
            >
              {movie.posterPath && (
                <img 
                  src={movie.posterPath} 
                  alt={`${movie.title} poster`}
                  className="w-24 h-36 object-cover rounded-md shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/96x144?text=No+Poster';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                <p className="text-gray-400 text-sm font-mono">{movie.upcNumber}</p>
              </div>

              {movie.formats && movie.formats.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {[...movie.formats].sort().map((fmt, idx) => (
                    <span key={idx} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {fmt}
                    </span>
                  ))}
                </div>
              )}

              {movie.shelfNumber > 0 && (
                <div className="text-sm text-gray-300 mb-2">
                  Shelf #{movie.shelfNumber}
                </div>
              )}

              {movie.rating > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>⭐</span>
                  <span>{movie.rating}</span>
                </div>
              )}

              {movie.condition && (
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    movie.condition === 'New' ? 'bg-green-600 text-white' :
                    movie.condition === 'Good' ? 'bg-blue-600 text-white' :
                    movie.condition === 'Skips' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {movie.condition}
                  </span>
                </div>
              )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Shelf Section"
        message={`Are you sure you want to delete "${sectionName}"? This will remove it from all movies but won't delete the movies themselves.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default ShelfSectionDetail;
