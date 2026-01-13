import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './components/Home'
import MovieList from './components/MovieList'
import AddMovie from './components/AddMovie'
import EditMovie from './components/EditMovie'
import MovieDetail from './components/MovieDetail'
import CollectionsView from './components/CollectionsView'
import CollectionDetail from './components/CollectionDetail'
import ShelfSectionsView from './components/ShelfSectionsView'
import ShelfSectionDetail from './components/ShelfSectionDetail'
import GenresView from './components/GenresView'
import GenreDetail from './components/GenreDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<MovieList />} />
            <Route path="/collections" element={<CollectionsView />} />
            <Route path="/collections/:collectionName" element={<CollectionDetail />} />
            <Route path="/shelfsections" element={<ShelfSectionsView />} />
            <Route path="/shelfsections/:sectionName" element={<ShelfSectionDetail />} />
            <Route path="/genres" element={<GenresView />} />
            <Route path="/genres/:genreName" element={<GenreDetail />} />
            <Route path="/add" element={<AddMovie />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/edit/:id" element={<EditMovie />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

