import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-bold">🎬 MovieVault</h1>
        </Link>
      </div>
    </header>
  )
}

export default Header
