import './ProductDetail.css';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import RecommendedProducts from '../components/RecommendedProducts';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsAPI.getById(id);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '600px' }}></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Product not found</h2>
                        <Link to="/products" className="btn btn-primary">Back to Products</Link>
                    </div>
                </div>
            </div>
        );
    }

    const defaultImage = 'https://via.placeholder.com/600x800/1a1a24/8b5cf6?text=Sake';
    const productImage = product.pictures && product.pictures.length > 0
        ? product.pictures[0]
        : defaultImage;

    return (
        <div className="product-detail-page">
            <div className="container">
                <Link to="/products" className="back-link">
                    ← Back to Products
                </Link>

                <div className="product-detail fade-in">
                    {/* Product Image */}
                    <div className="product-image-section">
                        <div className="product-image-wrapper">
                            <img
                                src={productImage}
                                alt={product.name}
                                onError={(e) => { e.target.src = defaultImage; }}
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-header">
                            <h1 className="product-title japanese-text">{product.name}</h1>
                            {product.intlName && (
                                <p className="product-subtitle">{product.intlName}</p>
                            )}
                        </div>

                        <div className="product-brand-info">
                            <span className="brand-label">Brand:</span>
                            <span className="brand-name japanese-text">{product.brandName}</span>
                            {product.brandIntlName && (
                                <span className="brand-intl">({product.brandIntlName})</span>
                            )}
                        </div>

                        {/* Score Section */}
                        <div className="score-section">
                            <div className="score-card main-score">
                                <div className="score-icon">⭐</div>
                                <div className="score-content">
                                    <div className="score-value">{product.score?.toFixed(3) || 'N/A'}</div>
                                    <div className="score-label">Overall Score</div>
                                </div>
                            </div>
                            <div className="score-card">
                                <div className="score-icon">✓</div>
                                <div className="score-content">
                                    <div className="score-value">{product.checkinCount || 0}</div>
                                    <div className="score-label">Check-ins</div>
                                </div>
                            </div>
                        </div>

                        {/* Flavor Scores */}
                        {(product.f1 || product.f2 || product.f3 || product.f4 || product.f5 || product.f6) && (
                            <div className="flavor-scores">
                                <h3>Flavor Profile</h3>
                                <div className="flavor-bars">
                                    {product.f1 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">華やか (Floral)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f1 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f1.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {product.f2 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">芳醇 (Rich)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f2 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f2.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {product.f3 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">重厚 (Full-bodied)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f3 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f3.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {product.f4 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">F4穏やか (Gentle)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f4 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f4.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {product.f5 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">ドライ (Dry)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f5 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f5.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {product.f6 !== undefined && (
                                        <div className="flavor-bar">
                                            <span className="flavor-label">軽快 (Light)</span>
                                            <div className="bar-container">
                                                <div className="bar-fill" style={{ width: `${product.f6 * 100}%` }}></div>
                                            </div>
                                            <span className="flavor-value">{product.f6.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Flavor Tags */}
                        {product.flavourTags && product.flavourTags.length > 0 && (
                            <div className="flavor-tags-section">
                                <h3>Flavor Tags</h3>
                                <div className="flavor-tags">
                                    {product.flavourTags.map((tag, index) => (
                                        <span key={index} className="flavor-tag japanese-text">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Similar Brands */}
                        {product.similarBrands && product.similarBrands.length > 0 && (
                            <div className="similar-brands-section">
                                <h3>Similar Brands</h3>
                                <div className="similar-brands">
                                    {product.similarBrands.map((brand, index) => (
                                        <span key={index} className="similar-brand japanese-text">{brand}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommended Products Section */}
                <RecommendedProducts productId={id} />
            </div>
        </div>
    );
}

export default ProductDetail;
