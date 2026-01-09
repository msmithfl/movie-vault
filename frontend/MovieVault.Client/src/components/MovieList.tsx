import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  createdAt?: string;
}

type SortOption = 'date' | 'alphabetic' | 'format';

function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);
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

  const handleDeleteClick = (id: number) => {
    setMovieToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;

    try {
      const response = await fetch(`${API_URL}/${movieToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    } finally {
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMovieToDelete(null);
  };

  const getSortedMovies = () => {
    const sortedMovies = [...movies];
    
    switch (sortBy) {
      case 'alphabetic':
        return sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
      case 'format':
        return sortedMovies.sort((a, b) => {
          // Get first format alphabetically (4K < Blu-ray < DVD)
          const aFormat = a.formats.length > 0 ? [...a.formats].sort()[0] : 'ZZZ';
          const bFormat = b.formats.length > 0 ? [...b.formats].sort()[0] : 'ZZZ';
          return aFormat.localeCompare(bFormat);
        });
      case 'date':
      default:
        return sortedMovies.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
  };

  const sortedMovies = getSortedMovies();
  
  // Pagination calculations
  const totalPages = Math.ceil(sortedMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = sortedMovies.slice(startIndex, endIndex);
  
  // Reset to page 1 when changing items per page or sort
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };
  
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Library ({movies.length} items)</h2>
        {/* <Link
          to="/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          + Add Movie
        </Link> */}
      </div>

      {movies.length > 0 && (
        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-300">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
            >
              <option value="date">Date Added (Newest First)</option>
              <option value="alphabetic">Title (A-Z)</option>
              <option value="format">Format</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-300">
              Per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
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
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Condition</th> */}
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Rating</th> */}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Collection</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentMovies.map((movie) => (
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
                    {movie.formats && movie.formats.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {[...movie.formats].sort().map((fmt, idx) => (
                          <span key={idx} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  {/* <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      movie.condition === 'New' ? 'bg-green-600 text-white' :
                      movie.condition === 'Good' ? 'bg-blue-600 text-white' :
                      movie.condition === 'Skips' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {movie.condition}
                    </span>
                  </td> */}
                  {/* <td className="px-6 py-4 text-gray-300">
                    {movie.rating > 0 ? `${movie.rating} ⭐` : '-'}
                  </td> */}
                  <td className="px-6 py-4">
                    {movie.collections && movie.collections.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {[...movie.collections].sort().map((col, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs">
                            {col}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/edit/${movie.id}`}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-2 rounded-md transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => movie.id && handleDeleteClick(movie.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        aria-label="Delete movie"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedMovies.length)} of {sortedMovies.length} movies
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = page === 1 || 
                                    page === totalPages || 
                                    (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                        (page === currentPage + 2 && currentPage < totalPages - 2);
                    
                    if (showEllipsis) {
                      return <span key={page} className="px-3 py-2 text-gray-400">...</span>;
                    }
                    
                    if (!showPage) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-md transition cursor-pointer ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 border border-gray-600 text-white hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
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

export default MovieList
