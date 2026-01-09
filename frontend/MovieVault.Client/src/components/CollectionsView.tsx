import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editedName, setEditedName] = useState('');

  const COLLECTIONS_URL = 'http://localhost:5156/api/collections';
  const MOVIES_URL = 'http://localhost:5156/api/movies';

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

  const handleDeleteClick = (collection: Collection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollectionToDelete(collection);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;

    try {
      const response = await fetch(`${COLLECTIONS_URL}/${collectionToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    } finally {
      setShowDeleteConfirm(false);
      setCollectionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCollectionToDelete(null);
  };

  const handleEditClick = (collection: Collection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCollection(collection);
    setEditedName(collection.name);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editedName.trim()) return;

    try {
      const response = await fetch(`${COLLECTIONS_URL}/${editingCollection.id}?newName=${encodeURIComponent(editedName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchData();
        setEditingCollection(null);
        setEditedName('');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCollection(null);
    setEditedName('');
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
            const isEditing = editingCollection?.id === collection.id;
            
            return (
              <div key={collection.id} className="relative">
                {isEditing ? (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSaveEdit}>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white mb-4"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="group relative">
                    <Link
                      to={`/collections/${encodeURIComponent(collection.name)}`}
                      className="block bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => handleEditClick(collection, e)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition"
                        title="Edit collection"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(collection, e)}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-md transition"
                        title="Delete collection"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collectionToDelete?.name}"? This will remove it from all movies but won't delete the movies themselves.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default CollectionsView;
