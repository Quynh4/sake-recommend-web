import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <i className="fas fa-wine-bottle brand-icon"></i>
                        <span className="brand-text">
                            <span className="brand-main">Sake Explorer</span>
                            <span className="brand-sub japanese-text">日本酒</span>
                        </span>
                    </Link>

                    <div className="navbar-links">
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <i className="fas fa-home nav-icon"></i>
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                        >
                            <i className="fas fa-boxes nav-icon"></i>
                            Products
                        </Link>
                        <Link
                            to="/top-rated"
                            className={`nav-link ${location.pathname === '/top-rated' ? 'active' : ''}`}
                        >
                            <i className="fas fa-star nav-icon"></i>
                            Top Rated
                        </Link>
                        <Link
                            to="/flavor-search"
                            className={`nav-link ${location.pathname === '/flavor-search' ? 'active' : ''}`}
                        >
                            <i className="fas fa-sliders-h nav-icon"></i>
                            Flavor Search
                        </Link>
                        <Link
                            to="/ask-recommend"
                            className={`nav-link ${location.pathname === '/ask-recommend' ? 'active' : ''}`}
                        >
                            <i className="fas fa-robot nav-icon"></i>
                            Ask AI
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
