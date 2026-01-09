import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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

interface Stats {
  total: number;
  dvd: number;
  bluray: number;
  fourK: number;
}

function Home() {
  const [stats, setStats] = useState<Stats>({ total: 0, dvd: 0, bluray: 0, fourK: 0 });
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const movies: Movie[] = await response.json();
        
        // Calculate stats - count by highest format (first alphabetically)
        const stats = {
          total: movies.length,
          dvd: movies.filter(m => {
            const highestFormat = m.formats.length > 0 ? [...m.formats].sort()[0] : '';
            return highestFormat === 'DVD';
          }).length,
          bluray: movies.filter(m => {
            const highestFormat = m.formats.length > 0 ? [...m.formats].sort()[0] : '';
            return highestFormat === 'Blu-ray';
          }).length,
          fourK: movies.filter(m => {
            const highestFormat = m.formats.length > 0 ? [...m.formats].sort()[0] : '';
            return highestFormat === '4K';
          }).length,
        };
        setStats(stats);

        // Get 5 most recent movies
        const recent = movies
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 5);
        setRecentMovies(recent);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-12">
        <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Total Movies</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="text-5xl">🎬</div>
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">DVD</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.dvd}</p>
            </div>
            <div className="text-5xl">💿</div>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Blu-ray</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.bluray}</p>
            </div>
            <div className="text-5xl">📀</div>
          </div>
        </div>

        <div className="bg-linear-to-br from-cyan-600 to-cyan-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-sm font-medium">4K Ultra HD</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.fourK}</p>
            </div>
            <div className="text-5xl">💎</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/add"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-8 transition-all duration-200 transform hover:scale-105 text-center"
          >
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-xl font-semibold mb-2">Add Movie</h3>
            <p className="text-gray-400">Add a new movie to your collection</p>
          </Link>

          <Link
            to="/collection"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-8 transition-all duration-200 transform hover:scale-105 text-center"
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">View Library</h3>
            <p className="text-gray-400">Browse your entire collection</p>
          </Link>

          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center opacity-50">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Statistics</h3>
            <p className="text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>

      {/* Recently Added */}
      {recentMovies.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recently Added</h2>
            <Link to="/collection" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              View All →
            </Link>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-700">
              {recentMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
                    {movie.formats && movie.formats.length > 0 ? (
                      <span className="inline-flex flex-wrap gap-1">
                        {[...movie.formats].sort().map((fmt, idx) => (
                          <span key={idx} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {fmt}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                    <span className="text-sm text-gray-400 font-mono">{movie.upcNumber}</span>
                  </div>
                  <div className="text-gray-400">→</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats.total === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📽️</div>
          <h3 className="text-2xl font-semibold mb-2">Your collection is empty</h3>
          <p className="text-gray-400 mb-6">Start building your movie library today!</p>
          <Link
            to="/add"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
          >
            Add Your First Movie
          </Link>
        </div>
      )}
    </div>
  )
}

export default Home
