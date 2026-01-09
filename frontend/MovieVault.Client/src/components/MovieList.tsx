import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  format: string;
  createdAt?: string;
}

type SortOption = 'date' | 'alphabetic' | 'format';

function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const API_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const getSortedMovies = () => {
    const sortedMovies = [...movies];
    
    switch (sortBy) {
      case 'alphabetic':
        return sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
      case 'format':
        return sortedMovies.sort((a, b) => a.format.localeCompare(b.format));
      case 'date':
      default:
        return sortedMovies.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
  };

  const sortedMovies = getSortedMovies();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">My Collection ({movies.length} items)</h2>
        <Link
          to="/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          + Add Movie
        </Link>
      </div>

      {movies.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="sortBy" className="text-sm font-medium text-gray-300">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="date">Date Added (Newest First)</option>
            <option value="alphabetic">Title (A-Z)</option>
            <option value="format">Format</option>
          </select>
        </div>
      )}

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-6">
            No movies in your collection yet.
          </p>
          <Link
            to="/add"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
          >
            Add Your First Movie
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Format</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">UPC Number</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedMovies.map((movie) => (
                <tr 
                  key={movie.id}
                  className="hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                  onClick={() => window.location.href = `/movie/${movie.id}`}
                >
                  <td className="px-6 py-4 text-white font-medium">
                    <Link to={`/movie/${movie.id}`} className="hover:text-indigo-400 transition-colors">
                      {movie.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {movie.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">{movie.upcNumber}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/edit/${movie.id}`}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-2 rounded-md transition-colors duration-200"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => movie.id && handleDelete(movie.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors duration-200"
                        aria-label="Delete movie"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MovieList
