import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Counter from './Counter';
import BarcodeScanner from './BarcodeScanner'
import LoadingSpinner from './LoadingSpinner';
import { FaSortAmountDown, FaCog, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { TiStarOutline, TiStarHalfOutline, TiStarFullOutline } from 'react-icons/ti'
import { getRelativeTimeString } from '../utils/dateUtils';
import EmptyState from './EmptyState';

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
  hdDriveNumber: number;
  shelfNumber: number;
  shelfSection: string;
  isOnPlex: boolean;
  createdAt?: string;
}

type SortOption = 'date' | 'alphabetic' | 'format' | 'year' | 'condition' | 'rating';

interface VisibleColumns {
  year: boolean;
  format: boolean;
  condition: boolean;
  rating: boolean;
  dateAdded: boolean;
}

function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('movieListSortBy');
    return (saved as SortOption) || 'alphabetic';
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    const saved = localStorage.getItem('movieListSortDirection');
    return (saved as 'asc' | 'desc') || 'asc';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [upcSearchQuery, setUpcSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [showScanner, setShowScanner] = useState(false);
  const [showMobileOnlyMessage, setShowMobileOnlyMessage] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    const saved = localStorage.getItem('movieListColumns');
    return saved ? JSON.parse(saved) : {
      year: true,
      format: true,
      condition: true,
      rating: true,
      dateAdded: true,
    };
  });
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const API_URL = `${API_BASE}/api/movies`;

  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Save column preferences to localStorage
  useEffect(() => {
    localStorage.setItem('movieListColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Save sorting preferences to localStorage
  useEffect(() => {
    localStorage.setItem('movieListSortBy', sortBy);
    localStorage.setItem('movieListSortDirection', sortDirection);
  }, [sortBy, sortDirection]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedMovies = () => {
    const sortedMovies = [...movies];
    
    switch (sortBy) {
      case 'alphabetic':
        sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        sortedMovies.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'format':
        sortedMovies.sort((a, b) => {
          // Get first format alphabetically (4K < Blu-ray < DVD)
          const aFormat = a.formats.length > 0 ? [...a.formats].sort()[0] : 'ZZZ';
          const bFormat = b.formats.length > 0 ? [...b.formats].sort()[0] : 'ZZZ';
          return aFormat.localeCompare(bFormat);
        });
        break;
      case 'condition':
        sortedMovies.sort((a, b) => a.condition.localeCompare(b.condition));
        break;
      case 'rating':
        sortedMovies.sort((a, b) => a.rating - b.rating);
        break;
      case 'date':
      default:
        sortedMovies.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        break;
    }

    // Apply sort direction
    if (sortDirection === 'desc') {
      sortedMovies.reverse();
    }

    return sortedMovies;
  };

  const sortedMovies = getSortedMovies();
  
  // Filter movies by search query
  const filteredMovies = sortedMovies.filter(movie => {
    const matchesTitle = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUpc = movie.upcNumber.toLowerCase().includes(upcSearchQuery.toLowerCase());
    return matchesTitle && matchesUpc;
  });
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);
  
  // Reset to page 1 when changing items per page or sort
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };
  
  // const handleSortChange = (value: SortOption) => {
  //   setSortBy(value);
  //   setSortDirection('asc');
  //   setCurrentPage(1);
  // };

  // const toggleSortDirection = () => {
  //   setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  // };

  const handleColumnClick = (column: SortOption) => {
    if (column === sortBy) {
      // Same column, toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set it and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleUpcSearchChange = (value: string) => {
    setUpcSearchQuery(value);
    setCurrentPage(1);
  };

  const handleScanClick = () => {
    if (isMobile()) {
      setShowScanner(true);
    } else {
      setShowMobileOnlyMessage(true);
    }
  };

  const handleBarcodeDetected = (code: string) => {
    setUpcSearchQuery(code);
    setShowScanner(false);
    setCurrentPage(1);
  };

  const toggleColumn = (column: keyof VisibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        <LoadingSpinner message="Loading your collection..." />
      ) : (
        <>
      <div className="flex justify-between items-center mb-8">
        <div className='flex items-center gap-4'>
          <h2 className="text-3xl font-bold">Library</h2>
          <Counter count={movies.length} />
        </div>
        
        {/* Mobile Sort and Column Buttons */}
        {movies.length > 0 && (
          <div className="md:hidden flex gap-2">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Column options"
            >
              <FaCog className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Sort options"
            >
              <FaSortAmountDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {movies.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by UPC..."
                value={upcSearchQuery}
                onChange={(e) => handleUpcSearchChange(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleScanClick}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition cursor-pointer flex items-center justify-center"
                title="Scan barcode"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Desktop Sort Controls - Always Visible */}
          <div className="hidden md:flex items-center gap-6">
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
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white hover:border-gray-500 transition-colors cursor-pointer"
              >
                <FaCog className="w-4 h-4" />
                Columns
              </button>
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                  <div className="p-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.year}
                        onChange={() => toggleColumn('year')}
                        className="cursor-pointer"
                      />
                      <span className="text-sm text-white">Year</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.format}
                        onChange={() => toggleColumn('format')}
                        className="cursor-pointer"
                      />
                      <span className="text-sm text-white">Format</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.condition}
                        onChange={() => toggleColumn('condition')}
                        className="cursor-pointer"
                      />
                      <span className="text-sm text-white">Condition</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.rating}
                        onChange={() => toggleColumn('rating')}
                        className="cursor-pointer"
                      />
                      <span className="text-sm text-white">Rating</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.dateAdded}
                        onChange={() => toggleColumn('dateAdded')}
                        className="cursor-pointer"
                      />
                      <span className="text-sm text-white">Date Added</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Sort Controls - Toggle Visibility */}
          {showSortMenu && (
            <div className="md:hidden space-y-3 p-4 bg-gray-700 rounded-lg">
              <div className="flex flex-col gap-2">
                <label htmlFor="itemsPerPage-mobile" className="text-sm font-medium text-gray-300">
                  Per page:
                </label>
                <select
                  id="itemsPerPage-mobile"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}

          {/* Mobile Column Controls - Toggle Visibility */}
          {showColumnMenu && (
            <div className="md:hidden space-y-3 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Show Columns:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.year}
                    onChange={() => toggleColumn('year')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">Year</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.format}
                    onChange={() => toggleColumn('format')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">Format</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.condition}
                    onChange={() => toggleColumn('condition')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">Condition</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.rating}
                    onChange={() => toggleColumn('rating')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">Rating</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.dateAdded}
                    onChange={() => toggleColumn('dateAdded')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">Date Added</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {movies.length === 0 ? (
        <EmptyState message="No movies in your collection yet." />
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th 
                    onClick={() => handleColumnClick('alphabetic')}
                    className="px-6 py-2 text-left text-sm font-semibold text-gray-200 w-46 max-w-46 md:w-96 md:max-w-96 border-r border-gray-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      Title
                      {sortDirection === 'asc' ? (
                        <FaArrowUp className={`w-3 h-3 ${sortBy === 'alphabetic' ? '' : 'invisible'}`} />
                      ) : (
                        <FaArrowDown className={`w-3 h-3 ${sortBy === 'alphabetic' ? '' : 'invisible'}`} />
                      )}
                    </div>
                  </th>
                  {visibleColumns.year && (
                    <th 
                      onClick={() => handleColumnClick('year' as SortOption)}
                      className="px-6 py-2 text-left text-sm font-semibold text-gray-200 border-r border-gray-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Year
                        {sortDirection === 'asc' ? (
                          <FaArrowUp className={`w-3 h-3 ${sortBy === 'year' ? '' : 'invisible'}`} />
                        ) : (
                          <FaArrowDown className={`w-3 h-3 ${sortBy === 'year' ? '' : 'invisible'}`} />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.format && (
                    <th 
                      onClick={() => handleColumnClick('format')}
                      className="px-6 py-2 text-left text-sm font-semibold text-gray-200 border-r border-gray-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Format
                        {sortDirection === 'asc' ? (
                          <FaArrowUp className={`w-3 h-3 ${sortBy === 'format' ? '' : 'invisible'}`} />
                        ) : (
                          <FaArrowDown className={`w-3 h-3 ${sortBy === 'format' ? '' : 'invisible'}`} />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.condition && (
                    <th 
                      onClick={() => handleColumnClick('condition' as SortOption)}
                      className="px-6 py-2 text-left text-sm font-semibold text-gray-200 border-r border-gray-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Condition
                        {sortDirection === 'asc' ? (
                          <FaArrowUp className={`w-3 h-3 ${sortBy === 'condition' ? '' : 'invisible'}`} />
                        ) : (
                          <FaArrowDown className={`w-3 h-3 ${sortBy === 'condition' ? '' : 'invisible'}`} />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.rating && (
                    <th 
                      onClick={() => handleColumnClick('rating' as SortOption)}
                      className="pl-6 py-2 text-left text-sm font-semibold text-gray-200 border-r border-gray-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Rating
                        {sortDirection === 'asc' ? (
                          <FaArrowUp className={`w-3 h-3 ${sortBy === 'rating' ? '' : 'invisible'}`} />
                        ) : (
                          <FaArrowDown className={`w-3 h-3 ${sortBy === 'rating' ? '' : 'invisible'}`} />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.dateAdded && (
                    <th 
                      onClick={() => handleColumnClick('date')}
                      className="px-6 pr-10 py-2 text-left text-sm font-semibold text-gray-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Date Added
                        {sortDirection === 'asc' ? (
                          <FaArrowUp className={`w-3 h-3 ${sortBy === 'date' ? '' : 'invisible'}`} />
                        ) : (
                          <FaArrowDown className={`w-3 h-3 ${sortBy === 'date' ? '' : 'invisible'}`} />
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
              {currentMovies.map((movie) => (
                <tr 
                  key={movie.id}
                  className="hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-6 py-2 text-white w-46 max-w-46 md:w-96 md:max-w-96 align-middle">
                    <Link to={`/movie/${movie.id}`} className="hover:text-indigo-400 transition-colors inline-block truncate max-w-full align-middle" title={movie.title}>
                      {movie.title}
                    </Link>
                  </td>
                  {visibleColumns.year && (
                    <td className="px-6 py-2 text-gray-300 whitespace-nowrap align-middle">
                      {movie.year || '-'}
                    </td>
                  )}
                  {visibleColumns.format && (
                    <td className="px-6 py-2 whitespace-nowrap align-middle">
                      {movie.formats && movie.formats.length > 0 ? (
                        <div className="flex gap-1">
                          {[...movie.formats].sort().map((fmt, idx) => (
                            <span key={idx} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                              {fmt}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.condition && (
                    <td className="px-6 py-2 text-gray-300 whitespace-nowrap align-middle">{movie.condition}</td>
                  )}
                  {visibleColumns.rating && (
                    <td className="pl-6 py-2 whitespace-nowrap align-middle">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFullStar = movie.rating >= star;
                          const isHalfStar = movie.rating === star - 0.5;
                          
                          return (
                            <div key={star}>
                              {isFullStar ? (
                                <TiStarFullOutline className="w-5 h-5 text-yellow-400" />
                              ) : isHalfStar ? (
                                <TiStarHalfOutline className="w-5 h-5 text-yellow-400" />
                              ) : (
                                <TiStarOutline className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  )}
                  {visibleColumns.dateAdded && (
                    <td className="px-6 py-2 text-gray-300 whitespace-nowrap align-middle">
                      {getRelativeTimeString(movie.createdAt)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
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

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showMobileOnlyMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Mobile Only Feature</h3>
              <button
                onClick={() => setShowMobileOnlyMessage(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              The UPC barcode scanner is only available on mobile devices. Please use a smartphone or tablet to scan barcodes.
            </p>
            <button
              onClick={() => setShowMobileOnlyMessage(false)}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default MovieList;
