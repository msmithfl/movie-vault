import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import EmptyState from './EmptyState'
import MovieDetailCard from './MovieDetailCard'
import Counter from './Counter'

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
          <Counter count={movies.length} className="mb-2" />
        </div>
      </div>

      {/* Movies Section */}
      <div>
        {movies.length === 0 ? (
          <EmptyState message="No movies in this genre yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieDetailCard key={movie.id} movie={movie} showYear />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GenreDetail;
