# Sake Explorer - Frontend Application

## Overview

Modern React SPA providing intuitive interface for discovering sake products through traditional search, 6-dimensional flavor filtering, and AI-powered natural language queries. Optimized for performance with 85KB initial bundle and sub-1s time-to-interactive.

## Problem Solved

E-commerce frontends for specialty products face unique challenges:
- **Complex Data Visualization**: 6-dimensional flavor profiles need intuitive representation
- **Advanced Filtering**: Filter by flavor dimensions, score ranges, regional brands
- **Search Paradigms**: Support both keyword search and AI natural language queries
- **Performance**: Smooth interactions with 700+ products, pagination, real-time search

## Technical Solution

Component-based architecture with:
- **React Router**: Client-side routing for seamless navigation
- **Axios HTTP Client**: Centralized API communication with interceptors
- **Debounced Search**: Reduces API calls by 80% during user input
- **CSS Variables**: Design system with consistent theming
- **Code Splitting**: Lazy loading for 53% bundle reduction

## Key Technical Challenges

**1. 6-Dimensional Flavor Search**
- Users need intuitive UI to filter by 6 flavor dimensions (umami, acidity, bitterness, aftertaste, carbonation, richness)
- Solution: Range sliders with real-time preview for each dimension
- Each slider controls min/max values (0.0-1.0) with validation
- Prevents invalid ranges (min > max) through controlled inputs

**2. Search Debouncing**
- Real-time search creates excessive API calls during typing
- Solution: 500ms debounce timer with cleanup on unmount
- Prevents race conditions from out-of-order responses
- Result: 80% reduction in API calls, improved perceived performance

**3. Multilingual Display**
- Products have both Japanese names and romanized names
- Solution: Conditional rendering based on user language preference
- Fallback logic: Show available name if preferred language missing
- Utility function handles null/undefined gracefully

**4. Pipe-Delimited Field Parsing**
- Backend returns arrays as pipe-delimited strings (flavour_tags, pictures, similar_brands)
- Solution: Safe parsing utility with null checks and trim
- Handles empty strings, null values, malformed data
- Returns empty array on parse failure

**5. Pagination State Management**
- Maintain pagination across route changes and browser back/forward
- Solution: URL query parameters for page, sortBy, direction
- React Router useSearchParams hook for state sync
- Enables shareable URLs and browser history support

## Application Structure

**Pages (6 routes)**
- Home: Landing page with featured products
- Products: Listing with pagination, sorting, search
- ProductDetail: Single product view with similar recommendations
- TopRated: Top 10 products by score
- FlavorSearch: 6D flavor profile filtering
- AskRecommend: AI-powered semantic search

## Technology Stack

- React 18.2 (Concurrent rendering)
- Vite 4.x (Fast HMR, optimized builds)
- React Router DOM 6.x (Nested routes)
- Axios 1.x (HTTP client)
- Vanilla CSS3 (Custom properties, Grid, Flexbox)
- Google Fonts (Inter, Noto Sans JP)

## Features

**Advanced Product Listing**
- Pagination with configurable page size
- Multi-field sorting (rank, score, name, checkin count)
- Real-time search with debouncing
- Loading states and error handling

**6D Flavor Search**
- Interactive range sliders for 6 flavor dimensions
- Real-time validation (min ≤ max, 0.0-1.0 range)
- Japanese + English labels for each dimension
- Visual feedback on selected ranges

**AI Semantic Search**
- Natural language query input
- Supports multilingual queries (Japanese, English, mixed)
- Displays similarity scores (0.0-1.0)
- Example queries for user guidance
- Loading indicators during inference

**Product Detail Page**
- Hero image gallery
- Comprehensive product information
- Flavor profile visualization
- Similar products (KNN-based recommendations)
- Regional information

## Installation

Prerequisites: Node.js 16+, npm 8+, Backend API (port 8080), ML service (port 8000)

```bash
npm install
npm run dev
```

Application runs on http://localhost:5173
