import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import TopRated from './pages/TopRated';
import AskRecommend from './pages/AskRecommend';
import FlavorSearch from './pages/FlavorSearch';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/top-rated" element={<TopRated />} />
                    <Route path="/ask-recommend" element={<AskRecommend />} />
                    <Route path="/flavor-search" element={<FlavorSearch />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
