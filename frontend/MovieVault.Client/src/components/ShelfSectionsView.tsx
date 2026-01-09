import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ShelfSection | null>(null);
  const [editingSection, setEditingSection] = useState<ShelfSection | null>(null);
  const [editedName, setEditedName] = useState('');

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

  const handleDeleteClick = (section: ShelfSection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSectionToDelete(section);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sectionToDelete) return;

    try {
      const response = await fetch(`${SECTIONS_URL}/${sectionToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting shelf section:', error);
    } finally {
      setShowDeleteConfirm(false);
      setSectionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSectionToDelete(null);
  };

  const handleEditClick = (section: ShelfSection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSection(section);
    setEditedName(section.name);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editedName.trim()) return;

    try {
      const response = await fetch(`${SECTIONS_URL}/${editingSection.id}?newName=${encodeURIComponent(editedName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchData();
        setEditingSection(null);
        setEditedName('');
      }
    } catch (error) {
      console.error('Error updating shelf section:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
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
            const isEditing = editingSection?.id === section.id;
            
            return (
              <div key={section.id} className="relative">
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
                      to={`/shelfsections/${encodeURIComponent(section.name)}`}
                      className="block bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => handleEditClick(section, e)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition"
                        title="Edit shelf section"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(section, e)}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-md transition"
                        title="Delete shelf section"
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
        title="Delete Shelf Section"
        message={`Are you sure you want to delete "${sectionToDelete?.name}"? This will remove it from all movies but won't delete the movies themselves.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default ShelfSectionsView;
