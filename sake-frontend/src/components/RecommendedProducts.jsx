import './RecommendedProducts.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

function RecommendedProducts({ productId }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const response = await productsAPI.getRecommendations(productId);
                setRecommendations(response.data || []);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchRecommendations();
        }
    }, [productId]);

    const handleCardClick = (recId) => {
        if (recId) {
            navigate(`/product/${recId}`);
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="recommended-products">
                <h2>Recommended Products</h2>
                <div className="recommendations-grid">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="recommendation-card skeleton">
                            <div className="skeleton-content"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    const defaultImage = 'https://via.placeholder.com/300x400/1a1a24/8b5cf6?text=Sake';

    return (
        <div className="recommended-products fade-in">
            <h2>Recommended Products</h2>
            <p className="recommendations-subtitle">Based on flavor profile and ratings</p>

            <div className="recommendations-grid">
                {recommendations.map((rec, index) => {
                    const productImage = rec.pictures && rec.pictures.length > 0
                        ? rec.pictures[0]
                        : defaultImage;

                    return (
                        <div
                            key={index}
                            className="recommendation-card"
                            onClick={() => handleCardClick(rec.id)}
                        >
                            <div className="rec-image-wrapper">
                                <img
                                    src={productImage}
                                    alt={rec.name}
                                    onError={(e) => { e.target.src = defaultImage; }}
                                />
                                <div className="rec-rank-badge">#{rec.rank}</div>
                            </div>

                            <div className="rec-content">
                                <h3 className="rec-name japanese-text">{rec.name}</h3>
                                {rec.intl_name && (
                                    <p className="rec-intl-name">{rec.intl_name}</p>
                                )}
                                <p className="rec-brand japanese-text">{rec.brand}</p>
                                {rec.brand_intl_name && (
                                    <p className="rec-brand-intl">({rec.brand_intl_name})</p>
                                )}

                                <div className="rec-stats">
                                    <div className="rec-stat">
                                        <span className="stat-icon">⭐</span>
                                        <span className="stat-value">{rec.score?.toFixed(2)}</span>
                                    </div>
                                    <div className="rec-stat">
                                        <span className="stat-icon">✓</span>
                                        <span className="stat-value">{rec.checkin_count}</span>
                                    </div>
                                </div>

                                {rec.flavors && (
                                    <div className="rec-flavors">
                                        <div className="flavor-mini-bars">
                                            {Object.entries(rec.flavors).map(([key, value]) => (
                                                <div key={key} className="flavor-mini-bar">
                                                    <div
                                                        className="flavor-mini-fill"
                                                        style={{ width: `${value * 100}%` }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {rec.flavour_tags && rec.flavour_tags.length > 0 && (
                                    <div className="rec-tags">
                                        {rec.flavour_tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="rec-tag japanese-text">{tag}</span>
                                        ))}
                                        {rec.flavour_tags.length > 3 && (
                                            <span className="rec-tag-more">+{rec.flavour_tags.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RecommendedProducts;
