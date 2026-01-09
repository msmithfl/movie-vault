import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Movie {
  id?: number;
  title: string;
  upcNumber: string;
  format: string;
  createdAt?: string;
}

function EditMovie() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Movie>({
    title: '',
    upcNumber: '',
    format: 'DVD'
  });
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
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/collection');
      }
    } catch (error) {
      console.error('Error updating movie:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/collection')}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors"
        >
          ← Back to Collection
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6">Edit Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Movie Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter movie title"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="upc" className="block text-sm font-medium text-gray-300 mb-2">
              UPC Number *
            </label>
            <input
              type="text"
              id="upc"
              value={formData.upcNumber}
              onChange={(e) => setFormData({ ...formData, upcNumber: e.target.value })}
              required
              placeholder="Enter UPC barcode number"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-2">
              Format *
            </label>
            <select
              id="format"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="DVD">DVD</option>
              <option value="Blu-ray">Blu-ray</option>
              <option value="4K">4K Ultra HD</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/collection')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMovie
