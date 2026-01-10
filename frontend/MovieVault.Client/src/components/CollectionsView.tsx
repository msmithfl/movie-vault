import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Collection {
  id: number;
  name: string;
  createdAt: string;
}

interface Movie {
  id?: number;
  title: string;
  collections: string[];
}

function CollectionsView() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5156';
  const COLLECTIONS_URL = `${API_BASE}/api/collections`;
  const MOVIES_URL = `${API_BASE}/api/movies`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collectionsRes, moviesRes] = await Promise.all([
        fetch(COLLECTIONS_URL),
        fetch(MOVIES_URL)
      ]);

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
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

  const getMovieCount = (collectionName: string) => {
    return movies.filter(movie => 
      movie.collections && movie.collections.includes(collectionName)
    ).length;
  };

  const createCollection = async () => {
    if (newCollectionName && !collections.find(c => c.name === newCollectionName)) {
      try {
        const response = await fetch(COLLECTIONS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCollectionName }),
        });
        
        if (response.ok) {
          const newCollection = await response.json();
          setCollections([...collections, newCollection].sort((a, b) => a.name.localeCompare(b.name)));
          setNewCollectionName('');
          setShowCreateInput(false);
        }
      } catch (error) {
        console.error('Error creating collection:', error);
      }
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
        <h1 className="text-3xl font-bold mb-2">Collections</h1>
        <p className="text-gray-400">Browse your movie collections</p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-400 text-lg mb-6">
            No collections yet. Add movies to create collections.
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
          {collections.map((collection) => {
            const movieCount = getMovieCount(collection.name);
            return (
              <Link
                key={collection.id}
                to={`/collections/${encodeURIComponent(collection.name)}`}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
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
          {showCreateInput ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-indigo-500 flex flex-col gap-4 min-h-30">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                placeholder="Collection name"
                autoFocus
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={createCollection}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition cursor-pointer"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewCollectionName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateInput(true)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105 border-2 border-dashed border-gray-600 hover:border-indigo-500 flex items-center justify-center min-h-30 cursor-pointer"
            >
              <div className="text-center">
                <div className="text-5xl text-gray-500 mb-2">+</div>
                <p className="text-gray-400 text-sm">New Collection</p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CollectionsView;
