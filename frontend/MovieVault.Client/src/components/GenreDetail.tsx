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
  year: number;
  posterPath: string;
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  genres: string[];
  createdAt?: string;
}

function GenreDetail() {
  const { genreName } = useParams<{ genreName: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const MOVIES_URL = `${API_BASE}/api/movies`;

  useEffect(() => {
    fetchMovies();
  }, [genreName]);

  const fetchMovies = async () => {
    try {
      const moviesRes = await fetch(MOVIES_URL);
      
      if (moviesRes.ok) {
        const data = await moviesRes.json();
        const filtered = data.filter((movie: Movie) => 
          movie.genres && movie.genres.includes(genreName || '')
        );
        setMovies(filtered);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/genres')}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 cursor-pointer"
          >
            ← Back to Genres
          </button>
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold mb-2">{genreName}</h1>
          <span className="px-3 py-1 bg-gray-800 rounded-md font-medium outline-1 outline-gray-600">
            {movies.length}
          </span>
        </div>
      </div>

      {/* Movies Section */}
      <div>
        {movies.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-6">
              No movies in this genre yet.
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
                    <p className="text-gray-400 text-sm font-mono">{movie.year}</p>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GenreDetail;
