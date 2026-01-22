import './TopRated.css';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function TopRated() {
    const [topByScore, setTopByScore] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProducts = async () => {
            setLoading(true);
            try {
                const scoreResponse = await productsAPI.getTopByScore();
                setTopByScore(scoreResponse.data);
            } catch (error) {
                console.error('Error fetching top products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, []);



    return (
        <div className="top-rated-page">
            <div className="container">
                {/* Header */}
                <div className="page-header fade-in">
                    <h1>Top Rated Sake</h1>
                    <p className="text-muted">Discover the highest-rated premium sake in our collection</p>
                </div>



                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-3">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '450px' }}></div>
                        ))}
                    </div>
                ) : (
                    <div className="top-products-grid fade-in">
                        {topByScore.map((product, index) => (
                            <div key={product.id} className="top-product-item">
                                <div className="podium-badge">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `#${index + 1}`}
                                </div>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopRated;
