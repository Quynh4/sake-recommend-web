import './FlavorSearch.css';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function FlavorSearch() {
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [flavorProfile, setFlavorProfile] = useState({
        f1: 0.5, f2: 0.5, f3: 0.5, f4: 0.5, f5: 0.5, f6: 0.5
    });

    const flavorLabels = {
        f1: { name: '華やか (Floral)', icon: 'fa-star' },
        f2: { name: '芳醇 (Rich)', icon: 'fa-wine-bottle' },
        f3: { name: '重厚 (Full-bodied)', icon: 'fa-weight-hanging' },
        f4: { name: '穏やか (Gentle)', icon: 'fa-leaf' },
        f5: { name: 'ドライ (Dry)', icon: 'fa-sun' },
        f6: { name: '軽快 (Light)', icon: 'fa-feather' }
    };

    const presets = {
        balanced: {
            icon: 'fa-balance-scale',
            values: { f1: 0.4, f2: 0.4, f3: 0.4, f4: 0.4, f5: 0.4, f6: 0.4 }
        },

        rich: { // 芳醇・重厚
            icon: 'fa-wine-bottle',
            values: { f1: 0.5, f2: 0.8, f3: 0.7, f4: 0.5, f5: 0.2, f6: 0.2 }
        },

        light: { // 軽快・飲みやすい
            icon: 'fa-feather',
            values: { f1: 0.3, f2: 0.3, f3: 0.2, f4: 0.5, f5: 0.4, f6: 0.8 }
        },

        dry: { // ドライ・キレ
            icon: 'fa-sun',
            values: { f1: 0.3, f2: 0.5, f3: 0.5, f4: 0.3, f5: 0.8, f6: 0.6 }
        },

        sweet: { // 甘口・やさしい
            icon: 'fa-candy-cane',
            values: { f1: 0.7, f2: 0.6, f3: 0.3, f4: 0.7, f5: 0.1, f6: 0.5 }
        },

        sparkling: { // 爽快・フレッシュ
            icon: 'fa-champagne-glasses',
            values: { f1: 0.5, f2: 0.4, f3: 0.3, f4: 0.4, f5: 0.6, f6: 0.7 }
        }
    };



    const handleSearch = async () => {
        setLoading(true);
        try {
            // Call backend API for Cosine Similarity calculation
            const response = await productsAPI.searchByFlavorProfile(flavorProfile, 15);

            // Backend returns FlavorSearchResult[] with product, similarity, similarityPercent
            const results = response.data.map(result => ({
                ...result.product,
                similarity: result.similarity,
                similarityPercent: result.similarityPercent
            }));

            setSearchResults(results);
        } catch (error) {
            console.error('Error searching by flavor profile:', error);
            // Optionally show error message to user
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (flavor, value) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
            setFlavorProfile(prev => ({ ...prev, [flavor]: numValue }));
        }
    };

    const getSimilarityColor = (similarity) => {
        if (similarity >= 0.9) return '#10b981';
        if (similarity >= 0.7) return '#3b82f6';
        if (similarity >= 0.5) return '#f59e0b';
        return '#ef4444';
    };

    const getSimilarityIcon = (similarity) => {
        if (similarity >= 0.9) return 'fa-trophy';
        if (similarity >= 0.7) return 'fa-medal';
        if (similarity >= 0.5) return 'fa-thumbs-up';
        return 'fa-circle-info';
    };

    return (
        <div className="flavor-search-page">
            <div className="container">
                <div className="page-header">
                    <h1><i className="fas fa-bullseye"></i> Flavor Search</h1>
                    <p><i className="fas fa-calculator"></i> Find products by flavor profile using Cosine Similarity</p>
                </div>

                <div className="search-panel">
                    {/* Presets */}
                    <div className="presets">
                        {Object.keys(presets).map(key => (
                            <button
                                key={key}
                                className="preset-btn"
                                onClick={() => setFlavorProfile(presets[key].values)}
                            >
                                <i className={`fas ${presets[key].icon}`}></i> {key}
                            </button>
                        ))}
                    </div>

                    {/* Compact Sliders */}
                    <div className="sliders-compact">
                        {Object.keys(flavorProfile).map(flavor => (
                            <div key={flavor} className="slider-row">
                                <label>
                                    <i className={`fas ${flavorLabels[flavor].icon}`}></i> {flavorLabels[flavor].name}
                                </label>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={flavorProfile[flavor]}
                                    onChange={(e) => handleValueChange(flavor, e.target.value)}
                                />
                                <input
                                    type="number"
                                    min="0" max="1" step="0.01"
                                    value={flavorProfile[flavor].toFixed(2)}
                                    onChange={(e) => handleValueChange(flavor, e.target.value)}
                                    className="num-input"
                                />
                            </div>
                        ))}
                    </div>

                    <button className="search-btn" onClick={handleSearch} disabled={loading}>
                        <i className="fas fa-search"></i> {loading ? 'Searching...' : 'Search Products'}
                    </button>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                    <div className="results">
                        <h2><i className="fas fa-chart-line"></i> Top 15 Matches</h2>
                        <div className="results-grid">
                            {searchResults.slice(0, 15).map((product, idx) => (
                                <div key={product.id} className="result-item">
                                    <div className="result-header">
                                        <span className="rank">
                                            <i className={`fas ${getSimilarityIcon(product.similarity)}`}></i> #{idx + 1}
                                        </span>
                                        <div
                                            className="similarity-badge"
                                            style={{ backgroundColor: getSimilarityColor(product.similarity) }}
                                        >
                                            <i className="fas fa-percentage"></i> {product.similarityPercent}
                                        </div>
                                    </div>
                                    <ProductCard product={product} />
                                    <div className="mini-bars">
                                        {Object.keys(flavorProfile).map(f => {
                                            const diff = Math.abs(flavorProfile[f] - (product[f] || 0));
                                            return (
                                                <div key={f} className="bar-item">
                                                    <span className="bar-label">
                                                        <i className={`fas ${flavorLabels[f].icon}`}></i>
                                                    </span>
                                                    <div className="bar-track">
                                                        <div className="bar-user" style={{ width: `${flavorProfile[f] * 100}%` }} />
                                                        <div className="bar-prod" style={{ width: `${(product[f] || 0) * 100}%` }} />
                                                    </div>
                                                    <span
                                                        className="bar-diff"
                                                        style={{ color: diff < 0.1 ? '#10b981' : diff < 0.3 ? '#f59e0b' : '#ef4444' }}
                                                    >
                                                        {diff.toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="loading">
                        <div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div>
                        <p>Loading...</p>
                    </div>
                )}

                {!loading && searchResults.length === 0 && (
                    <div className="empty">
                        <div className="empty-icon"><i className="fas fa-bullseye"></i></div>
                        <h3>Ready to Search</h3>
                        <p><i className="fas fa-hand-pointer"></i> Choose a preset or adjust sliders, then click Search</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlavorSearch;
