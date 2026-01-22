package com.wine.service;

import com.wine.dto.FlavorProfileRequest;
import com.wine.dto.FlavorSearchResult;
import com.wine.dto.ProductResponse;
import com.wine.entity.Product;
import com.wine.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlavorSearchService {

    private final ProductRepository productRepository;

    /**
     * Search products by flavor profile using Cosine Similarity
     * Formula: cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
     */
    public List<FlavorSearchResult> searchByFlavorProfile(FlavorProfileRequest request) {
        // Get all products
        List<Product> allProducts = productRepository.findAll();

        // User's flavor vector
        double[] userVector = {
            request.getF1() != null ? request.getF1() : 0.5,
            request.getF2() != null ? request.getF2() : 0.5,
            request.getF3() != null ? request.getF3() : 0.5,
            request.getF4() != null ? request.getF4() : 0.5,
            request.getF5() != null ? request.getF5() : 0.5,
            request.getF6() != null ? request.getF6() : 0.5
        };

        // Calculate similarity for each product
        List<FlavorSearchResult> results = new ArrayList<>();
        
        for (Product product : allProducts) {
            // Product's flavor vector
            double[] productVector = {
                product.getF1() != null ? product.getF1() : 0.0,
                product.getF2() != null ? product.getF2() : 0.0,
                product.getF3() != null ? product.getF3() : 0.0,
                product.getF4() != null ? product.getF4() : 0.0,
                product.getF5() != null ? product.getF5() : 0.0,
                product.getF6() != null ? product.getF6() : 0.0
            };

            // Calculate cosine similarity
            double similarity = calculateCosineSimilarity(userVector, productVector);

            // Convert to ProductResponse
            ProductResponse productResponse = convertToProductResponse(product);

            // Create result
            String similarityPercent = String.format("%.1f", similarity * 100);
            results.add(new FlavorSearchResult(productResponse, similarity, similarityPercent));
        }

        // Sort by similarity (highest first) and return top K
        return results.stream()
                .sorted(Comparator.comparingDouble(FlavorSearchResult::getSimilarity).reversed())
                .limit(request.getTopK())
                .collect(Collectors.toList());
    }

    /**
     * Calculate Cosine Similarity between two vectors
     * Formula: cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
     */
    private double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException("Vectors must have the same length");
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        // Avoid division by zero
        if (magnitudeA == 0.0 || magnitudeB == 0.0) {
            return 0.0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse convertToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setRank(product.getRank());
        response.setName(product.getName());
        response.setIntlName(product.getIntlName());
        response.setBrandName(product.getBrandName());
        response.setScore(product.getScore());
        response.setCheckinCount(product.getCheckinCount());
        response.setFlavourTags(parseDelimitedString(product.getFlavourTags(), "\\|"));
        response.setPictures(parseDelimitedString(product.getPictures(), "\\|"));
        response.setF1(product.getF1());
        response.setF2(product.getF2());
        response.setF3(product.getF3());
        response.setF4(product.getF4());
        response.setF5(product.getF5());
        response.setF6(product.getF6());
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

}
