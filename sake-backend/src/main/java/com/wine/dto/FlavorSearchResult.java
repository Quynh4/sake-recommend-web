package com.wine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FlavorSearchResult {
    private ProductResponse product;
    private Double similarity;
    private String similarityPercent;
}
