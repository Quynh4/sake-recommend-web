import './Home.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function Home() {
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await productsAPI.getTopByRank();
                setTopProducts(response.data.slice(0, 6));
            } catch (error) {
                console.error('Error fetching top products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            Discover Premium
                            <br />
                            <span className="japanese-text">Japanese Sake</span>
                        </h1>
                        <p className="hero-subtitle">
                            Explore the finest collection of authentic Japanese sake with detailed ratings,
                            flavor profiles, and expert recommendations
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary">
                                <span>Browse Collection</span>
                                <span>→</span>
                            </Link>
                            <Link to="/top-rated" className="btn btn-secondary">
                                <span>Top Rated</span>
                                <span>⭐</span>
                            </Link>
                        </div>
                    </div>

                    <div className="hero-stats slide-in">
                        <div className="stat-card">
                            <div className="stat-icon">🍶</div>
                            <div className="stat-info">
                                <div className="stat-number">1000+</div>
                                <div className="stat-label">Premium Sake</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-info">
                                <div className="stat-number">4.5+</div>
                                <div className="stat-label">Average Rating</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🏆</div>
                            <div className="stat-info">
                                <div className="stat-number">Top 100</div>
                                <div className="stat-label">Curated List</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Top Ranked Sake</h2>
                        <p className="text-muted">Discover our highest-rated premium sake collection</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '400px' }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-3 fade-in">
                            {topProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="section-footer">
                        <Link to="/products" className="btn btn-primary">
                            View All Products
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
