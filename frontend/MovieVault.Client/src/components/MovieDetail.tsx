import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { TiStarOutline, TiStarHalfOutline, TiStarFullOutline } from 'react-icons/ti'
import ConfirmDialog from './ConfirmDialog'

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

function MovieDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const API_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMovie(data);
      } else {
        navigate('/library');
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigate('/library');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Movie not found</p>
      </div>
    );
  }

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

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Formats</h3>
              {movie.formats && movie.formats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[...movie.formats].sort().map((fmt, idx) => (
                    <span key={idx} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-base font-medium">
                      {fmt}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Condition</h3>
              <span className={`px-4 py-2 rounded-full text-base font-medium inline-block ${
                movie.condition === 'New' ? 'bg-green-600' :
                movie.condition === 'Good' ? 'bg-blue-600' :
                movie.condition === 'Skips' ? 'bg-yellow-600' :
                'bg-red-600'
              } text-white`}>
                {movie.condition}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Rating</h3>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFullStar = movie.rating >= star;
                  const isHalfStar = movie.rating === star - 0.5;
                  
                  return (
                    <div key={star}>
                      {isFullStar ? (
                        <TiStarFullOutline className="w-7 h-7 text-yellow-400" />
                      ) : isHalfStar ? (
                        <TiStarHalfOutline className="w-7 h-7 text-yellow-400" />
                      ) : (
                        <TiStarOutline className="w-7 h-7 text-gray-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Year</h3>
              <p className="text-base text-white">
                {movie.year || <span className="text-gray-500">Not set</span>}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Genres</h3>
              {movie.genres && movie.genres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre, idx) => (
                    <span key={idx} className="bg-purple-600 px-3 py-2 rounded-md text-white">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">UPC Number</h3>
              <p className="text-base font-mono text-white bg-gray-700 px-3 py-2 rounded-md inline-block">
                {movie.upcNumber}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Collections</h3>
              {movie.collections && movie.collections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movie.collections.map((col, idx) => (
                    <span key={idx} className="bg-purple-600 px-3 py-2 rounded-md text-white">
                      {col}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Shelf Section</h3>
              <p className="text-base text-white">
                {movie.shelfSection || <span className="text-gray-500">None</span>}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Shelf Number</h3>
              <p className="text-base text-white">
                {movie.shelfNumber > 0 ? `Shelf #${movie.shelfNumber}` : <span className="text-gray-500">Not set</span>}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">HD Drive Number</h3>
              <p className="text-base text-white">
                {movie.hdDriveNumber > 0 ? `Drive #${movie.hdDriveNumber}` : <span className="text-gray-500">Not set</span>}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">On Plex</h3>
              <p className="text-base text-white">
                {movie.isOnPlex ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Date Added</h3>
              <p className="text-base text-white">{formatDate(movie.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Movie ID</h3>
              <p className="text-base text-white font-mono">#{movie.id}</p>
            </div>
          </div>

          {movie.posterPath && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Poster</h3>
              <div className="flex justify-center">
                <img 
                  src={movie.posterPath} 
                  alt={`${movie.title} poster`}
                  className="rounded-lg shadow-lg max-h-96 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="mb-8 p-6 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Review / Notes</h3>
            {movie.review ? (
              <p className="text-white whitespace-pre-wrap">{movie.review}</p>
            ) : (
              <p className="text-gray-500 italic">No review or notes added</p>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Link
              to={`/edit/${movie.id}`}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 text-center"
            >
              Edit Movie
            </Link>
            <button
              onClick={handleDeleteClick}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 cursor-pointer"
            >
              Delete Movie
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Movie"
        message="Are you sure you want to delete this movie? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default MovieDetail
