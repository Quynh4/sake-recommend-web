import './ProductCard.css';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    const defaultImage = 'https://via.placeholder.com/300x400/1a1a24/8b5cf6?text=Sake';
    const productImage = product.pictures && product.pictures.length > 0
        ? product.pictures[0]
        : defaultImage;

    return (
        <Link to={`/product/${product.id}`} className="product-card">
            <div className="product-card-image">
                <img
                    src={productImage}
                    alt={product.name}
                    onError={(e) => { e.target.src = defaultImage; }}
                />
            </div>

            <div className="product-card-content">
                <div className="product-header">
                    <h3 className="product-name japanese-text">{product.name}</h3>
                    {product.intlName && (
                        <p className="product-intl-name">{product.intlName}</p>
                    )}
                </div>

                <div className="product-brand">
                    <span className="brand-icon">🏷️</span>
                    <span className="japanese-text">{product.brandName}</span>
                    {product.brandIntlName && (
                        <span className="brand-intl">({product.brandIntlName})</span>
                    )}
                </div>

                <div className="product-stats">
                    <div className="stat">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-value">{product.score?.toFixed(2) || 'N/A'}</span>
                        <span className="stat-label">Score</span>
                    </div>
                    <div className="stat">
                        <span className="stat-icon">✓</span>
                        <span className="stat-value">{product.checkinCount || 0}</span>
                        <span className="stat-label">Check-ins</span>
                    </div>
                </div>

                {product.flavourTags && product.flavourTags.length > 0 && (
                    <div className="product-tags">
                        {product.flavourTags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag japanese-text">{tag}</span>
                        ))}
                        {product.flavourTags.length > 3 && (
                            <span className="tag-more">+{product.flavourTags.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default ProductCard;
