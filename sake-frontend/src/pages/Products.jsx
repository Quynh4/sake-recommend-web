import './Products.css';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rank');
    const [direction, setDirection] = useState('asc');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchProducts();
        // reset to first page when filter changes
        // Note: fetchProducts will setPage(0) when necessary
    }, [page, sortBy, direction, filterType]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // If a flavor filter is active (not 'all'), use searchByFlavour
            if (filterType && filterType !== 'all') {
                // When switching filters, ensure we fetch first page
                const response = await productsAPI.searchByFlavour(filterType, { page, size: 20 });
                setProducts(response.data.content || response.data || []);
                setTotalPages(response.data.totalPages ?? 0);
                return;
            }

            // If no flavor filter, respect current sort/pagination
            const response = await productsAPI.getAll({
                page,
                size: 20,
                sortBy,
                direction
            });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            // clear any flavor filter when doing a generic search
            setFilterType('all');
            fetchProducts();
            return;
        }

        setLoading(true);
        try {
            const response = await productsAPI.search(searchTerm, { page: 0, size: 20 });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
            setPage(0);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (key) => {
        // clicking same filter toggles to 'all'
        const next = key === filterType ? 'all' : key;
        setFilterType(next);
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="products-page">
            <div className="container">
                {/* Header */}
                <div className="page-header fade-in">
                    <h1>Sake Collection</h1>
                    <p className="text-muted">Browse our extensive collection of premium Japanese sake</p>
                </div>

                {/* Search and Filters */}
                <div className="filters-section slide-in">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search by name, brand, or flavor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-primary">
                            <i className="fas fa-search"></i> Search
                        </button>
                    </form>

                    <div className="sort-controls">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            {/* <option value="rank">Rank</option> */}
                            <option value="score">Score</option>
                            <option value="name">Name</option>
                            <option value="checkinCount">Check-ins</option>
                        </select>

                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            className="sort-select"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-3">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '450px' }}></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍶</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-3 fade-in">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn btn-secondary"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                        >
                            ← Previous
                        </button>

                        <div className="page-info">
                            <span className="current-page">{page + 1}</span>
                            <span className="page-separator">/</span>
                            <span className="total-pages">{totalPages}</span>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
