package com.wine.service;

import com.wine.dto.PageResponse;
import com.wine.dto.ProductResponse;
import com.wine.entity.Product;
import com.wine.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    /**
     * Get all products with pagination
     */
    public PageResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findAll(pageable);
        
        return mapToPageResponse(productPage);
    }
    
    /**
     * Get product details by ID
     */
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }
    
    /**
     * Search products by keyword (name, brand, flavour)
     */
    public PageResponse<ProductResponse> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchAll(keyword, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Search by product name
     */
    public PageResponse<ProductResponse> searchByName(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchByName(name, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Search by brand
     */
    public PageResponse<ProductResponse> searchByBrand(String brand, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchByBrand(brand, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Filter by rank range
     */
    public PageResponse<ProductResponse> filterByRank(Integer minRank, Integer maxRank, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByRankBetween(minRank, maxRank, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Filter by score range
     */
    public PageResponse<ProductResponse> filterByScore(Double minScore, Double maxScore, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByScoreBetween(minScore, maxScore, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Search by flavour tag
     */
    public PageResponse<ProductResponse> searchByFlavourTag(String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByFlavourTag(tag, pageable);
        return mapToPageResponse(productPage);
    }
    
    /**
     * Get top 10 products by rank
     */
    public List<ProductResponse> getTopByRank() {
        return productRepository.findTop10ByOrderByRankAsc()
            .stream()
            .map(this::mapToProductResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get top 10 products by score
     */
    public List<ProductResponse> getTopByScore() {
        return productRepository.findTop10ByOrderByScoreDesc()
            .stream()
            .map(this::mapToProductResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Map Product entity to ProductResponse DTO
     */
    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setIntlName(product.getIntlName());
        response.setBrandName(product.getBrandName());
        response.setBrandIntlName(product.getBrandIntlName());
        response.setYearMonth(product.getYearMonth());
        response.setRank(product.getRank());
        response.setScore(product.getScore());
        response.setF1(product.getF1());
        response.setF2(product.getF2());
        response.setF3(product.getF3());
        response.setF4(product.getF4());
        response.setF5(product.getF5());
        response.setF6(product.getF6());
        response.setCheckinCount(product.getCheckinCount());
        
        // Parse flavour tags (format: |tag1|tag2|tag3|)
        response.setFlavourTags(parseDelimitedString(product.getFlavourTags(), "\\|"));
        
        // Parse pictures (format: url1|url2|url3)
        response.setPictures(parseDelimitedString(product.getPictures(), "\\|"));
        
        // Parse similar brands (format: brand1|brand2|brand3)
        response.setSimilarBrands(parseDelimitedString(product.getSimilarBrands(), "\\|"));
        
        return response;
    }
    
    /**
     * Parse delimited string to List
     */
    private List<String> parseDelimitedString(String str, String delimiter) {
        if (str == null || str.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(str.split(delimiter))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }
    
    /**
     * Map Page<Product> to PageResponse<ProductResponse>
     */
    private PageResponse<ProductResponse> mapToPageResponse(Page<Product> productPage) {
        List<ProductResponse> content = productPage.getContent()
            .stream()
            .map(this::mapToProductResponse)
            .collect(Collectors.toList());
        
        return new PageResponse<>(
            content,
            productPage.getNumber(),
            productPage.getSize(),
            productPage.getTotalElements(),
            productPage.getTotalPages(),
            productPage.isLast(),
            productPage.isFirst()
        );
    }
}
