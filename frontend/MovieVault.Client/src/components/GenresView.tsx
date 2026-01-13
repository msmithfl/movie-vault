import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Movie {
  id?: number;
  title: string;
  genres: string[];
}

function GenresView() {
  const [genres, setGenres] = useState<string[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const MOVIES_URL = `${API_BASE}/api/movies`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const moviesRes = await fetch(MOVIES_URL);

      if (moviesRes.ok) {
        const moviesData = await moviesRes.json();
        setMovies(moviesData);
        
        // Extract unique genres from all movies
        const uniqueGenres = new Set<string>();
        moviesData.forEach((movie: Movie) => {
          if (movie.genres && movie.genres.length > 0) {
            movie.genres.forEach(genre => uniqueGenres.add(genre));
          }
        });
        
        setGenres(Array.from(uniqueGenres).sort());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovieCount = (genreName: string) => {
    return movies.filter(movie => 
      movie.genres && movie.genres.includes(genreName)
    ).length;
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
        <h1 className="text-3xl font-bold mb-2">Genres</h1>
      </div>

      {genres.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-gray-400 text-lg mb-6">
            No genres yet. Add movies to see genres.
          </p>
          <Link
            to="/add"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
          >
            Add Your First Movie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {genres.map((genre) => {
            const movieCount = getMovieCount(genre);
            return (
              <Link
                key={genre}
                to={`/genres/${encodeURIComponent(genre)}`}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{genre}</h3>
                    <p className="text-gray-400 text-sm">
                      {movieCount} {movieCount === 1 ? 'movie' : 'movies'}
                    </p>
                  </div>
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {movieCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GenresView;
