package com.wine.repository;

import com.wine.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Search by product name (name or intlName)
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.intlName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    // Search by brand
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.brandName) LIKE LOWER(CONCAT('%', :brand, '%')) OR " +
           "LOWER(p.brandIntlName) LIKE LOWER(CONCAT('%', :brand, '%'))")
    Page<Product> searchByBrand(@Param("brand") String brand, Pageable pageable);
    
    // Filter by brand name
    Page<Product> findByBrandName(String brandName, Pageable pageable);
    
    // Filter by brand international name
    Page<Product> findByBrandIntlName(String brandIntlName, Pageable pageable);
    
    // Filter by rank range
    Page<Product> findByRankBetween(Integer minRank, Integer maxRank, Pageable pageable);
    
    // Filter by score range
    Page<Product> findByScoreBetween(Double minScore, Double maxScore, Pageable pageable);
    
    // Search by flavour tags
    @Query("SELECT p FROM Product p WHERE LOWER(p.flavourTags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    Page<Product> findByFlavourTag(@Param("tag") String tag, Pageable pageable);
    
    // Comprehensive search (name, brand, flavour)
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.intlName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brandName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brandIntlName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.flavourTags) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchAll(@Param("keyword") String keyword, Pageable pageable);
    
    // Get top products by rank (ascending)
    List<Product> findTop10ByOrderByRankAsc();
    
    // Get top products by score (descending)
    List<Product> findTop10ByOrderByScoreDesc();
}
