import { Link } from 'react-router-dom'
import { BsSafe2 } from "react-icons/bs";
import { PiFilmReel  } from "react-icons/pi";

function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <PiFilmReel className="w-11 h-11 text-white" />
            <BsSafe2 className="w-10 h-10 text-white" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              to="/collection" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Library
            </Link>
            <Link 
              to="/add" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              + Add Movie
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
