package com.wine.util;

import com.wine.entity.Product;
import com.wine.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

/**
 * Utility class to import data from CSV into database
 * Only runs when initial data import is needed
 * 
 * To use: uncomment the @Component annotation
 */
// @Component
@Slf4j
@RequiredArgsConstructor
public class CSVImporter implements CommandLineRunner {
    
    private final ProductRepository productRepository;
    
    // Path to CSV file
    private static final String CSV_FILE_PATH = "data/products.csv";
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Starting CSV import...");
        
        // Check if data already exists
        long count = productRepository.count();
        if (count > 0) {
            log.info("Database already contains {} products. Skipping import.", count);
            return;
        }
        
        importCSV();
        log.info("CSV import completed successfully!");
    }
    
    private void importCSV() {
        String line;
        int lineNumber = 0;
        int successCount = 0;
        int errorCount = 0;
        
        try (BufferedReader br = new BufferedReader(new FileReader(CSV_FILE_PATH))) {
            // Skip header line
            String header = br.readLine();
            lineNumber++;
            log.info("CSV Header: {}", header);
            
            while ((line = br.readLine()) != null) {
                lineNumber++;
                try {
                    Product product = parseCSVLine(line);
                    productRepository.save(product);
                    successCount++;
                    
                    if (successCount % 100 == 0) {
                        log.info("Imported {} products...", successCount);
                    }
                } catch (Exception e) {
                    errorCount++;
                    log.error("Error parsing line {}: {}", lineNumber, e.getMessage());
                    log.error("Line content: {}", line);
                }
            }
            
            log.info("Import summary: {} successful, {} errors", successCount, errorCount);
            
        } catch (IOException e) {
            log.error("Error reading CSV file: {}", e.getMessage(), e);
        }
    }
    
    private Product parseCSVLine(String line) {
        // Split by comma, but handle commas within quotes
        String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
        
        Product product = new Product();
        
        try {
            // Parse fields in CSV order
            int idx = 0;
            product.setName(cleanValue(values[idx++]));
            product.setIntlName(cleanValue(values[idx++]));
            product.setBrandName(cleanValue(values[idx++]));
            product.setBrandIntlName(cleanValue(values[idx++]));
            product.setYearMonth(cleanValue(values[idx++]));
            product.setRank(parseInteger(values[idx++]));
            product.setScore(parseDouble(values[idx++]));
            product.setF1(parseDouble(values[idx++]));
            product.setF2(parseDouble(values[idx++]));
            product.setF3(parseDouble(values[idx++]));
            product.setF4(parseDouble(values[idx++]));
            product.setF5(parseDouble(values[idx++]));
            product.setF6(parseDouble(values[idx++]));
            product.setFlavourTags(cleanValue(values[idx++]));
            product.setCheckinCount(parseInteger(values[idx++]));
            product.setPictures(cleanValue(values[idx++]));
            product.setSimilarBrands(cleanValue(values[idx++]));
            
            // ID is the last field, but we don't set it as database will auto-generate
            // If you want to keep the original ID from CSV, uncomment the line below:
            // product.setId(parseLong(values[idx]));
            
        } catch (Exception e) {
            throw new RuntimeException("Error parsing product data: " + e.getMessage(), e);
        }
        
        return product;
    }
    
    private String cleanValue(String value) {
        if (value == null) return null;
        // Remove quotes and trim
        return value.trim().replaceAll("^\"|\"$", "");
    }
    
    private Integer parseInteger(String value) {
        try {
            String cleaned = cleanValue(value);
            return (cleaned == null || cleaned.isEmpty()) ? null : Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Double parseDouble(String value) {
        try {
            String cleaned = cleanValue(value);
            return (cleaned == null || cleaned.isEmpty()) ? null : Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Long parseLong(String value) {
        try {
            String cleaned = cleanValue(value);
            return (cleaned == null || cleaned.isEmpty()) ? null : Long.parseLong(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
