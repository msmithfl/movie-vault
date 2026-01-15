import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import Counter from '../components/Counter'
import MovieDetailCard from '../components/MovieDetailCard'
import EmptyState from '../components/EmptyState'
import { FaEdit, FaTrash, FaCheck, FaImage } from 'react-icons/fa'
import { FaTableList, FaChevronDown, FaChevronUp } from 'react-icons/fa6'
import LoadingSpinner from '../components/LoadingSpinner'

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
  
  // View mode state
  const [viewMode, setViewMode] = useState<'detail' | 'poster'>(() => {
    const saved = localStorage.getItem('shelfViewMode');
    return (saved === 'poster' || saved === 'detail') ? saved : 'detail';
  });
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  
  const handleViewModeChange = (mode: 'detail' | 'poster') => {
    setViewMode(mode);
    localStorage.setItem('shelfViewMode', mode);
    setIsViewDropdownOpen(false);
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const MOVIES_URL = `${API_BASE}/api/movies`;
  const SECTIONS_URL = `${API_BASE}/api/shelfsections`;

  useEffect(() => {
    fetchMovies();
  }, [sectionName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setIsViewDropdownOpen(false);
      }
    };

    if (isViewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isViewDropdownOpen]);

  // Close dropdown when editing starts
  useEffect(() => {
    if (isEditing) {
      setIsViewDropdownOpen(false);
    }
  }, [isEditing]);

  const fetchMovies = async () => {
    try {
      const [moviesRes, sectionsRes] = await Promise.all([
        fetch(MOVIES_URL),
        fetch(SECTIONS_URL)
      ]);
      
      if (moviesRes.ok) {
        const data = await moviesRes.json();
        let filtered;
        if (sectionName === 'Unshelved') {
          // Show movies with no shelf section
          filtered = data.filter((movie: Movie) => 
            !movie.shelfSection || movie.shelfSection.trim() === ''
          );
        } else {
          // Show movies matching the shelf section
          filtered = data.filter((movie: Movie) => 
            movie.shelfSection && movie.shelfSection === sectionName
          );
        }
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
        setIsEditing(false);
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
      <LoadingSpinner />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/shelfsections')}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 cursor-pointer"
          >
            ← Back to Shelf Sections
          </button>
          {!isEditing && section && sectionName !== 'Unshelved' && (
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                aria-label="Edit shelf section"
              >
                <FaEdit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                aria-label="Delete shelf section"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full md:max-w-md px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-2xl font-bold mb-3"
                  autoFocus
                />
                <div className="flex gap-3">
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
              </div>
            ) : (
              <div>
                <div className='flex items-center gap-4'>
                  <h1 className="text-3xl font-bold mb-2">{sectionName}</h1>
                  <Counter count={movies.length} className="mb-2" />
                  <div ref={viewDropdownRef} className="ml-auto relative mb-2">
                    <button
                      onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      {viewMode === 'poster' ? (
                        <FaImage className="w-5 h-5" />
                      ) : (
                        <FaTableList className="w-5 h-5" />
                      )}
                      {isViewDropdownOpen ? (
                        <FaChevronUp className="w-3 h-3" />
                      ) : (
                        <FaChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {isViewDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-36 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleViewModeChange('poster')}
                          className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors flex items-center justify-between border-b border-gray-600 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span>Poster View</span>
                          </div>
                          {viewMode === 'poster' && <FaCheck className="w-4 h-4 text-white" />}
                        </button>
                        <button
                          onClick={() => handleViewModeChange('detail')}
                          className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span>Detail View</span>
                          </div>
                          {viewMode === 'detail' && <FaCheck className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {movies.length === 0 ? (
        <EmptyState message="No movies in this shelf section yet." />
      ) : (
        <div className={viewMode === 'poster' 
          ? "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" 
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }>
          {movies.map((movie) => (
            viewMode === 'poster' ? (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group relative aspect-2/3 rounded-lg overflow-hidden shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              >
                {movie.posterPath ? (
                  <img 
                    src={movie.posterPath} 
                    alt={`${movie.title} poster`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                    }}
                  />
                ) : (
                  <div className="max-w-64 md:max-w-50 h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm text-center px-2 truncate">{movie.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="max-w-64 md:max-w-50 absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 truncate">{movie.title}</h3>
                    <p className="text-gray-300 text-xs">Shelf #{movie.shelfNumber || 'N/A'}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <MovieDetailCard key={movie.id} movie={movie} showYear />
            )
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
