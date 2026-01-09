import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface ShelfSection {
  id: number;
  name: string;
  createdAt: string;
}

interface Movie {
  id?: number;
  title: string;
  shelfSection: string;
}

function ShelfSectionsView() {
  const [shelfSections, setShelfSections] = useState<ShelfSection[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const SECTIONS_URL = 'http://localhost:5156/api/shelfsections';
  const MOVIES_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsRes, moviesRes] = await Promise.all([
        fetch(SECTIONS_URL),
        fetch(MOVIES_URL)
      ]);

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setShelfSections(sectionsData);
      }

      if (moviesRes.ok) {
        const moviesData = await moviesRes.json();
        setMovies(moviesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovieCount = (sectionName: string) => {
    return movies.filter(movie => 
      movie.shelfSection && movie.shelfSection === sectionName
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
        <h1 className="text-3xl font-bold mb-2">Shelf Sections</h1>
        <p className="text-gray-400">Browse your shelf sections</p>
      </div>

      {shelfSections.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg mb-6">
            No shelf sections yet. Add movies to create shelf sections.
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
          {shelfSections.map((section) => {
            const movieCount = getMovieCount(section.name);
            return (
              <Link
                key={section.id}
                to={`/shelfsections/${encodeURIComponent(section.name)}`}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{section.name}</h3>
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

export default ShelfSectionsView;
