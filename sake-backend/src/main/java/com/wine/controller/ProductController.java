package com.wine.controller;

import com.wine.dto.FlavorProfileRequest;
import com.wine.dto.FlavorSearchResult;
import com.wine.dto.PageResponse;
import com.wine.dto.ProductResponse;
import com.wine.service.FlavorSearchService;
import com.wine.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS from all origins
public class ProductController {
    
    private final ProductService productService;
    private final FlavorSearchService flavorSearchService;
    
    /**
     * GET /api/products
     * Lấy tất cả sản phẩm với phân trang và sắp xếp
     * 
     * @param page số trang (mặc định: 0)
     * @param size số lượng items/trang (mặc định: 20)
     * @param sortBy trường để sắp xếp (mặc định: rank)
     * @param direction hướng sắp xếp: asc/desc (mặc định: asc)
     */
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "rank") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        PageResponse<ProductResponse> response = productService.getAllProducts(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/{id}
     * Lấy chi tiết sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/search
     * Tìm kiếm sản phẩm theo từ khóa (tìm trong tên, brand, flavour tags)
     * 
     * @param keyword từ khóa tìm kiếm
     * @param page số trang
     * @param size số lượng items/trang
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<ProductResponse>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.searchProducts(keyword, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/search/name
     * Tìm kiếm theo tên sản phẩm
     */
    @GetMapping("/search/name")
    public ResponseEntity<PageResponse<ProductResponse>> searchByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.searchByName(name, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/search/brand
     * Tìm kiếm theo brand
     */
    @GetMapping("/search/brand")
    public ResponseEntity<PageResponse<ProductResponse>> searchByBrand(
            @RequestParam String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.searchByBrand(brand, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/filter/rank
     * Lọc sản phẩm theo rank
     * 
     * @param min rank tối thiểu
     * @param max rank tối đa
     */
    @GetMapping("/filter/rank")
    public ResponseEntity<PageResponse<ProductResponse>> filterByRank(
            @RequestParam Integer min,
            @RequestParam Integer max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.filterByRank(min, max, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/filter/score
     * Lọc sản phẩm theo score
     * 
     * @param min score tối thiểu
     * @param max score tối đa
     */
    @GetMapping("/filter/score")
    public ResponseEntity<PageResponse<ProductResponse>> filterByScore(
            @RequestParam Double min,
            @RequestParam Double max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.filterByScore(min, max, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/search/flavour
     * Tìm kiếm theo flavour tag
     */
    @GetMapping("/search/flavour")
    public ResponseEntity<PageResponse<ProductResponse>> searchByFlavour(
            @RequestParam String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResponse<ProductResponse> response = productService.searchByFlavourTag(tag, page, size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/top/rank
     * Lấy top 10 sản phẩm theo rank (rank thấp nhất)
     */
    @GetMapping("/top/rank")
    public ResponseEntity<List<ProductResponse>> getTopByRank() {
        List<ProductResponse> response = productService.getTopByRank();
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/products/top/score
     * Lấy top 10 sản phẩm theo score (score cao nhất)
     */
    @GetMapping("/top/score")
    public ResponseEntity<List<ProductResponse>> getTopByScore() {
        List<ProductResponse> response = productService.getTopByScore();
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/products/search/flavor-profile
     * Search product by flavor profile use Cosine Similarity
     * 
     * Request body:
     * {
     *   "f0": 0.5,
     *   "f1": 0.8,
     *   "f2": 0.3,
     *   "f3": 0.6,
     *   "f4": 0.7,
     *   "f5": 0.4,
     *   "f6": 0.5,
     *   "topK": 15
     * }
     * 
     * Response: List of products sorted by similarity (highest first)
     */
    @PostMapping("/search/flavor-profile")
    public ResponseEntity<List<FlavorSearchResult>> searchByFlavorProfile(
            @RequestBody FlavorProfileRequest request) {
        
        List<FlavorSearchResult> results = flavorSearchService.searchByFlavorProfile(request);
        return ResponseEntity.ok(results);
    }

}
