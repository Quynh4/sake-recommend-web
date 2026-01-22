import { useState } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './AskRecommend.css';

function AskRecommend() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const exampleQueries = [
        "I want a sweet red wine with fruity flavor",
        "Strong whisky with smoky and oak notes",
        "Light and smooth sake for beginners",
        "Pure vodka without smell for cocktails",
        "Gin with herbal and citrus notes",
        "Sweet rum with caramel and vanilla taste"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a description of the liquor you want');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await productsAPI.getRecommendationsByText(query, 6);
            setRecommendations(response.data.results || []);

            if (response.data.results.length === 0) {
                setError('No matching products found. Please try a different description.');
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError('An error occurred while searching. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleExampleClick = (example) => {
        setQuery(example);
    };

    return (
        <div className="ask-recommend-page">
            <div className="ask-recommend-container">
                <div className="ask-recommend-header">
                    <h1 className="page-title">
                        <span className="icon">🤔</span>
                        Find Your Perfect Liquor
                    </h1>
                    <p className="page-subtitle">
                        Describe what you're looking for, and we'll suggest the best matches
                    </p>
                </div>

                <div className="search-section">
                    <form onSubmit={handleSubmit} className="search-form">
                        <div className="input-group">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., I want a sweet red wine with fruity notes..."
                                className="search-input"
                                rows="4"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="search-button"
                                disabled={loading || !query.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-search"></i>
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="examples-section">
                        <p className="examples-title">💡 Example queries:</p>
                        <div className="examples-grid">
                            {exampleQueries.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExampleClick(example)}
                                    className="example-chip"
                                    disabled={loading}
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="icon">⚠️</span>
                        {error}
                    </div>
                )}

                {hasSearched && !loading && !error && recommendations.length > 0 && (
                    <div className="results-section">
                        <div className="results-header">
                            <h2 className="results-title">
                                Recommended Products ({recommendations.length} items)
                            </h2>
                            <p className="results-subtitle">
                                Based on: "<em>{query}</em>"
                            </p>
                        </div>

                        <div className="products-grid">
                            {recommendations.map((product) => (
                                <div key={product.id} className="product-card-wrapper">
                                    <ProductCard product={product} />
                                    <div className="similarity-badge">
                                        <span className="similarity-icon">✨</span>
                                        Match: {(product.similarityScore * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasSearched && !loading && !error && recommendations.length === 0 && (
                    <div className="no-results">
                        <span className="icon">😔</span>
                        <p>No matching products found</p>
                        <p className="hint">Try a more detailed description or use the suggestions above</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AskRecommend;
