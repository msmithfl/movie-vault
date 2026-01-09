import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  format: string;
  createdAt?: string;
}

function MovieDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5156/api/movies';

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMovie(data);
      } else {
        navigate('/collection');
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      navigate('/collection');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigate('/collection');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/collection')}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors"
        >
          ← Back to Collection
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Format</h3>
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-lg font-medium">
                  {movie.format}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">UPC Number</h3>
              <p className="text-xl font-mono text-white bg-gray-700 px-4 py-2 rounded-md inline-block">
                {movie.upcNumber}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Date Added</h3>
              <p className="text-lg text-white">{formatDate(movie.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Movie ID</h3>
              <p className="text-lg text-white font-mono">#{movie.id}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Link
              to={`/edit/${movie.id}`}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 text-center"
            >
              ✏️ Edit Movie
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              🗑️ Delete Movie
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail
