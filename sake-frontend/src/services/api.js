import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Recommendation API - gọi trực tiếp service
const recommendationAPI = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Products API
export const productsAPI = {
    // Get all products with pagination
    getAll: (params = {}) => {
        const { page = 0, size = 20, sortBy = 'rank', direction = 'asc' } = params;
        return api.get('/products', { params: { page, size, sortBy, direction } });
    },

    // Get product by ID
    getById: (id) => api.get(`/products/${id}`),

    // Search products
    search: (keyword, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/search', { params: { keyword, page, size } });
    },

    // Search by name
    searchByName: (name, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/search/name', { params: { name, page, size } });
    },

    // Search by brand
    searchByBrand: (brand, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/search/brand', { params: { brand, page, size } });
    },

    // Filter by rank
    filterByRank: (min, max, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/filter/rank', { params: { min, max, page, size } });
    },

    // Filter by score
    filterByScore: (min, max, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/filter/score', { params: { min, max, page, size } });
    },

    // Search by flavour tag
    searchByFlavour: (tag, params = {}) => {
        const { page = 0, size = 20 } = params;
        return api.get('/products/search/flavour', { params: { tag, page, size } });
    },

    // Get top products by rank
    getTopByRank: () => api.get('/products/top/rank'),

    // Get top products by score
    getTopByScore: () => api.get('/products/top/score'),

    // Get product recommendations - gọi trực tiếp service
    getRecommendations: (id) => recommendationAPI.get(`/recommend/${id}`),

    // Get recommendations by text query - semantic search
    getRecommendationsByText: (query, topK = 5) =>
        recommendationAPI.post('/recommend-by-text', { query, top_k: topK }),

    // Search by flavor profile using Cosine Similarity (Backend calculation)
    searchByFlavorProfile: (flavorProfile, topK = 15) =>
        api.post('/products/search/flavor-profile', { ...flavorProfile, topK }),
};

export default api;
