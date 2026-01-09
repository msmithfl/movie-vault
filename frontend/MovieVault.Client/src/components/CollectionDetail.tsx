import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  formats: string[];
  collections: string[];
  condition: string;
  rating: number;
  review: string;
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  createdAt?: string;
}

function CollectionDetail() {
  const { collectionName } = useParams<{ collectionName: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const MOVIES_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchMovies();
  }, [collectionName]);

  const fetchMovies = async () => {
    try {
      const response = await fetch(MOVIES_URL);
      if (response.ok) {
        const data = await response.json();
        // Filter movies that belong to this collection
        const filtered = data.filter((movie: Movie) => 
          movie.collections && movie.collections.includes(collectionName || '')
        );
        setMovies(filtered);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/collections')}
          className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
        >
          ← Back to Collections
        </button>
        <h1 className="text-3xl font-bold mb-2">{collectionName}</h1>
        <p className="text-gray-400">{movies.length} {movies.length === 1 ? 'movie' : 'movies'} in this collection</p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg mb-6">
            No movies in this collection yet.
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
              className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
            >
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectionDetail;
