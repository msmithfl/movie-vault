import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CollectionCard from './CollectionCard'
import Counter from './Counter'
import EmptyState from './EmptyState'

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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold">Genres</h1>
        <Counter count={genres.length} />
      </div>

      {genres.length === 0 ? (
        <EmptyState message="No genres yet. Add movies to see genres." buttonText="Add Your First Movie" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {genres.map((genre) => {
            const movieCount = getMovieCount(genre);
            return (
              <CollectionCard
                key={genre}
                collection={{ id: 0, name: genre }}
                movieCount={movieCount}
                completionPercentage={null}
                urlPath='genres'
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GenresView;
